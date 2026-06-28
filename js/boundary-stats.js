/**
 * OPIS Boundary Stats & Spatial Analysis Module (Bottom-loaded version)
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
        drawMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        removalMode: true
    });

    // 2b. Opt-in mode: Geoman ignores ALL layers by default.
    // Data layers (pipelines, spills) are never opted in, so Geoman can't
    // snap to, hover, or delete them. Drawn boundary shapes are opted in
    // after creation so the eraser can still remove them.
    // Note: L.PM.setOptIn is a static call, not on the map instance.
    L.PM.setOptIn(true);


    // 3. Listen for when a shape is drawn
    mapInstance.on('pm:create', function(e) {
        // Opt this drawn boundary into Geoman so the eraser can delete it
        e.layer.options.pmIgnore = false;
        L.PM.reInitLayer(e.layer);

        const layer = e.layer;
        const drawnPolygon = layer.toGeoJSON();

        // --- Calculation Counters ---
        let totalLengthInZoneKm = 0;
        let uniqueOperators = new Set();

        let totalSpillsInZone = 0;
        let totalBarrelsSpilled = 0;
        let spillCauses = {};

        // Track breakdowns specific to commodity types
        let crossingBreakdown = {
            'Crude Oil': 0,
            'Natural Gas': 0,
            'Petroleum Product': 0,
            'Other Infrastructure': 0
        };

        // TRACK UNIQUE TRACKS: Keeps segment chunks from double-counting
        let uniqueCrossingsTracker = new Set();

        // Separate layer arrays to prevent calculation leakage / double counting
        const pipelineLayerIds = [
            'geo_json_4b1d758048ef739b6042e56e6cc670cd', // Crude Oil
            'geo_json_9a5a8321701a3d88a35c68c0fc9c3769', // Natural Gas
            'geo_json_90c4b8a9f122b1ea491be72c37d83408', // Petroleum Product
            'geo_json_eb363b4d3f65896b9b385e5518c884e6', 
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
                                
                                // Look for any specific unique pipeline ID key provided by the dataset
                                const assetId = feature.properties.PIPELINE_ID || feature.properties.SUB_SYSTEM || feature.properties.OBJECTID || feature.properties.id || '';
                                
                                // Build a unique grouping key: If there's an asset id use it, otherwise fall back to Operator + PipelineName + Commodity combination
                                const uniqueTrackingKey = assetId ? `${layerId}_${assetId}` : `${layerId}_${opName}_${pipeName}_${commodityRaw}`;

                                // Process type classification attributes
                                const commodity = commodityRaw.toLowerCase();
                                let calculatedCategory = 'Other Infrastructure';
                                
                                if (commodity.includes('crude') || layerId === 'geo_json_4b1d758048ef739b6042e56e6cc670cd') {
                                    calculatedCategory = 'Crude Oil';
                                } else if (commodity.includes('gas') || layerId === 'geo_json_9a5a8321701a3d88a35c68c0fc9c3769') {
                                    calculatedCategory = 'Natural Gas';
                                } else if (commodity.includes('product') || commodity.includes('petroleum') || layerId === 'geo_json_90c4b8a9f122b1ea491be72c37d83408') {
                                    calculatedCategory = 'Petroleum Product';
                                }

                                // ONLY INCREMENT IF WE HAVEN'T MET THIS PIPELINE PATH IN THIS SHAPE YET
                                if (!uniqueCrossingsTracker.has(uniqueTrackingKey)) {
                                    uniqueCrossingsTracker.add(uniqueTrackingKey);
                                    crossingBreakdown[calculatedCategory]++;
                                }

                                if (opName && opName !== 'Unknown Operator') uniqueOperators.add(opName);
                                
                                // Mileage calculations continue on every item to capture overall length sum
                                try {
                                    const clippedSegment = turf.lineSplit(feature, drawnPolygon);
                                    if (clippedSegment.features.length > 0) {
                                        clippedSegment.features.forEach(segment => {
                                            let midpoint = turf.midpoint(segment.geometry.coordinates[0], segment.geometry.coordinates[1]);
                                            if (turf.booleanPointInPolygon(midpoint, drawnPolygon)) {
                                                totalLengthInZoneKm += turf.length(segment, {units: 'kilometers'});
                                            }
                                        });
                                    } else {
                                        totalLengthInZoneKm += turf.length(feature, {units: 'kilometers'});
                                    }
                                } catch (err) {
                                    totalLengthInZoneKm += (feature.properties.Shape_Leng || feature.properties.Shape_Length || 0) * 111;
                                }
                            }
                        }
                    });
                }
            }
        });

        // Sum up total non-duplicated crossings from our separate binned items
        let intersectingPipelinesCount = Object.values(crossingBreakdown).reduce((a, b) => a + b, 0);

        // 4b. Scan INCIDENTS layer exclusively for points
        const spillLayerObj = window[incidentLayerId];
        if (spillLayerObj && typeof spillLayerObj.toGeoJSON === 'function') {
            const spillGeoJSON = spillLayerObj.toGeoJSON();
            if (spillGeoJSON && spillGeoJSON.features) {
                spillGeoJSON.features.forEach(function(feature) {
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
        const totalLengthMiles = totalLengthInZoneKm * 0.621371;
        const avgSpillVolume = totalSpillsInZone > 0 ? (totalBarrelsSpilled / totalSpillsInZone) : 0;
        
        let topCause = "None";
        let maxCauseCount = 0;
        for (const [cause, count] of Object.entries(spillCauses)) {
            if (count > maxCauseCount) {
                maxCauseCount = count;
                topCause = cause;
            }
        }

        const maxCrossings = Math.max(...Object.values(crossingBreakdown), 1);

        // 6. Build the readout popup card layout matching main-ui.css & leaflet-custom.css
        const popupContent = `
            <div style="font-family: 'Inter', -apple-system, sans-serif; min-width: 260px; padding: 4px; color: #1e293b;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <div style="width: 3px; height: 16px; background-color: #3b82f6; border-radius: 2px;"></div>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; letter-spacing: -0.2px;">Boundary Analysis</h4>
                </div>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        Infrastructure in Zone
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #334155;">
                        <div class="crossings-hover-row" style="display: flex; justify-content: space-between; cursor: help;">
                            <span style="color: #64748b; border-bottom: 1px dotted #cbd5e1;">Pipeline Crossings</span>
                            <span style="font-weight: 600; color: #0f172a;">${intersectingPipelinesCount}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Est. Pipe Mileage</span>
                            <span style="font-weight: 600; color: #0f172a;">${totalLengthMiles.toFixed(1)} mi</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Active Operators</span>
                            <span style="font-weight: 600; color: #0f172a;">${uniqueOperators.size}</span>
                        </div>
                    </div>
                </div>

                <div style="background-color: #fdf2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 10px;">
                    <div style="font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        Incident History
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #7f1d1d;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Total Incidents</span>
                            <span style="font-weight: 700; color: #7f1d1d;">${totalSpillsInZone}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Total Vol. Spilled</span>
                            <span style="font-weight: 600; color: #7f1d1d;">${totalBarrelsSpilled.toLocaleString(undefined, {maximumFractionDigits: 1})} bbls</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #991b1b; opacity: 0.8;">Avg. Spill Size</span>
                            <span style="font-weight: 600; color: #7f1d1d;">${avgSpillVolume.toFixed(1)} bbls</span>
                        </div>
                        <div style="border-top: 1px dashed #fca5a5; margin: 4px 0; padding-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #991b1b; opacity: 0.8; font-size: 11.5px;">Primary Cause</span>
                            <span style="font-size: 11px; font-weight: 700; background-color: #fee2e2; padding: 2px 6px; border-radius: 4px; color: #991b1b; text-transform: uppercase;">${topCause}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 1. Bind the popup (don't open yet — need to wire the tooltip first)
        layer.bindPopup(popupContent);

        // 2. Build tracking mouse tooltip
        let mouseTooltip = document.getElementById('crossings-mouse-tooltip');
        if (!mouseTooltip) {
            mouseTooltip = document.createElement('div');
            mouseTooltip.id = 'crossings-mouse-tooltip';
            mouseTooltip.style.cssText = `
                position: fixed;
                z-index: 10000;
                display: none;
                pointer-events: none;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                width: 220px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                font-family: 'Inter', -apple-system, sans-serif;
                color: #1e293b;
            `;
            document.body.appendChild(mouseTooltip);
        }
        
        mouseTooltip.innerHTML = `
            <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Crossings Breakdown
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span style="font-weight: 500;">Crude Oil</span>
                        <span style="font-weight: 600; color: #0f172a;">${crossingBreakdown['Crude Oil']}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(crossingBreakdown['Crude Oil'] / maxCrossings) * 100}%; height: 100%; background: #e11d48;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span style="font-weight: 500;">Natural Gas</span>
                        <span style="font-weight: 600; color: #0f172a;">${crossingBreakdown['Natural Gas']}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(crossingBreakdown['Natural Gas'] / maxCrossings) * 100}%; height: 100%; background: #2563eb;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span style="font-weight: 500;">Petroleum Product</span>
                        <span style="font-weight: 600; color: #0f172a;">${crossingBreakdown['Petroleum Product']}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(crossingBreakdown['Petroleum Product'] / maxCrossings) * 100}%; height: 100%; background: #16a34a;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                        <span style="font-weight: 500;">Other Infrastructure</span>
                        <span style="font-weight: 600; color: #0f172a;">${crossingBreakdown['Other Infrastructure']}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(crossingBreakdown['Other Infrastructure'] / maxCrossings) * 100}%; height: 100%; background: #475569;"></div>
                    </div>
                </div>
            </div>
        `;

        // 3. Attach interactive trackers to row
        function wireHoverRow() {
            const popupContainer = layer.getPopup()._container;
            if (!popupContainer) return;
            const hoverRow = popupContainer.querySelector('.crossings-hover-row');
            if (!hoverRow) return;

            hoverRow.addEventListener('mouseenter', function() {
                mouseTooltip.style.display = 'block';
            });
            hoverRow.addEventListener('mousemove', function(event) {
                mouseTooltip.style.left = (event.clientX + 15) + 'px';
                mouseTooltip.style.top = (event.clientY + 15) + 'px';
            });
            hoverRow.addEventListener('mouseleave', function() {
                mouseTooltip.style.display = 'none';
            });
        }

        // Open the popup now — _container is available immediately after this call
        layer.openPopup();
        wireHoverRow();

        // Re-wire when popup is reopened after being moved/closed by a new boundary click
        mapInstance.on('popupopen', function onPopupOpen(e) {
            if (e.popup !== layer.getPopup()) return;
            wireHoverRow();
        });

        layer.getPopup().on('remove', function() {
            if (mouseTooltip) mouseTooltip.style.display = 'none';
        });
    });
});