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

    // 3. Listen for when a shape is drawn
    mapInstance.on('pm:create', function(e) {
        const layer = e.layer;
        const drawnPolygon = layer.toGeoJSON();

        // --- Calculation Counters ---
        let intersectingPipelinesCount = 0;
        let totalLengthInZoneKm = 0;
        let uniqueOperators = new Set();

        let totalSpillsInZone = 0;
        let totalBarrelsSpilled = 0;
        let spillCauses = {};

        // List of all global layer variables Folium injected into your app
        const foliumLayerIds = [
            'geo_json_4b1d758048ef739b6042e56e6cc670cd', // Crude Oil
            'geo_json_9a5a8321701a3d88a35c68c0fc9c3769', // Natural Gas
            'geo_json_90c4b8a9f122b1ea491be72c37d83408', // Petroleum Product
            'geo_json_eb363b4d3f65896b9b385e5518c884e6', 
            'geo_json_8612f9cc589b10bf76787f9aa4f0fd37', // Submarine
            'geo_json_223786fa07ce4c645e9aa632279edd6d', // Storage Tanks
            'geo_json_e1820dc43496457f7e8df085b7bfdaa6', // Intermodal Freight
            'geo_json_74a8ff648bc5b9190beaecc887f54037'  // Spills Layer
        ];

        // 4. Loop through each live layer map object and inspect its data features
        foliumLayerIds.forEach(function(layerId) {
            const liveLayer = window[layerId];
            
            // Make sure the layer exists and has data inside it
            if (liveLayer && typeof liveLayer.toGeoJSON === 'function') {
                const layerGeoJSON = liveLayer.toGeoJSON();
                
                if (layerGeoJSON && layerGeoJSON.features) {
                    layerGeoJSON.features.forEach(function(feature) {
                        
                        // --- Process Pipeline Paths (Lines) ---
                        if (feature.geometry && (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')) {
                            if (turf.booleanIntersects(feature, drawnPolygon)) {
                                intersectingPipelinesCount++;
                                
                                const opName = feature.properties.Opername || feature.properties.operator || feature.properties.opername;
                                if (opName) uniqueOperators.add(opName);
                                
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
                        
                        // --- Process PHMSA Historical Incidents (Points) ---
                        else if (feature.geometry && feature.geometry.type === 'Point') {
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
        });

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
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Pipeline Crossings</span>
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

        layer.bindPopup(popupContent).openPopup();
    });
});