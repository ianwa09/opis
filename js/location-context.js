(function (global) {
    'use strict';

    var DATA = global.OPISLocationContextData;
    var hydroCache = {};
    var HYDRO_SERVICE =
        'https://hydro.nationalmap.gov/arcgis/rest/services/' +
        'NHDPlus_HR/MapServer';

    function gridKey(longitude, latitude) {
        return Math.floor(longitude) + ',' + Math.floor(latitude);
    }

    function distanceKm(aLongitude, aLatitude, bLongitude, bLatitude) {
        var meanLatitude = (aLatitude + bLatitude) * Math.PI / 360;
        var dx = (bLongitude - aLongitude) * 111.320 * Math.cos(meanLatitude);
        var dy = (bLatitude - aLatitude) * 110.574;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function lookupCensus(latitude, longitude) {
        if (!DATA || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
        }
        var longitudeCell = Math.floor(longitude);
        var latitudeCell = Math.floor(latitude);
        var nearest = null;
        var nearestDistance = Infinity;
        for (var dx = -1; dx <= 1; dx += 1) {
            for (var dy = -1; dy <= 1; dy += 1) {
                var rows = DATA.cells[
                    (longitudeCell + dx) + ',' + (latitudeCell + dy)
                ] || [];
                rows.forEach(function (row) {
                    var distance = distanceKm(
                        longitude,
                        latitude,
                        row[0],
                        row[1]
                    );
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearest = row;
                    }
                });
            }
        }
        if (!nearest || nearestDistance > 5) return null;
        var context = DATA.contexts[nearest[2]];
        if (!context) return null;
        function inverseLog(value) {
            return Number.isFinite(value) ? Math.expm1(value) : null;
        }
        return {
            matched: true,
            populationDensityLog: context[0],
            housingDensityLog: context[1],
            medianHouseholdIncomeLog: context[2],
            tractGeoid: context[3],
            populationDensityPerSqKm: inverseLog(context[0]),
            housingDensityPerSqKm: inverseLog(context[1]),
            medianHouseholdIncome: inverseLog(context[2]),
            lookupDistanceKm: nearestDistance,
            sourceVintage: DATA.sourceVintage
        };
    }

    function pointSegmentDistance(longitude, latitude, start, stop) {
        var ax = (start[0] - longitude) * 111.320 *
            Math.cos((start[1] + latitude) * Math.PI / 360);
        var ay = (start[1] - latitude) * 110.574;
        var bx = (stop[0] - longitude) * 111.320 *
            Math.cos((stop[1] + latitude) * Math.PI / 360);
        var by = (stop[1] - latitude) * 110.574;
        var dx = bx - ax;
        var dy = by - ay;
        if (dx === 0 && dy === 0) return Math.sqrt(ax * ax + ay * ay);
        var fraction = Math.max(
            0,
            Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy))
        );
        var x = ax + fraction * dx;
        var y = ay + fraction * dy;
        return Math.sqrt(x * x + y * y);
    }

    function lineDistance(longitude, latitude, coordinates) {
        var minimum = Infinity;
        for (var index = 1; index < coordinates.length; index += 1) {
            minimum = Math.min(
                minimum,
                pointSegmentDistance(
                    longitude,
                    latitude,
                    coordinates[index - 1],
                    coordinates[index]
                )
            );
        }
        return minimum;
    }

    function ringContains(longitude, latitude, ring) {
        var inside = false;
        var previous = ring[ring.length - 1];
        ring.forEach(function (current) {
            if ((previous[1] > latitude) !== (current[1] > latitude)) {
                var crossing = (
                    (current[0] - previous[0])
                    * (latitude - previous[1])
                    / (current[1] - previous[1])
                    + previous[0]
                );
                if (longitude < crossing) inside = !inside;
            }
            previous = current;
        });
        return inside;
    }

    function geometryDistance(longitude, latitude, geometry) {
        var coordinates = geometry.coordinates || [];
        if (geometry.type === 'LineString') {
            return lineDistance(longitude, latitude, coordinates);
        }
        if (geometry.type === 'MultiLineString') {
            return Math.min.apply(null, coordinates.map(function (line) {
                return lineDistance(longitude, latitude, line);
            }));
        }
        if (geometry.type === 'Polygon') {
            if (coordinates[0] && ringContains(
                longitude,
                latitude,
                coordinates[0]
            )) return 0;
            return Math.min.apply(null, coordinates.map(function (ring) {
                return lineDistance(longitude, latitude, ring);
            }));
        }
        if (geometry.type === 'MultiPolygon') {
            return Math.min.apply(null, coordinates.map(function (polygon) {
                return geometryDistance(longitude, latitude, {
                    type: 'Polygon',
                    coordinates: polygon
                });
            }));
        }
        return Infinity;
    }

    function hydroQuery(layerId, latitude, longitude) {
        var parameters = new URLSearchParams({
            where: 'ftype <> 428',
            geometry: longitude + ',' + latitude,
            geometryType: 'esriGeometryPoint',
            inSR: '4326',
            spatialRel: 'esriSpatialRelIntersects',
            distance: '10000',
            units: 'esriSRUnit_Meter',
            outFields: 'ftype,fcode,gnis_name',
            returnGeometry: 'true',
            outSR: '4326',
            f: 'geojson'
        });
        var controller = new AbortController();
        var timeout = setTimeout(function () {
            controller.abort();
        }, 12000);
        return fetch(
            HYDRO_SERVICE + '/' + layerId + '/query?' + parameters.toString(),
            { signal: controller.signal }
        ).then(function (response) {
            if (!response.ok) throw new Error('USGS request failed');
            return response.json();
        }).finally(function () {
            clearTimeout(timeout);
        });
    }

    function fetchHydro(latitude, longitude) {
        var key = latitude.toFixed(5) + ',' + longitude.toFixed(5);
        if (hydroCache[key]) return hydroCache[key];
        hydroCache[key] = Promise.all([
            hydroQuery(3, latitude, longitude),
            hydroQuery(9, latitude, longitude)
        ]).then(function (payloads) {
            var groups = payloads.map(function (payload) {
                return (payload.features || []).map(function (feature) {
                    return geometryDistance(
                        longitude,
                        latitude,
                        feature.geometry || {}
                    );
                }).filter(Number.isFinite);
            });
            var flowline = groups[0].length
                ? Math.min.apply(null, groups[0])
                : 10;
            var waterbody = groups[1].length
                ? Math.min.apply(null, groups[1])
                : 10;
            return {
                matched: true,
                nearestWaterKm: Math.min(flowline, waterbody),
                nearestFlowlineKm: flowline,
                nearestWaterbodyKm: waterbody,
                source: 'USGS NHDPlus HR'
            };
        }).catch(function () {
            return { matched: false };
        });
        return hydroCache[key];
    }

    global.OPISLocationContext = {
        lookupCensus: lookupCensus,
        fetchHydro: fetchHydro
    };
})(window);
