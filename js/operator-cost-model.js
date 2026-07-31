(function (global) {
    'use strict';

    var MODEL = global.OPISOperatorCostModelData;
    if (!MODEL) {
        throw new Error('Operator cost model data was not loaded.');
    }

    function normalizeOperator(value) {
        return String(value || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, ' ');
    }

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

    function buildFeatures(input, match) {
        var opid = match.opid;
        var state = String(input.state || 'UNKNOWN').toUpperCase();
        var history = MODEL.operatorHistory.values[opid];
        var annual = MODEL.annualReport.values[opid];
        var annualState = annual.states[state] || {};

        return {
            numeric: {
                LOG_RELEASE_BBLS: Math.log1p(Number(input.releaseBbls)),
                WATER_CROSSING_BINARY: input.waterCrossing ? 1 : 0,
                WATER_CONTAM_BINARY: input.waterContamination ? 1 : 0,
                SURFACE_WATER_REMED_BINARY: input.surfaceWaterRemediation ? 1 : 0,
                OPERATOR_PRIOR_USABLE_INCIDENTS_LOG:
                    history.OPERATOR_PRIOR_USABLE_INCIDENTS_LOG,
                OPERATOR_PRIOR_COST_LOG_MEAN_SMOOTHED:
                    history.OPERATOR_PRIOR_COST_LOG_MEAN_SMOOTHED,
                OPERATOR_PRIOR_RELEASE_LOG_MEAN_SMOOTHED:
                    history.OPERATOR_PRIOR_RELEASE_LOG_MEAN_SMOOTHED,
                ANNUAL_REPORT_MATCH_BINARY:
                    annual.ANNUAL_REPORT_MATCH_BINARY,
                ANNUAL_OPERATOR_CRUDE_MILES_LOG:
                    annual.ANNUAL_OPERATOR_CRUDE_MILES_LOG,
                ANNUAL_STATE_CRUDE_MILES_LOG:
                    annualState.ANNUAL_STATE_CRUDE_MILES_LOG,
                ANNUAL_STATE_PRE1970_SHARE:
                    annualState.ANNUAL_STATE_PRE1970_SHARE,
                ANNUAL_STATE_2000_PLUS_SHARE:
                    annualState.ANNUAL_STATE_2000_PLUS_SHARE,
                ANNUAL_STATE_WEIGHTED_INSTALL_YEAR:
                    annualState.ANNUAL_STATE_WEIGHTED_INSTALL_YEAR,
                ANNUAL_STATE_WEIGHTED_DIAMETER:
                    annualState.ANNUAL_STATE_WEIGHTED_DIAMETER,
                ANNUAL_STATE_LARGE_DIAMETER_SHARE:
                    annualState.ANNUAL_STATE_LARGE_DIAMETER_SHARE,
                CENSUS_CONTEXT_MATCH_BINARY:
                    input.censusContextMatched ? 1 : 0,
                CENSUS_POPULATION_DENSITY_LOG:
                    input.censusPopulationDensityLog,
                CENSUS_HOUSING_DENSITY_LOG:
                    input.censusHousingDensityLog,
                CENSUS_MEDIAN_HOUSEHOLD_INCOME_LOG:
                    input.censusMedianHouseholdIncomeLog
            },
            categorical: {
                PIPE_FACILITY_TYPE: String(input.facility || '').toUpperCase(),
                INCIDENT_AREA_TYPE: String(input.incidentArea || '').toUpperCase(),
                ONSHORE_STATE_ABBREVIATION: state
            },
            annualStateMatched: Object.keys(annualState).length > 0,
            annualOperatorMatched: annual.ANNUAL_REPORT_MATCH_BINARY === 1
        };
    }

    function predict(input) {
        var releaseBbls = Number(input.releaseBbls);
        if (!Number.isFinite(releaseBbls) || releaseBbls < 0) {
            throw new Error('Release volume must be a nonnegative number.');
        }

        var operatorKey = normalizeOperator(input.operatorName);
        var match = MODEL.crosswalk[operatorKey];
        if (!match) return null;

        var facility = String(input.facility || '').toUpperCase();
        var incidentArea = String(input.incidentArea || '').toUpperCase();
        if (facility !== 'INTERSTATE' && facility !== 'INTRASTATE') {
            throw new Error('Facility type must be interstate or intrastate.');
        }
        if (
            !Object.prototype.hasOwnProperty.call(
                MODEL.preprocessor.categoricalIndices.INCIDENT_AREA_TYPE,
                incidentArea
            )
        ) {
            throw new Error('Select a supported PHMSA incident area.');
        }

        var features = buildFeatures(input, match);
        var numeric = numericTransform(features.numeric);
        var logPrediction = MODEL.preprocessor.intercept;
        numeric.forEach(function (value, index) {
            logPrediction += (
                value * MODEL.preprocessor.numericCoefficients[index]
            );
        });
        MODEL.preprocessor.categoricalFeatures.forEach(function (feature) {
            logPrediction += categoricalEffect(
                feature,
                features.categorical[feature]
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
                features.categorical.ONSHORE_STATE_ABBREVIATION
            ),
            modelVariant: 'operator-informed',
            operatorOpid: match.opid,
            phmsaOperatorName: match.phmsaName,
            annualOperatorMatched: features.annualOperatorMatched,
            annualStateMatched: features.annualStateMatched
        };
    }

    global.OPISOperatorCostModel = {
        metadata: MODEL,
        normalizeOperator: normalizeOperator,
        isSupported: function (operatorName) {
            return Object.prototype.hasOwnProperty.call(
                MODEL.crosswalk,
                normalizeOperator(operatorName)
            );
        },
        predict: predict
    };
})(window);
