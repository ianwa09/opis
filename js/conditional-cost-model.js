(function (global) {
    'use strict';

    // Production ridge model fitted on PHMSA crude-oil incidents from 2010
    // through 2024. The target is log1p(total incident cost in 2025 USD).
    // Numeric coefficients below have been converted back from the fitted
    // StandardScaler so the browser can evaluate the model directly.
    var MODEL = {
        version: 'phmsa-crude-ridge-2025-01',
        intercept: 9.653618337888698,
        intervalLogRadius95: 2.9122951515683386,
        numeric: {
            logReleaseBbls: 0.5146822362209378,
            highPopulation: 0.4492808079330175,
            waterCrossing: 0.6705585528154612,
            waterContamination: 1.0889642560082344,
            surfaceWaterRemediation: 0.3558617035055271
        },
        facility: {
            INTERSTATE: 0.08146346312051499,
            INTRASTATE: -0.08146346312051495
        },
        incidentArea: {
            ABOVEGROUND: -0.5217406356551838,
            'TANK, INCLUDING ATTACHED APPURTENANCES': -0.10431262386622306,
            'TRANSITION AREA': -0.008837589978044453,
            UNDERGROUND: 0.5326816783926445,
            UNKNOWN: 0.10220917110696162
        },
        state: {
            AK: 0.22633104850904906,
            AL: -0.0643538360949246,
            AR: -0.07490389170265212,
            CA: 0.08786364513386058,
            CO: -0.12001336163950455,
            IL: 0.28299358080417064,
            IN: 0.1027054730740593,
            KS: -0.3518830496629928,
            KY: -0.05026762969493803,
            LA: 0.2784871693278935,
            MI: 0.15676501888511218,
            MN: 0.42240159867772914,
            MO: 0.22958337597586206,
            MS: -0.02215903518438469,
            MT: -0.09397071633137605,
            ND: 0.016935222577478638,
            NE: 0.12937136952909067,
            NM: -0.3105852495297563,
            OH: -0.038290695774195194,
            OK: -0.3211840537666394,
            PA: 0.01797242541966054,
            SD: 0.06428082876029667,
            TN: 0.029198003014264978,
            TX: -0.41206383612634934,
            UNKNOWN: 0.1022091711069617,
            UT: 0.07281924363178488,
            WI: 0.06295391995810408,
            WY: -0.48570432482554815
        },
        infrequentStateEffect: 0.06250858594784865,
        infrequentStates: ['FL', 'IA', 'ME', 'NH', 'NJ', 'NY'],
        confidence: {
            method: '500 paired bootstrap ridge refits with fixed production encoding',
            covarianceDimension: 42,
            numericMean: [
                2.0697763478226063,
                0.136056838365897,
                0.00674955595026643,
                0.08596802841918295,
                0.035523978685612786
            ],
            numericScale: [
                2.002139727507894,
                0.34284891001689227,
                0.0818779545710618,
                0.2803168323681349,
                0.1851000422040966
            ],
            stateOrder: [
                'AK', 'AL', 'AR', 'CA', 'CO', 'IL', 'IN', 'KS', 'KY', 'LA',
                'MI', 'MN', 'MO', 'MS', 'MT', 'ND', 'NE', 'NM', 'OH', 'OK',
                'PA', 'SD', 'TN', 'TX', 'UNKNOWN', 'UT', 'WI', 'WY'
            ],
            covarianceFloat32Base64: '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'
        },
        validation: {
            testYear: 2025,
            incidents: 136,
            logR2: 0.5571960296612206,
            logMae: 1.1048185475641403,
            medianAbsoluteErrorUsd: 29476.945905943063,
            intervalCoverage95: 0.9632352941176471
        }
    };

    function ownEffect(lookup, key) {
        return Object.prototype.hasOwnProperty.call(lookup, key) ? lookup[key] : 0;
    }

    function stateEffect(state) {
        var code = String(state || 'UNKNOWN').toUpperCase();
        if (Object.prototype.hasOwnProperty.call(MODEL.state, code)) {
            return MODEL.state[code];
        }
        return MODEL.infrequentStates.indexOf(code) !== -1
            ? MODEL.infrequentStateEffect
            : 0;
    }

    var confidenceCovariance = null;

    function decodeConfidenceCovariance() {
        if (confidenceCovariance) return confidenceCovariance;

        var binary = global.atob(MODEL.confidence.covarianceFloat32Base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        confidenceCovariance = new Float32Array(bytes.buffer);
        return confidenceCovariance;
    }

    function standardizedNumeric(values) {
        return values.map(function (value, index) {
            return (
                (value - MODEL.confidence.numericMean[index])
                / MODEL.confidence.numericScale[index]
            );
        });
    }

    function confidenceDesignVector(input, facility, incidentArea) {
        var state = String(input.state || 'UNKNOWN').toUpperCase();
        var vector = [1].concat(standardizedNumeric([
            Math.log1p(Number(input.releaseBbls)),
            input.highPopulation ? 1 : 0,
            input.waterCrossing ? 1 : 0,
            input.waterContamination ? 1 : 0,
            input.surfaceWaterRemediation ? 1 : 0
        ]));

        vector.push(facility === 'INTERSTATE' ? 1 : 0);
        vector.push(facility === 'INTRASTATE' ? 1 : 0);

        [
            'ABOVEGROUND',
            'TANK, INCLUDING ATTACHED APPURTENANCES',
            'TRANSITION AREA',
            'UNDERGROUND',
            'UNKNOWN'
        ].forEach(function (category) {
            vector.push(incidentArea === category ? 1 : 0);
        });

        MODEL.confidence.stateOrder.forEach(function (category) {
            vector.push(state === category ? 1 : 0);
        });
        vector.push(MODEL.infrequentStates.indexOf(state) !== -1 ? 1 : 0);
        return vector;
    }

    function typicalCostConfidence(input, facility, incidentArea, logPrediction) {
        var vector = confidenceDesignVector(input, facility, incidentArea);
        var covariance = decodeConfidenceCovariance();
        var dimension = MODEL.confidence.covarianceDimension;
        var variance = 0;

        for (var row = 0; row < dimension; row += 1) {
            for (var column = 0; column < dimension; column += 1) {
                variance += (
                    vector[row]
                    * covariance[row * dimension + column]
                    * vector[column]
                );
            }
        }

        var logStandardError = Math.sqrt(Math.max(0, variance));
        return {
            lower: Math.max(
                0,
                Math.expm1(logPrediction - 1.96 * logStandardError)
            ),
            upper: Math.max(
                0,
                Math.expm1(logPrediction + 1.96 * logStandardError)
            ),
            logStandardError: logStandardError
        };
    }

    function predict(input) {
        var releaseBbls = Number(input.releaseBbls);
        if (!Number.isFinite(releaseBbls) || releaseBbls < 0) {
            throw new Error('Release volume must be a nonnegative number.');
        }

        var facility = String(input.facility || '').toUpperCase();
        var incidentArea = String(input.incidentArea || '').toUpperCase();
        if (!Object.prototype.hasOwnProperty.call(MODEL.facility, facility)) {
            throw new Error('Facility type must be interstate or intrastate.');
        }
        if (!Object.prototype.hasOwnProperty.call(MODEL.incidentArea, incidentArea)) {
            throw new Error('Select a supported PHMSA incident area.');
        }

        var logPrediction = MODEL.intercept
            + MODEL.numeric.logReleaseBbls * Math.log1p(releaseBbls)
            + MODEL.numeric.highPopulation * (input.highPopulation ? 1 : 0)
            + MODEL.numeric.waterCrossing * (input.waterCrossing ? 1 : 0)
            + MODEL.numeric.waterContamination * (input.waterContamination ? 1 : 0)
            + MODEL.numeric.surfaceWaterRemediation
                * (input.surfaceWaterRemediation ? 1 : 0)
            + ownEffect(MODEL.facility, facility)
            + ownEffect(MODEL.incidentArea, incidentArea)
            + stateEffect(input.state);

        var point = Math.max(0, Math.expm1(logPrediction));
        var lower = Math.max(
            0,
            Math.expm1(logPrediction - MODEL.intervalLogRadius95)
        );
        var upper = Math.max(
            0,
            Math.expm1(logPrediction + MODEL.intervalLogRadius95)
        );
        var confidence = typicalCostConfidence(
            input,
            facility,
            incidentArea,
            logPrediction
        );

        return {
            cost2025Usd: point,
            typicalCostLower95Usd: confidence.lower,
            typicalCostUpper95Usd: confidence.upper,
            lower95Usd: lower,
            upper95Usd: upper,
            logPrediction: logPrediction,
            typicalCostLogStandardError: confidence.logStandardError,
            stateEffect: stateEffect(input.state)
        };
    }

    global.OPISConditionalCostModel = {
        metadata: MODEL,
        predict: predict
    };
})(window);
