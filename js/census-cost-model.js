(function (global) {
    'use strict';

    var MODEL = global.OPISCensusCostModelData;
    if (!MODEL) throw new Error('Census cost model data was not loaded.');

    function isMissing(value) {
        return value === null
            || value === undefined
            || value === ''
            || !Number.isFinite(Number(value));
    }

    function numericTransform(values) {
        var config = MODEL.preprocessor;
        var missing = {};
        var transformed = config.numericFeatures.map(function (feature, index) {
            missing[feature] = isMissing(values[feature]);
            return missing[feature]
                ? config.numericMedians[index]
                : Number(values[feature]);
        });
        config.numericIndicatorFeatures.forEach(function (feature) {
            transformed.push(missing[feature] ? 1 : 0);
        });
        return transformed.map(function (value, index) {
            return (
                (value - config.numericMean[index])
                / config.numericScale[index]
            );
        });
    }

    function categoricalEffect(feature, category) {
        var indices = MODEL.preprocessor.categoricalIndices[feature] || {};
        var index = indices[String(category || 'UNKNOWN').toUpperCase()];
        return typeof index === 'number'
            ? MODEL.preprocessor.categoricalCoefficients[index]
            : 0;
    }

    function predict(input) {
        var release = Number(input.releaseBbls);
        if (!Number.isFinite(release) || release < 0) {
            throw new Error('Release volume must be a nonnegative number.');
        }
        var numericValues = {
            LOG_RELEASE_BBLS: Math.log1p(release),
            WATER_CROSSING_BINARY: input.waterCrossing ? 1 : 0,
            WATER_CONTAM_BINARY: input.waterContamination ? 1 : 0,
            SURFACE_WATER_REMED_BINARY:
                input.surfaceWaterRemediation ? 1 : 0,
            CENSUS_CONTEXT_MATCH_BINARY:
                input.censusContextMatched ? 1 : 0,
            CENSUS_POPULATION_DENSITY_LOG:
                input.censusPopulationDensityLog,
            CENSUS_HOUSING_DENSITY_LOG:
                input.censusHousingDensityLog,
            CENSUS_MEDIAN_HOUSEHOLD_INCOME_LOG:
                input.censusMedianHouseholdIncomeLog
        };
        var categoricalValues = {
            PIPE_FACILITY_TYPE: String(input.facility || '').toUpperCase(),
            INCIDENT_AREA_TYPE: String(input.incidentArea || '').toUpperCase(),
            ONSHORE_STATE_ABBREVIATION:
                String(input.state || 'UNKNOWN').toUpperCase()
        };
        var logPrediction = MODEL.preprocessor.intercept;
        numericTransform(numericValues).forEach(function (value, index) {
            logPrediction += (
                value * MODEL.preprocessor.numericCoefficients[index]
            );
        });
        MODEL.preprocessor.categoricalFeatures.forEach(function (feature) {
            logPrediction += categoricalEffect(
                feature,
                categoricalValues[feature]
            );
        });
        var confidenceRadius = MODEL.typicalCostConfidence95.logRadius95;
        var predictionRadius = MODEL.intervalLogRadius95;
        return {
            cost2025Usd: Math.max(0, Math.expm1(logPrediction)),
            typicalCostLower95Usd: Math.max(
                0,
                Math.expm1(logPrediction - confidenceRadius)
            ),
            typicalCostUpper95Usd: Math.max(
                0,
                Math.expm1(logPrediction + confidenceRadius)
            ),
            lower95Usd: Math.max(
                0,
                Math.expm1(logPrediction - predictionRadius)
            ),
            upper95Usd: Math.max(
                0,
                Math.expm1(logPrediction + predictionRadius)
            ),
            logPrediction: logPrediction,
            typicalCostLogStandardError:
                MODEL.typicalCostConfidence95.maximumLogStandardError,
            stateEffect: categoricalEffect(
                'ONSHORE_STATE_ABBREVIATION',
                categoricalValues.ONSHORE_STATE_ABBREVIATION
            ),
            modelVariant: input.censusContextMatched
                ? 'census-informed'
                : 'baseline'
        };
    }

    global.OPISCensusCostModel = {
        metadata: MODEL,
        predict: predict
    };
})(window);
