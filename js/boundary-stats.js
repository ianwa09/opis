/**
 * Boundary Stats & Spatial Analysis Module (Bottom-loaded version)
 * Grabs loaded Folium layers and calculates custom metrics inside a drawn zone.
 */

window.addEventListener('load', function() {
    // 1. Grab your global map object
    const mapInstance = window.map_10b250abf3b9fb60cf6682f90e22c04c;
    if (!mapInstance) {
        console.error("Spatial Analyzer: Map instance not found.");
        return;
    }

    // 2. Mount the Geoman drawing controls to the upper left
    mapInstance.pm.addControls({
        position: 'topleft',
        drawCircleMarker: false,
        drawCircle: false,
        drawText: false,
        drawMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        removalMode: true
    });


    // 2b. Opt-in mode: Geoman ignores ALL layers by default.
    // Data layers are never opted in so Geoman can't snap/hover/delete them.
    // Drawn boundary shapes are opted in after creation so the eraser still works.
    L.PM.setOptIn(true);

    function registerBoundaryLayer(layer) {
        const needsGeomanInit = layer.options.pmIgnore !== false || !layer.pm;
        layer.options.pmIgnore = false;
        layer.options.interactive = true;
        layer._opisBoundary = true;
        if (needsGeomanInit) L.PM.reInitLayer(layer);

        if (layer.pm && typeof layer.pm.setOptions === 'function') {
            layer.pm.setOptions({
                allowEditing: true,
                allowRemoval: true
            });
        }

        if (layer._path) {
            L.DomUtil.addClass(layer._path, 'opis-drawn-boundary');
        }

        // The generated pipeline paths are brought forward elsewhere for map
        // visibility. Return the boundary to the top so it receives pointer
        // events while editing or erasing.
        if (typeof layer.bringToFront === 'function') {
            layer.bringToFront();
        }

        // Geoman normally handles the removal click. This guarded fallback
        // covers browsers that leave the path in a stale edit cursor state.
        if (!layer._opisRemovalFallbackBound) {
            layer._opisRemovalFallbackBound = true;
            layer.on('click', function() {
                if (!mapInstance.pm.globalRemovalModeEnabled()) return;
                setTimeout(function() {
                    if (
                        mapInstance.hasLayer(layer) &&
                        layer.pm &&
                        typeof layer.pm.remove === 'function'
                    ) {
                        layer.pm.remove();
                    }
                }, 0);
            });
        }
    }


    // Turf's lineSplit accepts LineStrings, so measure multipart geometry one
    // line at a time. Only pieces inside the boundary contribute to mileage.
    function lengthInBoundaryKm(feature, boundary) {
        let lengthKm = 0;
        turf.flattenEach(feature, function(line) {
            const split = turf.lineSplit(line, boundary);
            const pieces = split.features.length ? split.features : [line];
            pieces.forEach(function(piece) {
                const coordinates = piece.geometry.coordinates;
                // Use a point on the piece's first nonzero edge, staying on
                // the mapped route even when it curves or follows an edge.
                for (let i = 1; i < coordinates.length; i++) {
                    const start = coordinates[i - 1];
                    const end = coordinates[i];
                    if (start[0] === end[0] && start[1] === end[1]) continue;
                    const sample = turf.point([
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2
                    ]);
                    if (turf.booleanPointInPolygon(sample, boundary)) {
                        lengthKm += turf.length(piece, { units: 'kilometers' });
                    }
                    break;
                }
            });
        });
        return lengthKm;
    }

    // 3. Reusable function to calculate metrics and update/open the popup
    function runBoundaryAnalysis(layer) {
        registerBoundaryLayer(layer);
        const previousBoundary = window.opisActiveBoundaryLayer;
        if (
            previousBoundary &&
            previousBoundary !== layer &&
            typeof previousBoundary.setStyle === 'function'
        ) {
            previousBoundary.setStyle({ color: '#3388ff', weight: 3 });
        }
        if (typeof layer.setStyle === 'function') {
            layer.setStyle({ color: '#f59e0b', weight: 4 });
        }
        if (typeof layer.bringToFront === 'function') {
            layer.bringToFront();
        }
        window.opisActiveBoundaryLayer = layer;

        const drawnPolygon = layer.toGeoJSON();

        // --- Calculation Counters ---
        let unmeasuredPipelineFeatures = 0;
        let uniqueOperators = new Set();

        let totalSpillsInZone = 0;
        let totalBarrelsSpilled = 0;
        let spillCauses = {};

        // Track breakdowns specific to commodity types
        let crossingBreakdown = {
            'Crude Oil': 0,
            'Natural Gas': 0,
            'Petroleum Product': 0,
            'Hydrocarbon Gas Liquids': 0,
            'Other Infrastructure': 0
        };
        const mileageBreakdown = Object.fromEntries(
            Object.keys(crossingBreakdown).map(category => [category, 0])
        );
        const mileageCoverage = 'Measures all five mapped line layers, including hidden layers. The national 3.3 million-mile figure includes local gas distribution and gathering networks that these archived routes do not comprehensively cover. Other Infrastructure includes submarine pipes that may carry water, sewage, or unknown products.';

        // TRACK UNIQUE TRACKS: Keeps segment chunks from double-counting
        let uniqueCrossingsTracker = new Set();

        // Separate layer arrays to prevent calculation leakage / double counting
        const pipelineLayerIds = [
            'geo_json_4b1d758048ef739b6042e56e6cc670cd', // Crude Oil
            'geo_json_9a5a8321701a3d88a35c68c0fc9c3769', // Natural Gas
            'geo_json_90c4b8a9f122b1ea491be72c37d83408', // Petroleum Product
            'geo_json_eb363b4d3f65896b9b385e5518c884e6', // Hydrocarbon Gas Liquids
            'geo_json_8612f9cc589b10bf76787f9aa4f0fd37'  // Submarine
        ];
        
        const incidentLayerId = 'geo_json_74a8ff648bc5b9190beaecc887f54037'; // Spills Layer ONLY

        // 4a. Loop through PIPELINES layers exclusively for lines
        pipelineLayerIds.forEach(function(layerId) {
            const liveLayer = window[layerId];
            if (liveLayer && typeof liveLayer.toGeoJSON === 'function') {
                const layerGeoJSON = liveLayer.toGeoJSON();
                if (layerGeoJSON && layerGeoJSON.features) {
                    layerGeoJSON.features.forEach(function(feature) {
                        if (feature.geometry && (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')) {
                            if (turf.booleanIntersects(feature, drawnPolygon)) {
                                
                                const opName = feature.properties.Opername || feature.properties.operator || feature.properties.opername || 'Unknown Operator';
                                const pipeName = feature.properties.Pipename || feature.properties.pipename || '';
                                const commodityRaw = feature.properties.COMMODITY || feature.properties.commodity || '';
                                
                                const assetId = feature.properties.PIPELINE_ID || feature.properties.SUB_SYSTEM || feature.properties.OBJECTID || feature.properties.id || '';
                                const uniqueTrackingKey = assetId ? `${layerId}_${assetId}` : `${layerId}_${opName}_${pipeName}_${commodityRaw}`;

                                const commodity = commodityRaw.toLowerCase();
                                let calculatedCategory = 'Other Infrastructure';
                                
                                if (commodity.includes('crude') || layerId === 'geo_json_4b1d758048ef739b6042e56e6cc670cd') {
                                    calculatedCategory = 'Crude Oil';
                                } else if (layerId === 'geo_json_eb363b4d3f65896b9b385e5518c884e6') {
                                    calculatedCategory = 'Hydrocarbon Gas Liquids';
                                } else if (commodity.includes('gas') || layerId === 'geo_json_9a5a8321701a3d88a35c68c0fc9c3769') {
                                    calculatedCategory = 'Natural Gas';
                                } else if (commodity.includes('product') || commodity.includes('petroleum') || layerId === 'geo_json_90c4b8a9f122b1ea491be72c37d83408') {
                                    calculatedCategory = 'Petroleum Product';
                                }

                                if (!uniqueCrossingsTracker.has(uniqueTrackingKey)) {
                                    uniqueCrossingsTracker.add(uniqueTrackingKey);
                                    crossingBreakdown[calculatedCategory]++;
                                }

                                if (opName && opName !== 'Unknown Operator') uniqueOperators.add(opName);
                                
                                try {
                                    mileageBreakdown[calculatedCategory] += lengthInBoundaryKm(feature, drawnPolygon) * 0.621371;
                                } catch (err) {
                                    // Source length fields have inconsistent units and
                                    // describe the entire feature, not the clipped route.
                                    unmeasuredPipelineFeatures++;
                                    console.warn('Boundary mileage: could not measure a pipeline feature.', err);
                                }
                            }
                        }
                    });
                }
            }
        });

        let intersectingPipelinesCount = Object.values(crossingBreakdown).reduce((a, b) => a + b, 0);

        // 4b. Scan INCIDENTS layer exclusively for points
        const spillLayerObj = window[incidentLayerId];
        if (spillLayerObj && typeof spillLayerObj.toGeoJSON === 'function') {
            // Use the original embedded coordinates when available. Rendered
            // markers may be offset slightly to separate coincident incidents.
            const spillFeatures = typeof window.getFilteredSpillFeaturesForExport === 'function'
                ? window.getFilteredSpillFeaturesForExport()
                : (spillLayerObj.toGeoJSON().features || []);
            if (spillFeatures) {
                spillFeatures.forEach(function(feature) {
                    if (feature.geometry && feature.geometry.type === 'Point') {
                        if (turf.booleanPointInPolygon(feature, drawnPolygon)) {
                            totalSpillsInZone++;
                            const bbls = parseFloat(feature.properties.UNINTENTIONAL_RELEASE_BBLS || 0);
                            totalBarrelsSpilled += bbls;
                            const cause = feature.properties.CAUSE || "Facility Asset";
                            spillCauses[cause] = (spillCauses[cause] || 0) + 1;
                        }
                    }
                });
            }
        }

        // 5. Final math translations
        const totalLengthMiles = Object.values(mileageBreakdown).reduce((sum, miles) => sum + miles, 0);
        const avgSpillVolume = totalSpillsInZone > 0 ? (totalBarrelsSpilled / totalSpillsInZone) : 0;
        
        let topCause = "None";
        let maxCauseCount = 0;
        let topCauseCount = 0;
        for (const [cause, count] of Object.entries(spillCauses)) {
            if (count > maxCauseCount) {
                maxCauseCount = count;
                topCause = cause;
                topCauseCount = 1;
            } else if (count === maxCauseCount) {
                topCauseCount++;
            }
        }
        if (topCauseCount > 1) topCause = "Multiple";

        const mileageWarning = unmeasuredPipelineFeatures > 0
            ? `${unmeasuredPipelineFeatures} intersecting feature(s) could not be measured and are excluded from mileage.`
            : '';
        const boundaryExportId = L.stamp(layer);
        window.opisBoundaryAnalyses = window.opisBoundaryAnalyses || {};
        window.opisBoundaryAnalyses[boundaryExportId] = {
            generatedAt: new Date().toISOString(),
            boundary: drawnPolygon,
            infrastructure: {
                pipelineCrossings: intersectingPipelinesCount,
                estimatedPipelineMiles: totalLengthMiles,
                activeOperatorCount: uniqueOperators.size,
                activeOperators: Array.from(uniqueOperators).sort(),
                crossingsByType: Object.assign({}, crossingBreakdown),
                estimatedPipelineMilesByType: Object.assign({}, mileageBreakdown),
                mileageCoverage: mileageCoverage,
                unmeasuredPipelineFeatures: unmeasuredPipelineFeatures
            },
            incidents: {
                totalIncidents: totalSpillsInZone,
                totalBarrelsSpilled: totalBarrelsSpilled,
                averageSpillBarrels: avgSpillVolume,
                primaryCause: topCause,
                incidentsByCause: Object.assign({}, spillCauses)
            }
        };

        // 6. Build the readout popup card layout
        const popupContent = `
            <div style="font-family: 'Inter', -apple-system, sans-serif; min-width: 260px; padding: 4px; color: #20262b;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #20262b; letter-spacing: 0;">Boundary analysis</h4>
                </div>
                <div style="background-color: #f5f6f7; border: 1px solid #e4e6e8; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                    <div style="font-size: 12px; font-weight: 600; color: #68727d; text-transform: none; letter-spacing: 0; margin-bottom: 8px;">Infrastructure in zone</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #4c555e;">
                        <div class="crossings-hover-row" style="display: flex; justify-content: space-between; cursor: help;">
                            <span style="color: #68727d; border-bottom: 1px dotted #c4c9ce;">Pipeline crossings</span>
                            <span style="font-weight: 600; color: #20262b;">${intersectingPipelinesCount}</span>
                        </div>
                        <div class="mileage-hover-row" tabindex="0" aria-label="Estimated mapped mileage by pipeline type" style="display: flex; justify-content: space-between; cursor: help;">
                            <span style="color: #68727d; border-bottom: 1px dotted #c4c9ce;">Est. mapped mileage</span>
                            <span style="font-weight: 600; color: #20262b;">${totalLengthMiles.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} mi</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #68727d;">Active operators</span>
                            <span style="font-weight: 600; color: #20262b;">${uniqueOperators.size}</span>
                        </div>
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; line-height: 1.4; color: #68727d;">All mapped types; coverage is incomplete.${mileageWarning ? ' ' + mileageWarning : ''}</div>
                </div>
                <div style="background-color: #fdf2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 12px; font-weight: 600; color: #991b1b; text-transform: none; letter-spacing: 0; margin-bottom: 8px;">Incident history</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #7f1d1d;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Total incidents</span>
                            <span style="font-weight: 600; color: #7f1d1d;">${totalSpillsInZone}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Total volume spilled</span>
                            <span style="font-weight: 600; color: #7f1d1d;">${totalBarrelsSpilled.toLocaleString(undefined, {maximumFractionDigits: 1})} bbls</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Average spill size</span>
                            <span style="font-weight: 600; color: #7f1d1d;">${avgSpillVolume.toFixed(1)} bbls</span>
                        </div>
                        <div class="cause-hover-row" style="border-top: 1px dashed #fca5a5; margin: 4px 0; padding-top: 4px; display: flex; justify-content: space-between; align-items: center; cursor: help;">
                            <span style="color: #991b1b; opacity: 0.8; font-size: 12px; border-bottom: 1px dotted #fca5a5;">Primary cause</span>
                            <span style="font-size: 12px; font-weight: 600; background-color: #fee2e2; padding: 2px 8px; border-radius: 4px; color: #991b1b; text-transform: none;">${topCause}</span>
                        </div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                    <button type="button" onclick="window.exportOpisBoundary(${boundaryExportId}, 'csv')" style="padding: 8px; border: 1px solid #c4c9ce; border-radius: 6px; background: #f5f6f7; color: #4c555e; font-size: 12px; font-weight: 600; cursor: pointer;">
                        <i class="bi bi-filetype-csv"></i> Export CSV
                    </button>
                    <button type="button" onclick="window.exportOpisBoundary(${boundaryExportId}, 'json')" style="padding: 8px; border: 1px solid #c4c9ce; border-radius: 6px; background: #f5f6f7; color: #4c555e; font-size: 12px; font-weight: 600; cursor: pointer;">
                        <i class="bi bi-braces"></i> Export JSON
                    </button>
                </div>
            </div>
        `;

        // Tooltip generation logic
        let mouseTooltip = document.getElementById('crossings-mouse-tooltip');
        if (!mouseTooltip) {
            mouseTooltip = document.createElement('div');
            mouseTooltip.id = 'crossings-mouse-tooltip';
            mouseTooltip.style.cssText = "position: fixed; z-index: 10000; display: none; pointer-events: none; background: #ffffff; border: 1px solid #e4e6e8; border-radius: 8px; padding: 12px; width: 220px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-family: 'Inter', -apple-system, sans-serif; color: #20262b;";
            document.body.appendChild(mouseTooltip);
        }

        let mileageTooltip = document.getElementById('mileage-mouse-tooltip');
        if (!mileageTooltip) {
            mileageTooltip = document.createElement('div');
            mileageTooltip.id = 'mileage-mouse-tooltip';
            mileageTooltip.setAttribute('role', 'tooltip');
            mileageTooltip.style.cssText = "position: fixed; z-index: 10000; display: none; pointer-events: none; background: #ffffff; border: 1px solid #e4e6e8; border-radius: 8px; padding: 12px; width: 260px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-family: 'Inter', -apple-system, sans-serif; color: #20262b;";
            document.body.appendChild(mileageTooltip);
        }

        let causeTooltip = document.getElementById('cause-mouse-tooltip');
        if (!causeTooltip) {
            causeTooltip = document.createElement('div');
            causeTooltip.id = 'cause-mouse-tooltip';
            causeTooltip.style.cssText = "position: fixed; z-index: 10000; display: none; pointer-events: none; background: #ffffff; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px; width: 230px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); font-family: 'Inter', -apple-system, sans-serif; color: #20262b;";
            document.body.appendChild(causeTooltip);
        }
        
        const pipelineColors = ['#c76a32', '#397ca1', '#88629f', '#a27618', '#288577'];
        function pipelineBreakdownHtml(title, breakdown, formatValue) {
            const maxValue = Math.max(...Object.values(breakdown), 1);
            return `
                <div style="font-size: 12px; font-weight: 600; color: #68727d; text-transform: none; letter-spacing: 0; margin-bottom: 8px;">${title}</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${Object.entries(breakdown).map(([category, value], i) => `
                        <div>
                            <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 12px; margin-bottom: 2px;"><span>${category}</span><span style="font-weight: 600; color: #20262b; white-space: nowrap;">${formatValue(value)}</span></div>
                            <div style="width: 100%; height: 6px; background: #eef0f2; border-radius: 3px; overflow: hidden;"><div style="width: ${(value / maxValue) * 100}%; height: 100%; background: ${pipelineColors[i]};"></div></div>
                        </div>`).join('')}
                </div>`;
        }
        mouseTooltip.innerHTML = pipelineBreakdownHtml('Crossings by pipeline type', crossingBreakdown, value => value);
        mileageTooltip.innerHTML = pipelineBreakdownHtml('Mapped mileage by type', mileageBreakdown,
            value => value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' mi'
        );

        const sortedCauses = Object.entries(spillCauses).sort((a, b) => b[1] - a[1]);
        const maxCauseVal = sortedCauses.length > 0 ? sortedCauses[0][1] : 1;
        const causeColors = ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'];
        causeTooltip.innerHTML = `
            <div style="font-size: 12px; font-weight: 600; color: #68727d; text-transform: none; letter-spacing: 0; margin-bottom: 8px;">Incidents by cause</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${sortedCauses.length === 0
                    ? '<div style="font-size: 12px; color: #68727d;">No incidents in zone</div>'
                    : sortedCauses.map(([cause, count], i) => `
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;"><span style="font-weight: 500;">${cause}</span><span style="font-weight: 600; color: #20262b;">${count}</span></div>
                            <div style="width: 100%; height: 6px; background: #eef0f2; border-radius: 3px; overflow: hidden;"><div style="width: ${(count / maxCauseVal) * 100}%; height: 100%; background: ${causeColors[Math.min(i, causeColors.length - 1)]};"></div></div>
                        </div>`).join('')
                }
            </div>
        `;

        function wireHoverRow() {
            const popupContainer = layer.getPopup()._container;
            if (!popupContainer) return;

            const hoverRow = popupContainer.querySelector('.crossings-hover-row');
            if (hoverRow) {
                hoverRow.addEventListener('mouseenter', () => mouseTooltip.style.display = 'block');
                hoverRow.addEventListener('mousemove', (e) => {
                    mouseTooltip.style.left = (e.clientX + 15) + 'px';
                    mouseTooltip.style.top = (e.clientY + 15) + 'px';
                });
                hoverRow.addEventListener('mouseleave', () => mouseTooltip.style.display = 'none');
            }

            const mileageRow = popupContainer.querySelector('.mileage-hover-row');
            if (mileageRow) {
                mileageRow.setAttribute('aria-describedby', mileageTooltip.id);
                function showMileageTooltip(event) {
                    mileageTooltip.style.display = 'block';
                    const rowBounds = mileageRow.getBoundingClientRect();
                    const left = event.type === 'focus' ? rowBounds.right : event.clientX;
                    const top = event.type === 'focus' ? rowBounds.top : event.clientY;
                    mileageTooltip.style.left = Math.max(8, Math.min(left + 15, window.innerWidth - mileageTooltip.offsetWidth - 8)) + 'px';
                    mileageTooltip.style.top = Math.max(8, Math.min(top + 15, window.innerHeight - mileageTooltip.offsetHeight - 8)) + 'px';
                }
                mileageRow.addEventListener('mouseenter', showMileageTooltip);
                mileageRow.addEventListener('mousemove', showMileageTooltip);
                mileageRow.addEventListener('focus', showMileageTooltip);
                mileageRow.addEventListener('mouseleave', () => mileageTooltip.style.display = 'none');
                mileageRow.addEventListener('blur', () => mileageTooltip.style.display = 'none');
                mileageRow.addEventListener('keydown', event => {
                    if (event.key === 'Escape') mileageTooltip.style.display = 'none';
                });
            }

            const causeRow = popupContainer.querySelector('.cause-hover-row');
            if (causeRow) {
                causeRow.addEventListener('mouseenter', () => causeTooltip.style.display = 'block');
                causeRow.addEventListener('mousemove', (e) => {
                    causeTooltip.style.left = (e.clientX + 15) + 'px';
                    causeTooltip.style.top = (e.clientY + 15) + 'px';
                });
                causeRow.addEventListener('mouseleave', () => causeTooltip.style.display = 'none');
            }
        }

        // Bind content dynamically, force update if already open, then attach events
        layer.bindPopup(popupContent);
        if (layer.isPopupOpen()) {
            layer.setPopupContent(popupContent);
        } else {
            layer.openPopup();
        }
        wireHoverRow();

        // Bind closing hooks for tooltips
        layer.getPopup().on('remove', function() {
            if (mouseTooltip) mouseTooltip.style.display = 'none';
            if (mileageTooltip) mileageTooltip.style.display = 'none';
            if (causeTooltip) causeTooltip.style.display = 'none';
        });
        document.dispatchEvent(new CustomEvent('opis:boundarychange'));
    }

    window.recalculateOpisBoundaryAnalysis = function(layerId) {
        const boundaryLayer = mapInstance._layers[layerId];
        if (!boundaryLayer || typeof boundaryLayer.toGeoJSON !== 'function') return null;
        runBoundaryAnalysis(boundaryLayer);
        return window.opisBoundaryAnalyses && window.opisBoundaryAnalyses[layerId];
    };

    mapInstance.on('pm:create', function(e) {
        const layer = e.layer;
        registerBoundaryLayer(layer);

        // Z-Index layer management
        const dataFeatureGroups = [
            'feature_group_5b0dfed6baae0869165359db3af8c544',
            'feature_group_d79a63b58ef60015b33a0f6e11d5dd61',
            'feature_group_40bced8c6f59d655fde0781991531044',
            'feature_group_357123ba0331538e411a1b41ab21294c',
            'feature_group_e70ec41a953fce78fa54a7028d1d3046',
            'feature_group_f4540c23926000afe26df47786ce488e',
            'feature_group_e4a7cd78a21b50f69a050c24ccfdfa61',
            'feature_group_1d77eab727291666943a06c2652de70b',
        ];
        dataFeatureGroups.forEach(id => {
            var lg = window[id];
            if (lg && typeof lg.bringToFront === 'function') lg.bringToFront();
        });
        layer.bringToFront();

        // Run analysis on creation
        runBoundaryAnalysis(layer);

        // Listen for vertex changes/edits or when the entire shape is moved/dragged
        layer.on('pm:edit pm:dragend', function() {
            runBoundaryAnalysis(layer);
        });

        // Ensure hover elements re-wire safely if the user closes and re-clicks the layer
        mapInstance.on('popupopen', function onPopupOpen(evt) {
            if (evt.popup === layer.getPopup()) {
                runBoundaryAnalysis(layer);
            }
        });
    });

    mapInstance.on('pm:globalremovalmodetoggled', function(e) {
        mapInstance.getContainer().classList.toggle('opis-removal-mode', e.enabled);
        if (e.enabled) mapInstance.closePopup();

        mapInstance.eachLayer(function(layer) {
            if (!layer._opisBoundary) return;
            registerBoundaryLayer(layer);
        });
    });

    mapInstance.on('pm:remove', function(e) {
        if (window.opisActiveBoundaryLayer === e.layer) {
            window.opisActiveBoundaryLayer = null;
            document.dispatchEvent(new CustomEvent('opis:boundarychange'));
        }
        const removedId = L.stamp(e.layer);
        if (window.opisBoundaryAnalyses) delete window.opisBoundaryAnalyses[removedId];
    });
});
