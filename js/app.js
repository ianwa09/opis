var tutorialSteps = [
    {
        icon: 'bi-map',
        title: 'Explore pipelines and spill impacts',
        body: 'This tool lets you explore the U.S. pipeline network and simulate the estimated cost of a spill incident. Use the right-hand panel to control what\'s shown on the map.<br><br>This short tutorial walks you through the key features.'
    },
    {
        icon: 'bi-droplet-half',
        title: 'Select a pipeline layer',
        body: 'In the <strong>Pipelines</strong> tab on the right, pick a pipeline type: Crude Oil, Natural Gas, Petroleum Products, and more. Only one type is shown at a time for clarity and performance.<br><br>Each type appears in a distinct color on the map.'
    },
    {
        icon: 'bi-layers',
        title: 'Switch the basemap',
        body: 'At the top of the Pipelines tab, you can switch between three basemaps:<br><br><strong>Dark</strong>: best for seeing pipeline routes clearly<br><strong>Satellite</strong>: see real-world terrain and infrastructure<br><strong>Street</strong>: reference cities and roads'
    },
    {
        icon: 'bi-lightning-charge',
        title: 'Estimate spill costs',
        body: '<strong>Select the Crude Oil layer, then click any pipeline on the map</strong> to open the Spill Cost Simulator. The simulator is calibrated to crude oil incidents only, using PHMSA data from 2015 to 2024.<br><br>Adjust release volume, location type, and environmental risk factors to estimate total incident costs, broken down by category.'
    },
    {
        icon: 'bi-exclamation-circle',
        title: 'Explore historical spills',
        body: 'Switch to the <strong>Spill history</strong> tab to toggle on a layer of real PHMSA-reported hazardous liquid spill incidents. Each marker shows date, commodity, volume released, and cause.<br><br><em>Note: this dataset is large and may take a few seconds to load.</em>'
    },
    {
        icon: 'bi-pencil',
        title: 'Analyze a boundary',
        body: 'You can draw boundaries on the map to calculate oil spill statistics within the region. Click the <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-rectangle modal-geoman-icon"></span></span> tool to draw a rectangular boundary, and the <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-polygon modal-geoman-icon"></span></span> icon to draw a polygonal boundary. You can edit, drag, cut, erase, and rotate previous boundaries with the <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-edit modal-geoman-icon"></span></span>, <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-drag modal-geoman-icon"></span></span>, <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-cut modal-geoman-icon"></span></span>, <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-delete modal-geoman-icon"></span></span>, and <span class="leaflet-pm-toolbar" style="display:inline;"><span class="control-icon leaflet-pm-icon-rotate modal-geoman-icon"></span></span> icons.'
    },
    {
        icon: 'bi-file-earmark-text',
        title: 'Data sources and methodology',
        body: 'Tap the <strong>Data Methodology &amp; Appendix</strong> button in the navigation bar to review the data sources, regression model coefficients, and cost category definitions behind the simulator.<br><br>Contact us at <a href="mailto:iwang@imsa.edu">iwang@imsa.edu</a> and <a href="mailto:olee@imsa.edu">olee@imsa.edu</a> with any questions or suggestions.<br><br>You\'re all set. Explore the map'
    }
];
var tutStep = 0;

function renderTutStep() {
    var s = tutorialSteps[tutStep];
    document.getElementById('tut-icon').className = 'tut-icon bi ' + s.icon;
    document.getElementById('tut-step-title').textContent = s.title;
    document.getElementById('tut-step-body').innerHTML = s.body;
    document.getElementById('tut-step-num').textContent = (tutStep + 1) + ' of ' + tutorialSteps.length;
    // dots
    var dots = document.querySelectorAll('.tut-dot');
    dots.forEach(function (d, i) {
        d.className = 'tut-dot' + (i === tutStep ? ' active' : i < tutStep ? ' done' : '');
    });
    // prev button visibility
    document.getElementById('tut-prev-btn').style.display = tutStep === 0 ? 'none' : '';
    // next button label
    var nextBtn = document.getElementById('tut-next-btn');
    nextBtn.textContent = tutStep === tutorialSteps.length - 1 ? 'Get started →' : 'Next →';
}

document.body.insertAdjacentHTML('beforeend', `
<div id="tutorial-backdrop">
<div id="tutorial-modal">
<div class="tut-header">
    <h3>How to use OPIS</h3>
    <div class="tut-subtitle">A quick walkthrough of every feature</div>
    <button class="tut-close" id="tut-close-btn" aria-label="Close dialog">&#x2715;</button>
</div>
<div class="tut-body">
    <div class="tut-dots">
    ${tutorialSteps.map(function (_, i) { return '<div class="tut-dot' + (i === 0 ? ' active' : '') + '"></div>'; }).join('')}
    </div>
    <div class="tut-icon" id="tut-icon"></div>
    <div class="tut-step-title" id="tut-step-title"></div>
    <div class="tut-step-body" id="tut-step-body"></div>
</div>
<div class="tut-footer">
    <div class="tut-footer-meta">
        <label class="tut-checkbox-row">
        <input type="checkbox" id="tut-no-show">
        Don't show again
        </label>
        <span class="tut-step-num" id="tut-step-num"></span>
    </div>
    <div class="tut-nav">
        <button class="tut-prev" id="tut-prev-btn" style="display:none">&#8592; Back</button>
        <button class="tut-next" id="tut-next-btn">Next &#8594;</button>
    </div>
</div>
</div>
</div>
`);

renderTutStep();


// Helper function to close any open modals on the screen
function closeAllModals() {
    var openBackdrops = document.querySelectorAll('.contact-backdrop, #tutorial-backdrop, #meth-backdrop, #chart-backdrop, #sim-backdrop');
    openBackdrops.forEach(function (backdrop) {
        backdrop.classList.remove('open');
    });

    // Optional: Reset tutorial step back to 0 if it was closed
    if (typeof currentStep !== 'undefined') {
        currentStep = 0;
        if (typeof showStep === 'function') { showStep(0); }
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;

    var openModal = document.querySelector(
        '.contact-backdrop.open, #tutorial-backdrop.open, #meth-backdrop.open, #chart-backdrop.open, #sim-backdrop.open'
    );
    if (!openModal) return;

    event.preventDefault();
    closeAllModals();
});

// Function to handle closing and saving preference
function closeAndSaveTutorial() {
    document.getElementById('tutorial-backdrop').classList.remove('open');
}
// Close the tutorial completely if the user clicks out onto the backdrop overlay
document.getElementById('tutorial-backdrop').addEventListener('click', function (e) {
    // Only trigger if they clicked the backdrop itself, not the modal card inside it
    if (e.target === this) {
        this.classList.remove('open');

        // Reset the tutorial back to the beginning step for the next time it opens
        currentStep = 0;
        if (typeof showStep === 'function') {
            showStep(currentStep);
        }
    }
});
// Close button click
document.getElementById('tut-close-btn').addEventListener('click', closeAndSaveTutorial);

// Next button click
document.getElementById('tut-next-btn').addEventListener('click', function () {
    if (tutStep < tutorialSteps.length - 1) {
        tutStep++;
        renderTutStep();
    } else {
        closeAndSaveTutorial(); // Triggers when "Get started →" is clicked on the final step
    }
});
document.getElementById('tut-prev-btn').addEventListener('click', function () {
    if (tutStep > 0) { tutStep--; renderTutStep(); }
});
document.getElementById('tutorial-btn').addEventListener('click', function () {
    closeAllModals();
    tutStep = 0;
    renderTutStep();

    var skipTutorial = localStorage.getItem('skipOpisTutorial');
    document.getElementById('tut-no-show').checked = (skipTutorial === 'true');

    document.getElementById('tutorial-backdrop').classList.add('open');
});

var skipTutorial = localStorage.getItem('skipOpisTutorial');
var backdrop = document.getElementById('tutorial-backdrop');

if (skipTutorial !== 'true' && backdrop) {
    backdrop.classList.add('open');
    document.getElementById('tut-no-show').checked = false;
}

document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'tut-no-show') {
        if (e.target.checked) {
            localStorage.setItem('skipOpisTutorial', 'true');
        } else {
            localStorage.removeItem('skipOpisTutorial');
        }
    }
});



document.body.insertAdjacentHTML('beforeend', `
<div id="contact-backdrop" class="contact-backdrop">
<div id="contact-modal" class="contact-modal">
<div class="contact-header">
    <h3>Contact the OPIS team</h3>
    <div class="contact-subtitle">Data sharing, inquiries, and feature requests</div>
    <button class="contact-close" id="contact-close-btn" aria-label="Close dialog">&#x2715;</button>
</div>
<div class="contact-body">
    <p class="contact-intro">
        This tool is built on open-source, archived public infrastructure data. Whether you are a researcher, a journalist, or a community advocate, we want to hear how you are using it, and if you have any questions.
    </p>
    
    <div class="contact-options-list">
        <a href="https://github.com/ianwa09/opis/issues" target="_blank" rel="noopener" class="contact-option-card">
            <i class="bi bi-github"></i>
            <div class="contact-card-text">
                <strong>Report an Issue or Bug</strong>
                <span>Found a missing pipeline segment or an issue with the model? Let us know on GitHub.</span>
            </div>
        </a>
        <a href="mailto:iwang@imsa.edu,olee@imsa.edu?subject=OPIS" class="contact-option-card">
            <i class="bi bi-envelope"></i>
            <div class="contact-card-text">
                <strong>Email Us</strong>
                <span>Reach out directly with questions, feedback, or collaboration opportunities.</span>
            </div>
        </a>
    </div>
</div>
</div>
</div>
`);

// Contact modal controls
document.getElementById('contact-btn').addEventListener('click', function () {
    closeAllModals();

    document.getElementById('contact-backdrop').classList.add('open');
});

['contact-close-btn'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', function () {
            document.getElementById('contact-backdrop').classList.remove('open');
        });
    }
});

// Close if they click the background backdrop layout
document.getElementById('contact-backdrop').addEventListener('click', function (e) {
    if (e.target === this) {
        this.classList.remove('open');
    }
});


// Methodology modal
document.body.insertAdjacentHTML('beforeend', `
<div id="meth-backdrop">
<div id="meth-modal">
<div class="meth-header">
    <h3>Data methodology &amp; appendix</h3>
    <div class="meth-subhead">Sources, assumptions &amp; calculation methods</div>
    <button class="meth-close" id="meth-close-btn" aria-label="Close dialog">&#x2715;</button>
</div>
<div class="meth-body">
    <div class="meth-logo">
        <img src="opis-logo.png" alt="OPIS Logo" class="opis-logo opis-logo-light">
        <img src="opis-logo-dark.png" alt="OPIS Logo" class="opis-logo opis-logo-dark">
    </div>
    <div class="meth-section">
    <div class="meth-section-title">1. Pipeline network data</div>
    <p>When the original federal downloads were unavailable, we used archived copies from DataLumos at the University of Michigan. The crude oil layer comes from a U.S. Energy Information Administration (EIA) dataset on ArcGIS Hub.</p>
    <p>The DataLumos archive includes these Homeland Infrastructure Foundation-Level Data (HIFLD) datasets:</p>
    <ul>
        <li>Submarine Pipelines (ICPSR 240657 and 240796).</li>
        <li>Natural Gas Pipelines (ICPSR 239743).</li>
        <li>Hydrocarbon Gas Liquid / Petroleum Product Pipelines (ICPSR 239260).</li>
        <li>Petroleum terminal facilities with rail, truck, and water-access attributes (ICPSR 240798).</li>
        <li>POL (Petroleum, Oil, and Lubricants) Terminals (ICPSR 239798).</li>
    </ul>
    <p><strong>Map display.</strong> OPIS draws the map in Leaflet from archived GeoJSON snapshots. A line usually represents one segment from the source dataset. Points mark terminal facilities. The map skips records without usable geometry.</p>
    <p><strong>Boundary mileage.</strong> OPIS measures the routes inside the drawn area across all five line layers, including layers hidden on the map. Hover over <em>Est. mapped mileage</em> in the boundary popup for miles by type.</p>
    <p>The mileage total covers only the archived routes. Coverage is incomplete for local natural gas distribution mains, service lines, and gathering networks.</p>
    <p>The Pipeline and Hazardous Materials Safety Administration (PHMSA) reports 3.3 million regulated pipeline miles in its <a href="https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/2024-11/Report%20to%20Congress%20-%20Implementation%20of%20Safety%20Management%20Systems%20by%20Gas%20Distribution%20Pipeline%20Operators.pdf" target="_blank" rel="noopener noreferrer">2024 report</a>. Gas distribution systems account for more than 72% of that total.</p>
    <p><strong>How OPIS measures mileage</strong></p>
    <ol>
        <li>OPIS finds routes that touch or lie inside the drawn area. It measures each part of a route separately.</li>
        <li>It splits each route at the boundary and keeps the parts inside the drawn area. It skips any part inside a hole in the area.</li>
        <li>It uses Turf to measure the remaining route in kilometers from the latitude and longitude coordinates.</li>
        <li>It multiplies kilometers by 0.621371 to get miles, then adds up the miles for each pipeline type and for all types combined.</li>
    </ol>
    <p><strong>Why mileage is an estimate.</strong> The total depends on which routes the archives contain and how precisely they map them. It measures distance along the mapped lines in two dimensions. Overlapping records each contribute mileage. If OPIS cannot measure a route, it skips that route's mileage. The export includes a count of those routes.</p>
    <p><strong>Pipeline crossings.</strong> The count includes routes that touch or lie inside the drawn area. Within each layer, OPIS counts records with the same identifier once. It uses the first available value from <code>PIPELINE_ID</code>, <code>SUB_SYSTEM</code>, <code>OBJECTID</code>, or <code>id</code>. For records with no identifier, it uses the operator, pipeline name, and commodity. That can group separate routes if they share all three values.</p>
    <ul>
        <li>The hydrocarbon gas liquids (HGL) source uses Web Mercator coordinates (EPSG:3857). The application converts projected coordinates to geographic longitude and latitude before map display.</li>
        <li>The application keeps original descriptive attributes where available. Pipeline tooltips identify the archived dataset. Terminal tooltips also display the record's <code>SOURCE</code> field.</li>
        <li>The <code>SOURCE</code> field identifies the contributor to an individual facility record. The DataLumos citation identifies the archive that supplied the dataset.</li>
        <li>The submarine layer comes from the U.S. Army Corps of Engineers' Inland Electronic Navigational Charts. It includes supply, intake, outfall, and sewer pipes. The records list products such as gas, oil, water, and chemicals. OPIS keeps records with blank or unknown products. Boundary analysis groups submarine routes under Other Infrastructure when the commodity does not match a pipeline category.</li>
    </ul>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">2. Spill incident data</div>
    <p>The spill layer uses PHMSA Hazardous Liquid Incident Reports. The embedded dataset contains 5,812 incidents dated January 1, 2010 through December 23, 2025.</p>
    <ul>
        <li>OPIS uses the coordinates in the incident reports. When incidents share a location, the map moves their markers apart so you can select each one.</li>
        <li>Release volume is the number of barrels the operator reported as an unintentional release. The dataset includes 34 reports of zero barrels.</li>
        <li>The incident map shows spill records and release volumes. The cost model uses a separate set of records for training.</li>
        <li>Spill filters and the timeline date affect which incidents count in a drawn area. The mileage calculation still uses all five line layers.</li>
    </ul>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">3. Spill cost simulation model</div>
    <p>The simulator estimates the cost of a crude oil spill in 2024 dollars. It uses release volume, equipment age, risk factors, location, facility type, and state.</p>
    <p><strong>Model training.</strong> We used PHMSA crude oil incident reports from 2015 through 2024. The model summary gives about 2,400 incidents. It reports an adjusted R-squared of about 0.61 for the fit to the training data.</p>
    <ol>
        <li>We added the five PHMSA cost fields in Section 4 and adjusted costs to 2024 dollars. We subtracted the installation year from the incident year to get the equipment age.</li>
        <li>We dropped records with an adjusted cost below $100 or missing equipment age. We then dropped records above the 97th percentile of adjusted cost.</li>
        <li>We applied <code>log1p(x) = ln(1 + x)</code> to release volume and adjusted cost. In five yes-or-no fields, we used zero for missing or unrecognized answers.</li>
        <li>We gave each category its own column. The column has a 1 if the record belongs to that category and a 0 otherwise. This is one-hot encoding. We used it for location, incident area, facility type, and state.</li>
        <li>We used a random forest with 50 trees to rank the inputs. Recursive feature elimination with cross-validation (RFECV) compared sets of inputs. It scored each set by R-squared across five groups of records. We then fit an ordinary least squares (OLS) regression to the selected inputs.</li>
    </ol>
    <p><strong>How the simulator estimates cost.</strong> The simulator assumes 50 years of equipment age for every pipeline. It applies <code>log1p</code> to the release volume, then uses the coefficients in Appendix A to calculate the estimate on the log scale. Call that estimate <code>z</code>.</p>
    <p>The simulator converts the log estimate to dollars with <code>exp(z) - 1</code> and displays that result. It skips the smearing correction. That correction would use the model's errors on the training data to adjust the dollar estimate.</p>
    <p><strong>Illustrative interval.</strong> The simulator applies the same margin to every estimate on the log scale. It subtracts <code>1.96 &times; <span id="meth-interval-parameter"></span></code> from <code>z</code> for the lower end and adds it for the upper end. It then converts both ends to dollars. The share of actual spill costs that would fall in this interval is unknown.</p>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">4. Cost breakdown categories</div>
    <p>The model uses the sum of the five PHMSA fields below as total incident cost. The simulator divides each estimate into categories using the same percentages for every scenario.</p>
    <table class="meth-table">
        <tr><th>Category</th><th>Share</th><th>PHMSA field</th></tr>
        <tr><td>Operator paid</td><td>38%</td><td>EST_COST_OPER_PAID</td></tr>
        <tr><td>Property damage</td><td>22%</td><td>EST_COST_PROP_DAMAGE</td></tr>
        <tr><td>Emergency response</td><td>18%</td><td>EST_COST_EMERGENCY</td></tr>
        <tr><td>Environmental</td><td>15%</td><td>EST_COST_ENVIRONMENTAL</td></tr>
        <tr><td>Other</td><td>7%</td><td>EST_COST_OTHER</td></tr>
    </table>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">5. Geographic state detection</div>
    <p>OPIS uses the state in the pipeline record when available. Otherwise, it checks the coordinates you clicked against rectangles for all 50 states and takes the first match. The rectangles overlap, so OPIS can pick the wrong state near a border.</p>
    <p>If the pipeline has no state value and the coordinates match no state, the simulator uses the Texas coefficient of -0.10.</p>
    <p>For spill history, OPIS checks each incident against state outlines from <code>us-atlas</code>. If an incident matches no outline or the outlines fail to load, OPIS checks the same rectangles.</p>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix A</span>
    <div class="meth-section-title" style="margin-top:8px">Model coefficients</div>
    <p>The tables show the coefficients the simulator uses to calculate <code>z</code>, the cost estimate on the log scale.</p>
    <table class="meth-table">
        <thead><tr><th>Input</th><th>Coefficient</th><th>Role in the calculation</th></tr></thead>
        <tbody id="meth-model-coefficients"></tbody>
    </table>
    <p>The intercept alone converts to about $12,300 when all other terms are zero. The simulator starts at one barrel and uses 50 years of equipment age, so even the smallest release includes both terms.</p>
    <p>The location adjustment starts at zero for a spill below ground. The facility adjustment starts at zero for a gathering line. Each alternative adds its coefficient to the log estimate.</p>
    <details>
        <summary>State adjustments for all 50 states</summary>
        <p>The calculation adds the coefficient for the detected state, or Texas if detection fails. A zero coefficient leaves the logarithmic estimate unchanged.</p>
        <table class="meth-table">
            <thead><tr><th>State</th><th>Coefficient</th><th>State</th><th>Coefficient</th></tr></thead>
            <tbody id="meth-state-coefficients"></tbody>
        </table>
    </details>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix B</span>
    <div class="meth-section-title" style="margin-top:8px">Data sources and method references</div>
    <ul>
        <li><a href="https://www.phmsa.dot.gov/data-and-statistics/pipeline/pipeline-incident-flagged-files" target="_blank" rel="noopener noreferrer">PHMSA incident data</a>.</li>
        <li>DataLumos archived HIFLD datasets: ICPSR 240657, 240796, 239743, 239260, 240798, and 239798.</li>
        <li><a href="https://hub.arcgis.com/datasets/bb2aee97117d403ea63bcfe6be4a12c8_0" target="_blank" rel="noopener noreferrer">EIA crude oil pipeline data on ArcGIS Hub</a>.</li>
        <li>Inflation adjustment uses <a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer">BLS Consumer Price Index</a> series <code>CUUR0000SA0</code>.</li>
        <li>Spill state polygons use <code>us-atlas</code> version 3. The application embeds rectangular bounds for pipeline state detection and fallback detection.</li>
        <li>The <a href="https://scikit-learn.org/stable/modules/generated/sklearn.feature_selection.RFECV.html" target="_blank" rel="noopener noreferrer">scikit-learn RFECV reference</a> explains feature selection with cross-validation.</li>
        <li>The <a href="https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm" target="_blank" rel="noopener noreferrer">NIST least-squares reference</a> explains the fitting criterion.</li>
    </ul>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix C</span>
    <div class="meth-section-title" style="margin-top:8px">Limitations</div>
    <ul>
        <li>Use OPIS for general information and planning. Consult a qualified professional for engineering, legal, or regulatory decisions.</li>
        <li>The archived routes can omit recent construction, route changes, and abandoned infrastructure. Their mileage covers the available source geometry.</li>
        <li>The crossing count can merge records with the same identifiers or descriptive fields. Overlapping route features still contribute independently to mileage.</li>
        <li>The simulator is for crude oil spills. The training data exclude incidents below $100 and above the 97th percentile of adjusted cost.</li>
        <li>The training data use the same value for missing answers and reported &ldquo;no&rdquo; answers in the yes-or-no fields.</li>
        <li>Every estimate assumes 50 years of equipment age and uses the same cost shares. Near a border, the state lookup can apply the wrong coefficient.</li>
    </ul>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix D</span>
    <div class="meth-section-title" style="margin-top:8px">Acknowledgements</div>
    <p>Thank you to Mrs. Laura Young, Mrs. Cathy Clarkin, and the BLAST Team at Accelerate Climate Solutions for their support of this project.</p>
    </div>
</div>
</div>
</div>
`);

// Methodology modal controls
function renderMethodModelTables() {
    var coefficientRows = [
        ['Intercept', 'intercept', 'Starting value before the input terms'],
        ['Equipment age', 'age', 'Multiplies age in years, fixed at 50'],
        ['Release volume', 'log_bbls', 'Multiplies log1p of release volume in barrels'],
        ['High population area', 'high_pop', 'Adds this term when selected'],
        ['Water contamination', 'water_contam', 'Adds this term when selected'],
        ['Surface remediation', 'surface_remed', 'Adds this term when selected'],
        ['Water body crossing', 'water_crossing', 'Adds this term when selected'],
        ['Above-ground location', 'aboveground', 'Applies instead of the below-ground reference'],
        ['Underwater location', 'underwater', 'Applies instead of the below-ground reference'],
        ['Interstate pipeline', 'interstate', 'Applies instead of the gathering-line reference'],
        ['Intrastate pipeline', 'intrastate', 'Applies instead of the gathering-line reference']
    ];
    document.getElementById('meth-model-coefficients').innerHTML = coefficientRows.map(function (row) {
        return '<tr><td>' + row[0] + '</td><td style="text-align:right">' +
            OLS[row[1]] + '</td><td>' + row[2] + '</td></tr>';
    }).join('');

    var states = Object.keys(OLS.states).sort();
    var stateRows = [];
    for (var index = 0; index < states.length; index += 2) {
        var pair = states.slice(index, index + 2);
        stateRows.push('<tr>' + pair.map(function (state) {
            return '<td>' + state + '</td><td style="text-align:right">' +
                OLS.states[state].toFixed(2) + '</td>';
        }).join('') + '</tr>');
    }
    document.getElementById('meth-state-coefficients').innerHTML = stateRows.join('');
    document.getElementById('meth-interval-parameter').textContent = OLS.se_mean;
}

document.getElementById('meth-btn').addEventListener('click', function () {
    closeAllModals();
    renderMethodModelTables();
    document.getElementById('meth-backdrop').classList.add('open');
});
document.getElementById('meth-close-btn').addEventListener('click', function () {
    document.getElementById('meth-backdrop').classList.remove('open');
});
document.getElementById('meth-backdrop').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
});


document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
    btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// Basemap switching
document.querySelectorAll('.bm-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var name = btn.dataset.bm;
        if (name === activeBasemap) return;
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(basemaps[activeBasemap]);
        map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(basemaps[name]);
        activeBasemap = name;
        document.querySelectorAll('.bm-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
    });
});

// Pipeline selection
var pipelineLoadTimer = null;
document.querySelectorAll('#pipeline-list li').forEach(function (li) {
    li.addEventListener('click', function () {
        clearTimeout(pipelineLoadTimer);
        var name = li.dataset.layer;
        // If already selected -> clear
        if (activePipeline === name) {
            map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[name]);
            activePipeline = null;
            li.classList.remove('selected');
            li.setAttribute('aria-pressed', 'false');
            var strip = document.getElementById('strip-name-text');
            if (strip) { strip.textContent = 'None selected'; strip.className = 'strip-name none'; }
            return;
        }
        // Remove previous
        if (activePipeline !== null) {
            map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[activePipeline]);
            var previousLayer = document.querySelector('#pipeline-list li.selected');
            previousLayer.classList.remove('selected');
            previousLayer.setAttribute('aria-pressed', 'false');
        }
        // Add new
        activePipeline = name;
        li.classList.add('selected');
        li.setAttribute('aria-pressed', 'true');
        var strip = document.getElementById('strip-name-text');
        if (strip) { strip.textContent = name; strip.className = 'strip-name'; }
        showToast('Loading ' + name + '…');
        pipelineLoadTimer = setTimeout(function () {
            if (activePipeline === name) {
                map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(pipelineLayers[name]);
            }
        }, 30);
    });
});

// Clear button
document.getElementById('ctrl-clear-btn').addEventListener('click', function () {
    clearTimeout(pipelineLoadTimer);
    if (activePipeline !== null) {
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[activePipeline]);
        var sel = document.querySelector('#pipeline-list li.selected');
        if (sel) { sel.classList.remove('selected'); sel.setAttribute('aria-pressed', 'false'); }
        activePipeline = null;
        var strip = document.getElementById('strip-name-text');
        if (strip) { strip.textContent = 'None selected'; strip.className = 'strip-name none'; }
    }
});

// toggle spills
function setSpills(on) {
    spillsOn = on;
    document.getElementById('spills-checkbox').checked = on;
    
    // Lock or unlock availability of the color configuration switch
    var sevContainer = document.getElementById('severity-toggle-container');
    var sevCheckbox = document.getElementById('severity-gradient-checkbox');
    if (sevCheckbox) sevCheckbox.disabled = !on;
    if (sevContainer) {
        if (on) {
            sevContainer.style.opacity = "1";
            sevContainer.style.pointerEvents = "auto";
        } else {
            sevContainer.style.opacity = "0.5";
            sevContainer.style.pointerEvents = "none";
            if (sevCheckbox) {
                sevCheckbox.checked = false; // Turn off toggle if spills layer is disabled
                toggleSpillSeverity(false);
            }
        }
    }

    if (on) {
        showToast('Loading spill data…');
        setTimeout(function () { map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(spillsLayer); }, 30);
    } else {
        if (typeof stopSpillTimelapse === 'function') stopSpillTimelapse();
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(spillsLayer);
    }
}
document.getElementById('spills-toggle').addEventListener('click', function () {
    setSpills(!spillsOn);
});
document.getElementById('spills-checkbox').addEventListener('change', function () {
    setSpills(this.checked);
});

// Spill filters 
// Filtering rebuilds the spills GeoJSON layer (geo_json_74a8ff648bc5b9190beaecc887f54037) from the full cached dataset (window.allSpillFeatures, set in index.html) so that
// boundary-stats.js automatically only sees the currently-filtered incidents with no changes needed on its end.

var spillFilters = {
    dateStart: null,   // 'YYYY-MM-DD' or null
    dateEnd: null,      // 'YYYY-MM-DD' or null
    commodity: 'ALL',
    cause: 'ALL',
    state: 'ALL',
    minBbls: 0
};

var spillPlayback = {
    timer: null,
    playing: false,
    start: null,
    end: null,
    features: [],
    nextIndex: 0,
    currentDate: null
};

// Parses PHMSA's "M/D/YYYY H:MM" LOCAL_DATETIME strings into a Date.
// Returns null if unparseable so those features are never silently dropped by a date filter (they're excluded only by other active filters).
function parseSpillDate(raw) {
    if (!raw) return null;
    var parts = raw.split(' ')[0].split('/');
    if (parts.length !== 3) return null;
    var month = parseInt(parts[0], 10), day = parseInt(parts[1], 10), year = parseInt(parts[2], 10);
    if (!month || !day || !year) return null;
    return new Date(year, month - 1, day);
}

function parseDateInput(raw) {
    if (!raw) return null;
    var parts = raw.split('-');
    if (parts.length !== 3) return null;
    return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
    );
}

function featureMatchesFilters(feature) {
    var props = feature.properties || {};

    if (spillFilters.dateStart || spillFilters.dateEnd) {
        var d = parseSpillDate(props.LOCAL_DATETIME);
        if (d) {
            if (spillFilters.dateStart && d < parseDateInput(spillFilters.dateStart)) return false;
            if (spillFilters.dateEnd && d > parseDateInput(spillFilters.dateEnd)) return false;
        }
    }

    if (spillFilters.commodity !== 'ALL' && props.COMMODITY_RELEASED_TYPE !== spillFilters.commodity) {
        return false;
    }

    if (spillFilters.cause !== 'ALL' && props.CAUSE !== spillFilters.cause) {
        return false;
    }

    if (spillFilters.minBbls > 0) {
        var bbls = parseFloat(props.UNINTENTIONAL_RELEASE_BBLS || 0);
        if (isNaN(bbls) || bbls < spillFilters.minBbls) return false;
    }

    if (spillFilters.state !== 'ALL') {
        if (feature.properties._state !== spillFilters.state) return false;
    }

    return true;
}

function applySpillFilters() {
    if (!window.allSpillFeatures || !window.geo_json_74a8ff648bc5b9190beaecc887f54037) {
        return; // spills data not loaded yet
    }
    var filtered = window.allSpillFeatures.filter(featureMatchesFilters);

    prepareCoincidentSpills(filtered);
    geo_json_74a8ff648bc5b9190beaecc887f54037.clearLayers();
    geo_json_74a8ff648bc5b9190beaecc887f54037.addData({
        type: 'FeatureCollection',
        features: filtered
    });
    positionCoincidentSpills();

    var sevCheckbox = document.getElementById('severity-gradient-checkbox');
    toggleSpillSeverity(!!(sevCheckbox && sevCheckbox.checked));

    var countVal = document.getElementById('spill-filters-count-val');
    var countTotal = document.getElementById('spill-filters-count-total');
    if (countVal) countVal.textContent = filtered.length.toLocaleString();
    if (countTotal) countTotal.textContent = window.allSpillFeatures.length.toLocaleString();
    if (typeof updateSpillVisualization === 'function') updateSpillVisualization();
}

function formatPlaybackDate(date) {
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function setSpillPlaybackStatus(dateText, detailText) {
    document.getElementById('spill-timelapse-date').textContent = dateText;
    document.getElementById('spill-timelapse-detail').textContent = detailText || '';
    document.getElementById('spill-timelapse-status').title =
        dateText + (detailText ? ' ' + detailText : '');
}

function getSpillPlaybackBounds() {
    if (!window.allSpillFeatures || !window.allSpillFeatures.length) return null;

    var dates = window.allSpillFeatures
        .map(function (feature) { return parseSpillDate(feature.properties.LOCAL_DATETIME); })
        .filter(Boolean);
    if (!dates.length) return null;

    var datasetStart = new Date(Math.min.apply(null, dates));
    var datasetEnd = new Date(Math.max.apply(null, dates));
    var start = parseDateInput(spillFilters.dateStart) || datasetStart;
    var end = parseDateInput(spillFilters.dateEnd) || datasetEnd;
    if (start > end) return null;
    return { start: start, end: end };
}

function setSpillPlaybackButton(playing) {
    var button = document.getElementById('spill-timelapse-play');
    if (!button) return;
    button.innerHTML = playing
        ? '<i class="bi bi-pause-fill"></i>'
        : '<i class="bi bi-play-fill"></i>';
    button.setAttribute('aria-label', playing ? 'Pause spill timeline' : 'Play spill timeline');
    button.title = playing ? 'Pause spill timeline' : 'Play spill timeline';
}

function stopSpillTimelapse() {
    if (spillPlayback.timer) clearInterval(spillPlayback.timer);
    spillPlayback.timer = null;
    spillPlayback.playing = false;
    setSpillPlaybackButton(false);
}

function resetSpillTimelapse() {
    stopSpillTimelapse();
    var bounds = getSpillPlaybackBounds();
    var range = document.getElementById('spill-timelapse-range');
    var play = document.getElementById('spill-timelapse-play');
    spillPlayback.features = [];
    spillPlayback.nextIndex = 0;
    spillPlayback.currentDate = null;

    if (!bounds) {
        range.disabled = true;
        play.disabled = true;
        setSpillPlaybackStatus('Choose a valid date range');
        return;
    }

    spillPlayback.start = bounds.start;
    spillPlayback.end = bounds.end;
    var totalDays = Math.max(0, Math.round((bounds.end - bounds.start) / 86400000));
    range.min = 0;
    range.max = totalDays;
    range.value = totalDays;
    range.disabled = false;
    play.disabled = false;
    setSpillPlaybackStatus(formatPlaybackDate(bounds.start), 'to ' + formatPlaybackDate(bounds.end));
}

function buildSpillPlaybackFeatures() {
    spillPlayback.features = window.allSpillFeatures
        .filter(featureMatchesFilters)
        .map(function (feature) {
            return { feature: feature, date: parseSpillDate(feature.properties.LOCAL_DATETIME) };
        })
        .filter(function (item) { return item.date; })
        .sort(function (a, b) { return a.date - b.date; });
    spillPlayback.nextIndex = 0;
}

function renderSpillPlaybackDate(date) {
    var layer = geo_json_74a8ff648bc5b9190beaecc887f54037;
    var targetIndex = 0;
    while (
        targetIndex < spillPlayback.features.length &&
        spillPlayback.features[targetIndex].date <= date
    ) {
        targetIndex++;
    }

    var rebuilding = targetIndex < spillPlayback.nextIndex;
    if (rebuilding) {
        layer.clearLayers();
        spillPlayback.nextIndex = 0;
    }

    var visibleFeatures = spillPlayback.features
        .slice(0, targetIndex)
        .map(function (item) { return item.feature; });
    prepareCoincidentSpills(visibleFeatures);

    var newFeatures = spillPlayback.features
        .slice(spillPlayback.nextIndex, targetIndex)
        .map(function (item) { return item.feature; });
    if (newFeatures.length) {
        layer.addData({ type: 'FeatureCollection', features: newFeatures });
    }

    spillPlayback.nextIndex = targetIndex;
    spillPlayback.currentDate = date;
    positionCoincidentSpills();

    var sevCheckbox = document.getElementById('severity-gradient-checkbox');
    if (sevCheckbox && sevCheckbox.checked) toggleSpillSeverity(true);

    document.getElementById('spill-filters-count-val').textContent =
        targetIndex.toLocaleString();
    document.getElementById('spill-filters-count-total').textContent =
        window.allSpillFeatures.length.toLocaleString();
    setSpillPlaybackStatus(formatPlaybackDate(date), targetIndex.toLocaleString() + ' incidents');
    if (typeof updateSpillVisualization === 'function') updateSpillVisualization();
}

function startSpillTimelapse() {
    var range = document.getElementById('spill-timelapse-range');
    if (spillPlayback.playing) {
        stopSpillTimelapse();
        return;
    }
    if (!spillPlayback.start || !spillPlayback.end) resetSpillTimelapse();
    if (!spillPlayback.start || range.disabled) return;

    if (!spillsOn) setSpills(true);

    if (!spillPlayback.features.length || Number(range.value) >= Number(range.max)) {
        buildSpillPlaybackFeatures();
        geo_json_74a8ff648bc5b9190beaecc887f54037.clearLayers();
        range.value = 0;
        renderSpillPlaybackDate(new Date(spillPlayback.start));
    }

    spillPlayback.playing = true;
    setSpillPlaybackButton(true);
    var step = Math.max(1, Math.ceil(Number(range.max) / 80));
    spillPlayback.timer = setInterval(function () {
        var nextValue = Math.min(Number(range.max), Number(range.value) + step);
        range.value = nextValue;
        var nextDate = new Date(spillPlayback.start);
        nextDate.setDate(nextDate.getDate() + nextValue);
        renderSpillPlaybackDate(nextDate);
        if (nextValue >= Number(range.max)) stopSpillTimelapse();
    }, 180);
}

document.body.insertAdjacentHTML('beforeend', `
<div id="chart-backdrop">
  <div id="chart-modal" role="dialog" aria-modal="true" aria-labelledby="spill-chart-title">
    <div class="chart-header">
      <h3 id="spill-chart-title">Spill data over time</h3>
      <div class="chart-subhead">Active filters and the highlighted boundary are applied automatically</div>
      <button class="chart-close" id="chart-close-btn" aria-label="Close spill chart">&#x2715;</button>
    </div>
    <div class="chart-body">
      <div class="chart-controls">
        <div class="chart-control">
          <label for="spill-chart-metric">Variable</label>
          <select id="spill-chart-metric">
            <option value="total_volume">Total volume spilled</option>
            <option value="incident_count">Number of incidents</option>
            <option value="average_volume">Average spill size</option>
            <option value="median_volume">Median spill size</option>
            <option value="largest_spill">Largest single spill</option>
            <option value="cumulative_volume">Cumulative volume spilled</option>
            <option value="cumulative_incidents">Cumulative incidents</option>
          </select>
        </div>
        <div class="chart-control">
          <label for="spill-chart-period">Time interval</label>
          <select id="spill-chart-period">
            <option value="year">Year</option>
            <option value="quarter">Quarter</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div class="chart-control">
          <label for="spill-chart-group">Series</label>
          <select id="spill-chart-group">
            <option value="none">All incidents</option>
            <option value="commodity">By commodity</option>
            <option value="cause">By cause</option>
          </select>
        </div>
      </div>
      <div id="spill-chart-scope" aria-live="polite"></div>
      <div id="spill-plot" role="img" aria-label="Interactive spill data time-series chart"></div>
      <div id="spill-chart-empty">No incidents match the current chart scope.</div>
      <div class="chart-source">Source: PHMSA Hazardous Liquid Incident Reports</div>
    </div>
  </div>
</div>
`);

var spillChartRevision = 0;

function chartPeriodStart(date, interval) {
    if (interval === 'month') return new Date(date.getFullYear(), date.getMonth(), 1);
    if (interval === 'quarter') {
        return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
    }
    return new Date(date.getFullYear(), 0, 1);
}

function nextChartPeriod(date, interval) {
    var next = new Date(date);
    if (interval === 'month') next.setMonth(next.getMonth() + 1);
    else if (interval === 'quarter') next.setMonth(next.getMonth() + 3);
    else next.setFullYear(next.getFullYear() + 1);
    return next;
}

function chartPeriodKey(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-01';
}

function chartPeriodLabel(date, interval) {
    if (interval === 'year') return String(date.getFullYear());
    if (interval === 'quarter') {
        return 'Q' + (Math.floor(date.getMonth() / 3) + 1) + ' ' + date.getFullYear();
    }
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function chartGroupValue(feature, grouping) {
    var props = feature.properties || {};
    if (grouping === 'commodity') return props.COMMODITY_RELEASED_TYPE || 'Unknown commodity';
    if (grouping === 'cause') return props.CAUSE || 'Unknown cause';
    return 'All incidents';
}

function chartGroupLabel(value) {
    if (value === 'CRUDE OIL') return 'Crude Oil';
    if (value.indexOf('REFINED AND/OR PETROLEUM') === 0) return 'Refined / Petroleum';
    if (value.indexOf('HVL OR OTHER') === 0) return 'HVL / Flammable Gas';
    if (value.indexOf('BIOFUEL') === 0) return 'Biofuel / Alternative';
    if (value.indexOf('CO2') === 0) return 'CO2';
    return value.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
}

function chartMetricInfo(metric) {
    var values = {
        total_volume: { title: 'Total Volume Spilled', axis: 'Barrels', format: ',.1f', cumulative: false },
        incident_count: { title: 'Number of Incidents', axis: 'Incidents', format: ',d', cumulative: false },
        average_volume: { title: 'Average Spill Size', axis: 'Barrels per incident', format: ',.1f', cumulative: false },
        median_volume: { title: 'Median Spill Size', axis: 'Barrels per incident', format: ',.1f', cumulative: false },
        largest_spill: { title: 'Largest Single Spill', axis: 'Barrels', format: ',.1f', cumulative: false },
        cumulative_volume: { title: 'Cumulative Volume Spilled', axis: 'Barrels', format: ',.1f', cumulative: true },
        cumulative_incidents: { title: 'Cumulative Incidents', axis: 'Incidents', format: ',d', cumulative: true }
    };
    return values[metric];
}

function chartBucketValue(features, metric) {
    if (metric === 'incident_count' || metric === 'cumulative_incidents') return features.length;
    if (!features.length && metric !== 'total_volume' && metric !== 'cumulative_volume') {
        return null;
    }
    var volumes = features.map(function (feature) {
        return parseFloat(feature.properties.UNINTENTIONAL_RELEASE_BBLS) || 0;
    });
    if (!volumes.length) return 0;
    if (metric === 'total_volume' || metric === 'cumulative_volume') {
        return volumes.reduce(function (sum, value) { return sum + value; }, 0);
    }
    if (metric === 'average_volume') {
        return volumes.reduce(function (sum, value) { return sum + value; }, 0) / volumes.length;
    }
    if (metric === 'largest_spill') return Math.max.apply(null, volumes);
    if (metric === 'median_volume') {
        volumes.sort(function (a, b) { return a - b; });
        var middle = Math.floor(volumes.length / 2);
        return volumes.length % 2
            ? volumes[middle]
            : (volumes[middle - 1] + volumes[middle]) / 2;
    }
    return 0;
}

function getHighlightedBoundary() {
    var layer = window.opisActiveBoundaryLayer;
    if (!layer || !map_10b250abf3b9fb60cf6682f90e22c04c.hasLayer(layer)) return null;
    return layer;
}

function getSpillChartFeatures() {
    var features = getFilteredSpillFeaturesForExport();
    var boundaryLayer = getHighlightedBoundary();
    if (!boundaryLayer) return features;
    var boundary = boundaryLayer.toGeoJSON();
    return features.filter(function (feature) {
        try {
            return turf.booleanPointInPolygon(feature, boundary);
        } catch (error) {
            return false;
        }
    });
}

function updateSpillVisualization(preserveView) {
    var backdrop = document.getElementById('chart-backdrop');
    if (!backdrop || !backdrop.classList.contains('open')) return;

    var plot = document.getElementById('spill-plot');
    var empty = document.getElementById('spill-chart-empty');
    var scope = document.getElementById('spill-chart-scope');
    if (typeof Plotly === 'undefined') {
        plot.style.display = 'none';
        empty.style.display = 'block';
        empty.textContent = 'Plotly could not be loaded. Check the network connection and try again.';
        return;
    }

    var metric = document.getElementById('spill-chart-metric').value;
    var interval = document.getElementById('spill-chart-period').value;
    var grouping = document.getElementById('spill-chart-group').value;
    var metricInfo = chartMetricInfo(metric);
    var features = getSpillChartFeatures();
    var boundaryLayer = getHighlightedBoundary();
    var bounds = getSpillPlaybackBounds();
    if (bounds && spillPlayback.currentDate && spillPlayback.currentDate < bounds.end) {
        bounds.end = new Date(spillPlayback.currentDate);
    }

    scope.textContent =
        features.length.toLocaleString() + ' incidents after active filters' +
        (boundaryLayer ? ' and highlighted boundary' : '') +
        (spillPlayback.currentDate ? ' through ' + formatPlaybackDate(spillPlayback.currentDate) : '');

    if (!features.length || !bounds || bounds.start > bounds.end) {
        plot.style.display = 'none';
        empty.style.display = 'block';
        empty.textContent = 'No incidents match the current chart scope.';
        if (plot.data) Plotly.purge(plot);
        return;
    }

    empty.style.display = 'none';
    plot.style.display = 'block';

    var periods = [];
    var cursor = chartPeriodStart(bounds.start, interval);
    var finalPeriod = chartPeriodStart(bounds.end, interval);
    while (cursor <= finalPeriod) {
        periods.push(new Date(cursor));
        cursor = nextChartPeriod(cursor, interval);
    }

    var groups = {};
    features.forEach(function (feature) {
        var date = parseSpillDate(feature.properties.LOCAL_DATETIME);
        if (!date) return;
        var group = chartGroupValue(feature, grouping);
        var period = chartPeriodKey(chartPeriodStart(date, interval));
        if (!groups[group]) groups[group] = {};
        if (!groups[group][period]) groups[group][period] = [];
        groups[group][period].push(feature);
    });

    var theme = getComputedStyle(document.documentElement);
    var panelColor = theme.getPropertyValue('--opis-panel').trim();
    var textColor = theme.getPropertyValue('--opis-secondary').trim();
    var gridColor = theme.getPropertyValue('--opis-line').trim();
    var groupNames = Object.keys(groups).sort();
    var colors = [
        theme.getPropertyValue('--opis-accent').trim(),
        '#c76a32', '#288577', '#88629f', '#397ca1', '#a54d49', '#a27618', '#687682'
    ];
    var traces = groupNames.map(function (group, groupIndex) {
        var running = 0;
        var y = periods.map(function (period) {
            var value = chartBucketValue(groups[group][chartPeriodKey(period)] || [], metric);
            if (metricInfo.cumulative) {
                running += value;
                return running;
            }
            return value;
        });
        return {
            type: 'scatter',
            mode: 'lines',
            name: chartGroupLabel(group),
            x: periods.map(chartPeriodKey),
            y: y,
            customdata: periods.map(function (period) {
                return chartPeriodLabel(period, interval);
            }),
            line: { color: colors[groupIndex % colors.length], width: 2 },
            marker: { color: colors[groupIndex % colors.length], size: 6 },
            hovertemplate:
                '%{customdata}<br>' + metricInfo.title + ': %{y:' + metricInfo.format + '}' +
                (grouping === 'none' ? '' : '<br>' + chartGroupLabel(group)) +
                '<extra></extra>'
        };
    });

    var groupedLegend = grouping !== 'none';
    var hasRangeSlider = interval !== 'year';
    var compactChart = plot.clientWidth < 520;
    var bottomMargin = groupedLegend
        ? (hasRangeSlider ? (compactChart ? 235 : 190) : (compactChart ? 190 : 150))
        : (hasRangeSlider ? 105 : 70);
    var legendY = hasRangeSlider
        ? (compactChart ? -0.68 : -0.48)
        : (compactChart ? -0.48 : -0.3);

    if (preserveView !== true) spillChartRevision++;
    Plotly.react(plot, traces, {
        title: { text: metricInfo.title, x: 0.02, xanchor: 'left', font: { size: 16, color: theme.getPropertyValue('--opis-ink').trim() } },
        datarevision: spillChartRevision,
        uirevision: spillChartRevision,
        paper_bgcolor: panelColor,
        plot_bgcolor: panelColor,
        margin: { l: 72, r: 24, t: 50, b: bottomMargin },
        hovermode: 'x unified',
        hoverlabel: { bgcolor: panelColor, font: { color: textColor } },
        hoversort: 'value descending',
        xaxis: {
            title: { text: 'Incident date', standoff: 10 },
            type: 'date',
            gridcolor: gridColor,
            zeroline: false,
            tickformat: interval === 'year' ? '%Y' : '%b %Y',
            rangeslider: { visible: interval !== 'year', thickness: 0.08, bgcolor: panelColor }
        },
        yaxis: {
            title: { text: metricInfo.axis },
            rangemode: 'tozero',
            gridcolor: gridColor,
            zerolinecolor: theme.getPropertyValue('--opis-control-line').trim()
        },
        legend: {
            orientation: 'h',
            x: 0,
            y: legendY,
            xanchor: 'left',
            yanchor: 'top',
            font: { size: 12 }
        },
        font: { family: 'Inter, sans-serif', size: 12, color: textColor }
    }, {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'opis-spill-data-over-time',
            height: 700,
            width: 1200,
            scale: 2
        }
    });
}

document.addEventListener('opis-theme-change', function () {
    updateSpillVisualization(true);
});

function openSpillVisualization() {
    closeAllModals();
    document.getElementById('chart-backdrop').classList.add('open');
    updateSpillVisualization();
    setTimeout(function () {
        var plot = document.getElementById('spill-plot');
        if (typeof Plotly !== 'undefined' && plot.data) Plotly.Plots.resize(plot);
    }, 50);
}

document.getElementById('spill-chart-btn').addEventListener('click', openSpillVisualization);
document.getElementById('chart-close-btn').addEventListener('click', function () {
    document.getElementById('chart-backdrop').classList.remove('open');
});
document.getElementById('chart-backdrop').addEventListener('click', function (event) {
    if (event.target === this) this.classList.remove('open');
});
['spill-chart-metric', 'spill-chart-period', 'spill-chart-group'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', updateSpillVisualization);
});
document.addEventListener('opis:boundarychange', updateSpillVisualization);

// Collapse/expand the filter panel
document.getElementById('spill-filters-toggle').addEventListener('click', function () {
    var controls = document.getElementById('spill-filter-controls');
    var collapsed = !controls.hidden;
    controls.hidden = collapsed;
    document.getElementById('spill-filters').classList.toggle('collapsed', collapsed);
    this.setAttribute('aria-expanded', String(!collapsed));
});

// Date inputs
document.getElementById('filter-date-start').addEventListener('change', function () {
    spillFilters.dateStart = this.value || null;
    resetSpillTimelapse();
    applySpillFilters();
});
document.getElementById('filter-date-end').addEventListener('change', function () {
    spillFilters.dateEnd = this.value || null;
    resetSpillTimelapse();
    applySpillFilters();
});

// Commodity dropdown
document.getElementById('filter-commodity').addEventListener('change', function () {
    spillFilters.commodity = this.value;
    resetSpillTimelapse();
    applySpillFilters();
});

// Cause dropdown
document.getElementById('filter-cause').addEventListener('change', function () {
    spillFilters.cause = this.value;
    resetSpillTimelapse();
    applySpillFilters();
});

// State dropdown
document.getElementById('filter-state').addEventListener('change', function () {
    spillFilters.state = this.value;
    resetSpillTimelapse();
    applySpillFilters();
});

function setCustomVolumeVisibility(visible) {
    var row = document.getElementById('filter-volume-custom-row');
    var pill = document.getElementById('filter-volume-custom-pill');
    row.hidden = !visible;
    pill.setAttribute('aria-expanded', visible ? 'true' : 'false');
}

function selectVolumeFilterControl(value, preferCustom) {
    var matchedPreset = false;
    document.querySelectorAll('#filter-volume-pills .filter-pill[data-min-bbls]').forEach(function (pill) {
        var matches = !preferCustom && (parseFloat(pill.dataset.minBbls) || 0) === value;
        pill.classList.toggle('active', matches);
        if (matches) matchedPreset = true;
    });

    var useCustom = preferCustom || !matchedPreset;
    document.getElementById('filter-volume-custom-pill').classList.toggle('active', useCustom);
    setCustomVolumeVisibility(useCustom);
    document.getElementById('filter-volume-custom-input').value =
        useCustom ? String(value) : '';
}

function applyCustomVolumeFilter() {
    var input = document.getElementById('filter-volume-custom-input');
    var value = parseFloat(input.value);
    if (!Number.isFinite(value) || value < 0) {
        input.setCustomValidity('Enter a minimum volume of 0 barrels or greater.');
        input.reportValidity();
        return;
    }
    input.setCustomValidity('');
    if (
        spillFilters.minBbls === value &&
        document.getElementById('filter-volume-custom-pill').classList.contains('active')
    ) {
        return;
    }
    spillFilters.minBbls = value;
    selectVolumeFilterControl(value, true);
    resetSpillTimelapse();
    applySpillFilters();
}

// Minimum volume pills (single-select)
document.querySelectorAll('#filter-volume-pills .filter-pill[data-min-bbls]').forEach(function (pill) {
    pill.addEventListener('click', function () {
        spillFilters.minBbls = parseFloat(pill.dataset.minBbls) || 0;
        selectVolumeFilterControl(spillFilters.minBbls, false);
        resetSpillTimelapse();
        applySpillFilters();
    });
});

document.getElementById('filter-volume-custom-pill').addEventListener('click', function () {
    selectVolumeFilterControl(spillFilters.minBbls, true);
    var input = document.getElementById('filter-volume-custom-input');
    input.focus();
    input.select();
});
document.getElementById('filter-volume-custom-apply').addEventListener('click', applyCustomVolumeFilter);
document.getElementById('filter-volume-custom-input').addEventListener('change', applyCustomVolumeFilter);
document.getElementById('filter-volume-custom-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        applyCustomVolumeFilter();
    }
});
document.getElementById('filter-volume-custom-input').addEventListener('input', function () {
    this.setCustomValidity('');
});

// Reset
document.getElementById('spill-filters-reset').addEventListener('click', function () {
    spillFilters = { dateStart: null, dateEnd: null, commodity: 'ALL', cause: 'ALL', state: 'ALL', minBbls: 0 };
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    document.getElementById('filter-commodity').value = 'ALL';
    document.getElementById('filter-cause').value = 'ALL';
    document.getElementById('filter-state').value = 'ALL';
    selectVolumeFilterControl(0, false);
    resetSpillTimelapse();
    applySpillFilters();
});

document.getElementById('spill-timelapse-play').addEventListener('click', startSpillTimelapse);
document.getElementById('spill-timelapse-range').addEventListener('input', function () {
    stopSpillTimelapse();
    if (!spillPlayback.features.length) buildSpillPlaybackFeatures();
    var date = new Date(spillPlayback.start);
    date.setDate(date.getDate() + Number(this.value));
    renderSpillPlaybackDate(date);
});

function getFilteredSpillFeaturesForExport() {
    var features = window.allSpillFeatures.filter(featureMatchesFilters);
    if (spillPlayback.currentDate) {
        features = features.filter(function (feature) {
            var date = parseSpillDate(feature.properties.LOCAL_DATETIME);
            return date && date <= spillPlayback.currentDate;
        });
    }
    return features;
}

function cleanSpillFeatureForExport(feature) {
    var properties = Object.assign({}, feature.properties || {});
    if (properties._state) properties.STATE = properties._state;
    delete properties._state;
    delete properties.COINCIDENT_COUNT;
    delete properties.COINCIDENT_INDEX;
    delete properties.COINCIDENT_DISPLAY;
    delete properties.style;

    return {
        type: 'Feature',
        geometry: JSON.parse(JSON.stringify(feature.geometry)),
        properties: properties
    };
}

function downloadOpisFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function csvCell(value) {
    var text = value === null || value === undefined ? '' : String(value);
    return '"' + text.replace(/"/g, '""') + '"';
}

function exportFilteredSpillsCsv() {
    var rows = [[
        'report_number', 'date', 'commodity', 'release_bbls', 'cause',
        'state', 'latitude', 'longitude', 'source'
    ]];

    getFilteredSpillFeaturesForExport().forEach(function (feature) {
        var props = feature.properties || {};
        var coords = feature.geometry.coordinates;
        rows.push([
            props.REPORT_NUMBER,
            props.LOCAL_DATETIME,
            props.COMMODITY_RELEASED_TYPE,
            props.UNINTENTIONAL_RELEASE_BBLS,
            props.CAUSE,
            props._state || '',
            coords[1],
            coords[0],
            props.DATA_SOURCE
        ]);
    });

    downloadOpisFile(
        'opis-filtered-spills.csv',
        rows.map(function (row) { return row.map(csvCell).join(','); }).join('\n'),
        'text/csv;charset=utf-8'
    );
    showToast('CSV downloaded');
}

function exportFilteredSpillsGeoJson() {
    var collection = {
        type: 'FeatureCollection',
        features: getFilteredSpillFeaturesForExport().map(cleanSpillFeatureForExport)
    };
    downloadOpisFile(
        'opis-filtered-spills.geojson',
        JSON.stringify(collection, null, 2),
        'application/geo+json;charset=utf-8'
    );
    showToast('GeoJSON downloaded');
}

window.exportOpisBoundary = function (boundaryId, format) {
    var analysis = typeof window.recalculateOpisBoundaryAnalysis === 'function'
        ? window.recalculateOpisBoundaryAnalysis(boundaryId)
        : (window.opisBoundaryAnalyses && window.opisBoundaryAnalyses[boundaryId]);
    if (!analysis) {
        showToast('Boundary results are not available');
        return;
    }

    if (format === 'json') {
        downloadOpisFile(
            'opis-boundary-analysis.json',
            JSON.stringify(analysis, null, 2),
            'application/json;charset=utf-8'
        );
        showToast('Boundary JSON downloaded');
        return;
    }

    var rows = [
        ['metric', 'value'],
        ['generated_at', analysis.generatedAt],
        ['pipeline_crossings', analysis.infrastructure.pipelineCrossings],
        ['estimated_pipeline_miles', analysis.infrastructure.estimatedPipelineMiles],
        ['mileage_coverage', analysis.infrastructure.mileageCoverage],
        ['unmeasured_pipeline_features', analysis.infrastructure.unmeasuredPipelineFeatures],
        ['active_operator_count', analysis.infrastructure.activeOperatorCount],
        ['active_operators', analysis.infrastructure.activeOperators.join('; ')],
        ['total_incidents', analysis.incidents.totalIncidents],
        ['total_barrels_spilled', analysis.incidents.totalBarrelsSpilled],
        ['average_spill_barrels', analysis.incidents.averageSpillBarrels],
        ['primary_cause', analysis.incidents.primaryCause]
    ];
    Object.keys(analysis.infrastructure.crossingsByType).forEach(function (type) {
        rows.push(['pipeline_crossings_' + type.toLowerCase().replace(/\s+/g, '_'), analysis.infrastructure.crossingsByType[type]]);
    });
    Object.keys(analysis.infrastructure.estimatedPipelineMilesByType).forEach(function (type) {
        rows.push(['estimated_pipeline_miles_' + type.toLowerCase().replace(/\s+/g, '_'), analysis.infrastructure.estimatedPipelineMilesByType[type]]);
    });
    Object.keys(analysis.incidents.incidentsByCause).forEach(function (cause) {
        rows.push(['incidents_' + cause.toLowerCase().replace(/\s+/g, '_'), analysis.incidents.incidentsByCause[cause]]);
    });

    downloadOpisFile(
        'opis-boundary-analysis.csv',
        rows.map(function (row) { return row.map(csvCell).join(','); }).join('\n'),
        'text/csv;charset=utf-8'
    );
    showToast('Boundary CSV downloaded');
};

function localDateString(date) {
    if (!date) return '';
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function buildOpisShareUrl() {
    var center = map_10b250abf3b9fb60cf6682f90e22c04c.getCenter();
    var params = new URLSearchParams();
    params.set('lat', center.lat.toFixed(5));
    params.set('lng', center.lng.toFixed(5));
    params.set('zoom', map_10b250abf3b9fb60cf6682f90e22c04c.getZoom());
    params.set('basemap', activeBasemap);
    var activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) params.set('tab', activeTab.dataset.tab);
    if (activePipeline) params.set('layer', activePipeline);
    if (spillsOn) params.set('spills', '1');
    if (document.getElementById('severity-gradient-checkbox').checked) params.set('severity', '1');
    if (spillFilters.dateStart) params.set('start', spillFilters.dateStart);
    if (spillFilters.dateEnd) params.set('end', spillFilters.dateEnd);
    if (spillFilters.commodity !== 'ALL') params.set('commodity', spillFilters.commodity);
    if (spillFilters.cause !== 'ALL') params.set('cause', spillFilters.cause);
    if (spillFilters.state !== 'ALL') params.set('state', spillFilters.state);
    if (spillFilters.minBbls) params.set('min', spillFilters.minBbls);
    if (spillPlayback.currentDate) params.set('timeline', localDateString(spillPlayback.currentDate));
    return location.origin + location.pathname + '?' + params.toString();
}

function copyTextFallback(text) {
    var input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
}

function copyOpisShareLink() {
    var url = buildOpisShareUrl();
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
            .then(function () { showToast('Share link copied'); })
            .catch(function () {
                copyTextFallback(url);
                showToast('Share link copied');
            });
    } else {
        copyTextFallback(url);
        showToast('Share link copied');
    }
}

function escapeReportHtml(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function filterSummaryText() {
    var parts = [];
    if (spillFilters.dateStart || spillFilters.dateEnd) {
        parts.push((spillFilters.dateStart || 'Dataset start') + ' to ' + (spillFilters.dateEnd || 'Dataset end'));
    } else {
        parts.push('January 1, 2010 to December 23, 2025');
    }
    if (spillFilters.commodity !== 'ALL') parts.push(spillFilters.commodity);
    if (spillFilters.state !== 'ALL') parts.push('State: ' + spillFilters.state);
    if (spillFilters.cause !== 'ALL') parts.push(spillFilters.cause);
    if (spillFilters.minBbls) parts.push(spillFilters.minBbls + '+ bbls');
    if (spillPlayback.currentDate) parts.push('Timeline through ' + localDateString(spillPlayback.currentDate));
    return parts.join(' | ');
}

function printOpisSummary() {
    var features = getFilteredSpillFeaturesForExport();
    var totalVolume = features.reduce(function (sum, feature) {
        return sum + (parseFloat(feature.properties.UNINTENTIONAL_RELEASE_BBLS) || 0);
    }, 0);
    var causes = {};
    features.forEach(function (feature) {
        var cause = feature.properties.CAUSE || 'Unknown';
        causes[cause] = (causes[cause] || 0) + 1;
    });
    var topCauses = Object.keys(causes)
        .sort(function (a, b) { return causes[b] - causes[a]; })
        .slice(0, 5);
    var center = map_10b250abf3b9fb60cf6682f90e22c04c.getCenter();
    var reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        showToast('Allow pop-ups to print a summary');
        return;
    }
    reportWindow.opener = null;
    var causeRows = topCauses.length
        ? topCauses.map(function (cause) {
            return '<tr><td>' + escapeReportHtml(cause) + '</td><td>' + causes[cause].toLocaleString() + '</td></tr>';
        }).join('')
        : '<tr><td colspan="2">No incidents match the current filters.</td></tr>';

    reportWindow.document.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>OPIS Map Summary</title>' +
        '<style>' +
        'body{font-family:Arial,sans-serif;color:#20262b;margin:40px;line-height:1.45}' +
        'header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #f5f6f7;padding-bottom:16px}' +
        'h1{font-size: 22px;margin:0}h2{font-size: 14px;color:#1e40af;margin:24px 0 8px;text-transform: none;letter-spacing: 0}' +
        '.meta{font-size: 12px;color:#68727d}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}' +
        '.card{border:1px solid #e4e6e8;border-radius:8px;padding:16px}.value{font-size: 22px;font-weight: 600}' +
        'table{width:100%;border-collapse:collapse;font-size: 12px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e4e6e8}' +
        '.actions{margin-top:24px}.actions button{padding:8px 16px;font-weight: 600}@media print{.actions{display:none}body{margin:20px}}' +
        '</style></head><body>' +
        '<header><div><h1>OPIS Map Summary</h1><div class="meta">Oil Pipeline Impact Simulator</div></div>' +
        '<div class="meta">Generated ' + escapeReportHtml(new Date().toLocaleString()) + '</div></header>' +
        '<h2>Current View</h2><table>' +
        '<tr><th>Map center</th><td>' + center.lat.toFixed(5) + ', ' + center.lng.toFixed(5) + '</td></tr>' +
        '<tr><th>Zoom</th><td>' + map_10b250abf3b9fb60cf6682f90e22c04c.getZoom() + '</td></tr>' +
        '<tr><th>Basemap</th><td>' + escapeReportHtml(activeBasemap) + '</td></tr>' +
        '<tr><th>Pipeline layer</th><td>' + escapeReportHtml(activePipeline || 'None selected') + '</td></tr>' +
        '<tr><th>Spill filters</th><td>' + escapeReportHtml(filterSummaryText()) + '</td></tr></table>' +
        '<h2>Filtered Incident Summary</h2><div class="cards">' +
        '<div class="card"><div class="meta">Incidents</div><div class="value">' + features.length.toLocaleString() + '</div></div>' +
        '<div class="card"><div class="meta">Total volume</div><div class="value">' + totalVolume.toLocaleString(undefined, {maximumFractionDigits: 1}) + '</div><div class="meta">barrels</div></div>' +
        '<div class="card"><div class="meta">Average volume</div><div class="value">' + (features.length ? (totalVolume / features.length).toFixed(1) : '0') + '</div><div class="meta">barrels</div></div>' +
        '</div><h2>Leading Causes</h2><table><tr><th>Cause</th><th>Incidents</th></tr>' + causeRows + '</table>' +
        '<h2>Source</h2><p class="meta">PHMSA Hazardous Liquid Incident Reports. Pipeline sources are documented in the OPIS Data Methodology and Appendix.</p>' +
        '<div class="actions"><button onclick="window.print()">Print or Save as PDF</button></div>' +
        '</body></html>'
    );
    reportWindow.document.close();
}

document.getElementById('export-spills-csv').addEventListener('click', exportFilteredSpillsCsv);
document.getElementById('export-spills-geojson').addEventListener('click', exportFilteredSpillsGeoJson);
document.getElementById('copy-share-link').addEventListener('click', copyOpisShareLink);
document.getElementById('print-map-summary').addEventListener('click', printOpisSummary);

var opisShareStateApplied = false;

function applyOpisShareState() {
    if (opisShareStateApplied) return true;
    var params = new URLSearchParams(location.search);
    var opisKeys = [
        'lat', 'lng', 'zoom', 'basemap', 'tab', 'layer', 'spills', 'severity',
        'start', 'end', 'commodity', 'cause', 'state', 'min', 'timeline'
    ];
    var hasOpisState = opisKeys.some(function (key) { return params.has(key); });
    if (!hasOpisState) {
        opisShareStateApplied = true;
        return true;
    }

    var sharedState = params.get('state');
    if (
        sharedState &&
        !Array.from(document.getElementById('filter-state').options).some(function (option) {
            return option.value === sharedState;
        })
    ) {
        return false;
    }

    var lat = parseFloat(params.get('lat'));
    var lng = parseFloat(params.get('lng'));
    var zoom = parseInt(params.get('zoom'), 10);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(zoom)) {
        map_10b250abf3b9fb60cf6682f90e22c04c.setView([lat, lng], zoom);
    }

    var basemap = params.get('basemap');
    if (basemap && basemaps[basemap] && basemap !== activeBasemap) {
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(basemaps[activeBasemap]);
        map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(basemaps[basemap]);
        activeBasemap = basemap;
        document.querySelectorAll('.bm-btn').forEach(function (button) {
            button.classList.toggle('active', button.dataset.bm === basemap);
        });
    }

    var sharedTab = params.get('tab');
    if (sharedTab) {
        var tabButton = document.querySelector('.tab-btn[data-tab="' + sharedTab + '"]');
        if (tabButton) tabButton.click();
    }

    spillFilters.dateStart = params.get('start') || null;
    spillFilters.dateEnd = params.get('end') || null;
    spillFilters.commodity = params.get('commodity') || 'ALL';
    spillFilters.cause = params.get('cause') || 'ALL';
    spillFilters.state = sharedState || 'ALL';
    spillFilters.minBbls = Math.max(0, parseFloat(params.get('min')) || 0);
    document.getElementById('filter-date-start').value = spillFilters.dateStart || '';
    document.getElementById('filter-date-end').value = spillFilters.dateEnd || '';
    document.getElementById('filter-commodity').value = spillFilters.commodity;
    document.getElementById('filter-cause').value = spillFilters.cause;
    document.getElementById('filter-state').value = spillFilters.state;
    selectVolumeFilterControl(spillFilters.minBbls, false);

    resetSpillTimelapse();
    applySpillFilters();

    var selectedLayer = params.get('layer');
    if (selectedLayer && pipelineLayers[selectedLayer]) {
        var layerItem = Array.from(document.querySelectorAll('#pipeline-list li')).find(function (item) {
            return item.dataset.layer === selectedLayer;
        });
        if (layerItem) layerItem.click();
    }

    if (params.get('spills') === '1' || params.has('timeline')) setSpills(true);

    var severity = params.get('severity') === '1';
    document.getElementById('severity-gradient-checkbox').checked = severity;
    toggleSpillSeverity(severity);

    var timeline = parseDateInput(params.get('timeline'));
    if (timeline && spillPlayback.start && spillPlayback.end) {
        if (timeline < spillPlayback.start) timeline = new Date(spillPlayback.start);
        if (timeline > spillPlayback.end) timeline = new Date(spillPlayback.end);
        buildSpillPlaybackFeatures();
        var range = document.getElementById('spill-timelapse-range');
        range.value = Math.round((timeline - spillPlayback.start) / 86400000);
        renderSpillPlaybackDate(timeline);
    }

    opisShareStateApplied = true;
    showToast('Shared map view restored');
    return true;
}

// Apply filters (no-op if all defaults) once spill data has loaded, so the
// "Showing X of Y" count is correct even before the user touches a filter.
// allSpillFeatures is set synchronously by pipelines.js before app.js runs,
// but guard with a short retry in case load order ever changes.
(function initSpillFilterCount() {
    if (window.allSpillFeatures) {
        resetSpillTimelapse();
        applySpillFilters();
        applyOpisShareState();
    } else {
        setTimeout(initSpillFilterCount, 50);
    }
})();

//  SPILL COST SIMULATOR

document.body.insertAdjacentHTML('beforeend', `
<div id="sim-backdrop">
<div id="sim-modal">
<div class="sim-header">
    <h3>Spill cost simulator</h3>
    <div class="sim-subhead">Crude oil scenarios &middot; Fixed coefficients</div>
    <button class="sim-close" id="sim-close-btn" aria-label="Close dialog">&#x2715;</button>
</div>
<div class="sim-body">

    <!-- Pipeline info strip -->
    <div class="sim-info-strip">
    <div class="info-row">
        <span class="info-label">Pipeline</span>
        <span class="info-val" id="sim-pipename">Not available</span>
    </div>
    <div class="info-row">
        <span class="info-label">Operator</span>
        <span class="info-val" id="sim-opername">Not available</span>
    </div>
    <div class="info-row">
        <span class="info-label">State</span>
        <span class="info-val" id="sim-state-display">Not available</span>
    </div>
    </div>

    <!-- Section: Scenario Inputs -->
    <div class="sim-section">
    <p class="sim-section-label">Scenario parameters</p>
    <div class="slider-row">
        <label>Release volume</label>
        <input type="range" id="sim-bbls" min="1" max="500" value="50">
        <span class="slider-val" id="sim-bbls-val">50 bbls</span>
    </div>

    <p class="sim-section-label" style="margin-top:12px">Facility &amp; location</p>
    <select id="sim-facility">
        <option value="interstate">Interstate Pipeline</option>
        <option value="intrastate">Intrastate Pipeline</option>
        <option value="gathering">Gathering Line</option>
    </select>
    <select id="sim-area">
        <option value="belowground">Below Ground</option>
        <option value="aboveground">Above Ground</option>
        <option value="underwater">Underwater / Crossing</option>
    </select>

    <p class="sim-section-label" style="margin-top:12px">Risk factors</p>
    <div class="check-grid">
        <label class="check-item">
        <input type="checkbox" id="sim-hipop">
        <span>High-density population area</span>
        </label>
        <label class="check-item">
        <input type="checkbox" id="sim-water">
        <span>Water contamination occurred</span>
        </label>
        <label class="check-item">
        <input type="checkbox" id="sim-remed">
        <span>Surface water remediation required</span>
        </label>
        <label class="check-item">
        <input type="checkbox" id="sim-wcross">
        <span>Water body crossing</span>
        </label>
    </div>
    </div>

    <button id="sim-run-btn">Estimate spill cost</button>

    <!-- Results -->
    <div id="sim-results">
    <div class="result-main">
        <div class="result-label">Estimated cost (2024 USD)</div>
        <div class="result-cost" id="res-cost">Not calculated</div>
        <div class="result-ci" id="res-ci">Illustrative interval: <strong>Not calculated</strong></div>
    </div>

    <p class="breakdown-title">Estimated cost breakdown</p>
    <div id="res-breakdown"></div>

    <p class="breakdown-title" style="margin-top:12px">Key cost drivers</p>
    <div class="drivers-row" id="res-drivers"></div>

    <p class="sim-disclaimer">
        Costs are in 2024 dollars. Every estimate assumes 50 years of equipment age.
        The illustrative interval uses the same margin on the log scale for every scenario. Actual spill costs can fall outside that interval.
    </p>
    </div>

</div>
</div>
</div>
`);

// Embedded model constants. The original source identifies PHMSA crude oil
// incidents (2015-2024) as training data. No fit artifact accompanies this checkout.
// Dependent variable: log1p(ADJUSTED_COST)
// Reported, unverified metadata: R-squared_adj ~ 0.61, N ~ 2,400 incidents.
var OLS = {
    intercept: 9.42,   // baseline ~$12,300
    age: 0.0118, // per year of equipment age
    log_bbls: 0.847,  // coefficient on log1p of release volume
    high_pop: 0.542,  // high pop area premium
    water_contam: 0.793,  // water contamination cost
    surface_remed: 0.618,  // surface remediation cost
    water_crossing: 0.312,  // crossing multiplier
    aboveground: -0.287,  // above ground cheaper to remediate
    underwater: 0.445,  // underwater incidents more expensive
    interstate: 0.148,  // interstate facility indicator
    intrastate: 0.045,  // intrastate (moderate)
    // gathering: 0 (reference category)
    se_mean: 0.078,  // fixed log-scale error used for the approximate interval
    // State adjustments on the logarithmic cost scale
    states: {
        AL: -0.15, AK: 0.45, AZ: 0.10, AR: -0.20, CA: 0.55, CO: 0.20, CT: 0.35,
        DE: 0.30, FL: 0.25, GA: -0.10, HI: 0.50, ID: 0.05, IL: 0.15, IN: -0.05,
        IA: -0.10, KS: -0.20, KY: -0.15, LA: 0.10, ME: 0.20, MD: 0.40, MA: 0.45,
        MI: 0.10, MN: 0.15, MS: -0.20, MO: -0.10, MT: 0.05, NE: -0.15, NV: 0.15,
        NH: 0.30, NJ: 0.50, NM: 0.00, NY: 0.55, NC: -0.05, ND: -0.05, OH: 0.05,
        OK: -0.25, OR: 0.25, PA: 0.20, RI: 0.35, SC: -0.10, SD: -0.10, TN: -0.10,
        TX: -0.10, UT: 0.10, VT: 0.25, VA: 0.15, WA: 0.30, WV: -0.05, WI: 0.10, WY: 0.05
    }
};

// Fixed display shares. Their derivation is absent from this checkout.
var COST_SPLIT = {
    'Operator Paid': { pct: 0.38, color: '#4a9eca' },
    'Property Damage': { pct: 0.22, color: '#e05c2a' },
    'Emergency Resp.': { pct: 0.18, color: '#f39c12' },
    'Environmental': { pct: 0.15, color: '#2ecc71' },
    'Other': { pct: 0.07, color: '#95a5a6' },
};

// State detection from lat/lng
// Bounding boxes for all 48 contiguous states + AK + HI
var STATE_BOXES = [
    { s: 'ME', n: 47.5, S: 43.0, w: -71.1, e: -66.9 }, { s: 'NH', n: 45.3, S: 42.7, w: -72.6, e: -70.6 },
    { s: 'VT', n: 45.0, S: 42.7, w: -73.5, e: -71.5 }, { s: 'MA', n: 42.9, S: 41.2, w: -73.5, e: -69.9 },
    { s: 'RI', n: 42.0, S: 41.1, w: -71.9, e: -71.1 }, { s: 'CT', n: 42.1, S: 40.9, w: -73.7, e: -71.8 },
    { s: 'NY', n: 45.0, S: 40.5, w: -79.8, e: -71.9 }, { s: 'NJ', n: 41.4, S: 38.9, w: -75.6, e: -73.9 },
    { s: 'PA', n: 42.3, S: 39.7, w: -80.5, e: -74.7 }, { s: 'DE', n: 39.8, S: 38.4, w: -75.8, e: -75.0 },
    { s: 'MD', n: 39.7, S: 37.9, w: -79.5, e: -75.0 }, { s: 'VA', n: 39.5, S: 36.5, w: -83.7, e: -75.2 },
    { s: 'WV', n: 40.6, S: 37.2, w: -82.6, e: -77.7 }, { s: 'NC', n: 36.6, S: 33.8, w: -84.3, e: -75.5 },
    { s: 'SC', n: 35.2, S: 32.0, w: -83.4, e: -78.5 }, { s: 'GA', n: 35.0, S: 30.4, w: -85.6, e: -80.8 },
    { s: 'FL', n: 31.0, S: 24.5, w: -87.6, e: -80.0 }, { s: 'AL', n: 35.0, S: 30.2, w: -88.5, e: -84.9 },
    { s: 'MS', n: 35.0, S: 30.2, w: -91.7, e: -88.1 }, { s: 'TN', n: 36.7, S: 35.0, w: -90.3, e: -81.6 },
    { s: 'KY', n: 39.1, S: 36.5, w: -89.6, e: -81.9 }, { s: 'OH', n: 42.3, S: 38.4, w: -84.8, e: -80.5 },
    { s: 'IN', n: 41.8, S: 37.8, w: -88.1, e: -84.8 }, { s: 'MI', n: 48.3, S: 41.7, w: -90.4, e: -82.1 },
    { s: 'WI', n: 47.1, S: 42.5, w: -92.9, e: -86.8 }, { s: 'IL', n: 42.5, S: 36.9, w: -91.5, e: -87.0 },
    { s: 'MN', n: 49.4, S: 43.5, w: -97.2, e: -89.5 }, { s: 'IA', n: 43.5, S: 40.4, w: -96.6, e: -90.1 },
    { s: 'MO', n: 40.6, S: 36.0, w: -95.8, e: -89.1 }, { s: 'AR', n: 36.5, S: 33.0, w: -94.6, e: -89.6 },
    { s: 'LA', n: 33.0, S: 28.9, w: -94.1, e: -88.8 }, { s: 'TX', n: 36.5, S: 25.8, w: -106.7, e: -93.5 },
    { s: 'OK', n: 37.0, S: 33.6, w: -103.0, e: -94.4 }, { s: 'KS', n: 40.0, S: 36.9, w: -102.1, e: -94.6 },
    { s: 'NE', n: 43.0, S: 40.0, w: -104.1, e: -95.3 }, { s: 'SD', n: 45.9, S: 42.5, w: -104.1, e: -96.4 },
    { s: 'ND', n: 49.0, S: 45.9, w: -104.1, e: -96.5 }, { s: 'MT', n: 49.0, S: 44.4, w: -116.1, e: -104.0 },
    { s: 'WY', n: 45.0, S: 41.0, w: -111.1, e: -104.0 }, { s: 'CO', n: 41.0, S: 37.0, w: -109.1, e: -102.0 },
    { s: 'NM', n: 37.0, S: 31.3, w: -109.1, e: -103.0 }, { s: 'AZ', n: 37.0, S: 31.3, w: -114.8, e: -109.0 },
    { s: 'UT', n: 42.0, S: 37.0, w: -114.1, e: -109.0 }, { s: 'NV', n: 42.0, S: 35.0, w: -120.0, e: -114.0 },
    { s: 'ID', n: 49.0, S: 42.0, w: -117.3, e: -111.0 }, { s: 'WA', n: 49.0, S: 45.5, w: -124.8, e: -116.9 },
    { s: 'OR', n: 46.3, S: 42.0, w: -124.6, e: -116.5 }, { s: 'CA', n: 42.0, S: 32.5, w: -124.5, e: -114.1 },
    { s: 'AK', n: 71.5, S: 54.0, w: -168.0, e: -130.0 }, { s: 'HI', n: 22.5, S: 18.0, w: -160.0, e: -154.0 }
];

// Fallback state lookup for features that don't have a precomputed _state
// (e.g. pipeline segments, which only get bounding-box detection, not the
// turf/us-atlas polygon lookup used for spills). Simple bounding-box test;
// boxes can overlap slightly near borders, so this returns the first match.
function detectState(lat, lng) {
    for (var i = 0; i < STATE_BOXES.length; i++) {
        var b = STATE_BOXES[i];
        if (lat <= b.n && lat >= b.S && lng >= b.w && lng <= b.e) {
            return b.s;
        }
    }
    return null;
}

function precomputeSpillStates(statesGeoJSON) {
    window.allSpillFeatures.forEach(function(feature) {
        var match = null;
        var coords = feature.geometry && feature.geometry.coordinates;
        try {
            var pt = turf.point(coords);
            match = statesGeoJSON.features.find(function(s) {
                return turf.booleanPointInPolygon(pt, s);
            });
        } catch (e) {
            // Non-point geometry or malformed coordinates - fall through to the
            // bounding-box fallback below rather than aborting for every feature.
        }

        if (match) {
            feature.properties._state = match.properties.postal;
        } else if (coords && coords.length === 2) {
            // The precise polygon test can miss coastal points that fall just
            // outside the simplified state boundary (PHMSA-reported coordinates
            // vs. TIGER/us-atlas coastline resolution don't always agree exactly
            // - e.g. North Slope facilities sitting right at the shoreline).
            // Fall back to a coarse bounding-box check instead of leaving these
            // features unmatched to any state, which would silently exclude
            // them from every state filter even though they're clearly onshore.
            feature.properties._state = detectState(coords[1], coords[0]);
        } else {
            feature.properties._state = null;
        }
    });
}

// Builds the State filter <select> options from whatever state codes
// actually showed up in the data, so it never falls out of sync with the dataset.
function populateStateFilterOptions() {
    var select = document.getElementById('filter-state');
    if (!select) return;

    var stateNames = {
        AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
        CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
        HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
        KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
        MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
        MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
        NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
        ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
        RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
        TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
        WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
    };

    var present = {};
    window.allSpillFeatures.forEach(function (f) {
        var st = f.properties && f.properties._state;
        if (st) present[st] = true;
    });

    Object.keys(present).sort().forEach(function (code) {
        var opt = document.createElement('option');
        opt.value = code;
        opt.textContent = stateNames[code] || code;
        select.appendChild(opt);
    });
}

(function initSpillFilterCount() {
    if (window.allSpillFeatures) {
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
            .then(r => r.json())
            .then(function(topology) {
                // us-atlas ships as TopoJSON; convert it to GeoJSON.
                var statesGeoJSON = topojson.feature(topology, topology.objects.states);

                // us-atlas uses FIPS codes rather than abbreviations, so map them.
                var fipsToPostal = {
                    '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
                    '10':'DE','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN',
                    '19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA',
                    '26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV',
                    '33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH',
                    '40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN',
                    '48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI',
                    '56':'WY'
                };
                statesGeoJSON.features.forEach(function(f) {
                    f.properties.postal = fipsToPostal[f.id] || null;
                });

                precomputeSpillStates(statesGeoJSON);
                populateStateFilterOptions();
                if (!applyOpisShareState()) applySpillFilters();
            });
    } else {
        setTimeout(initSpillFilterCount, 50);
    }
})();

// Simulator state 
var simState = null; // detected 2-letter state code
var simClickLatLng = null;

// Open simulator
function openSimulator(props, latlng) {
    closeAllModals();
    simClickLatLng = latlng;
    simState = props._state || detectState(latlng.lat, latlng.lng);

    document.getElementById('sim-pipename').textContent =
        (props.Pipename || props.pipename || 'Unknown');
    document.getElementById('sim-opername').textContent =
        (props.Opername || props.opername || 'Unknown');
    document.getElementById('sim-state-display').textContent =
        simState + ' (detected from coordinates)';

    // Reset results
    document.getElementById('sim-results').classList.remove('visible');
    document.getElementById('sim-backdrop').classList.add('open');

    gtag('event', 'run_simulation', {
        'pipeline_operator': props.opername || props.Opername || 'Unknown',
        'pipeline_name': props.Pipename || props.pipename || 'Unknown'
    });
}

// Close simulator  
document.getElementById('sim-close-btn').addEventListener('click', function () {
    document.getElementById('sim-backdrop').classList.remove('open');
});
document.getElementById('sim-backdrop').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
});

// Slider live readouts 
document.getElementById('sim-bbls').addEventListener('input', function () {
    document.getElementById('sim-bbls-val').textContent = this.value + ' bbls';
});

// Run simulation 
document.getElementById('sim-run-btn').addEventListener('click', function () {
    var age = 50; // Hardcoded: 50-year equipment age baseline
    var bbls = parseFloat(document.getElementById('sim-bbls').value);
    var hipop = document.getElementById('sim-hipop').checked ? 1 : 0;
    var water = document.getElementById('sim-water').checked ? 1 : 0;
    var remed = document.getElementById('sim-remed').checked ? 1 : 0;
    var wcross = document.getElementById('sim-wcross').checked ? 1 : 0;
    var facility = document.getElementById('sim-facility').value;
    var area = document.getElementById('sim-area').value;
    var state = simState || 'TX';

    var logBbls = Math.log1p(bbls);

    // Linear combination (OLS on log scale)
    var linPred = OLS.intercept
        + OLS.age * age
        + OLS.log_bbls * logBbls
        + OLS.high_pop * hipop
        + OLS.water_contam * water
        + OLS.surface_remed * remed
        + OLS.water_crossing * wcross
        + (area === 'aboveground' ? OLS.aboveground : 0)
        + (area === 'underwater' ? OLS.underwater : 0)
        + (facility === 'interstate' ? OLS.interstate : 0)
        + (facility === 'intrastate' ? OLS.intrastate : 0)
        + (OLS.states[state] || 0);

    // Back-transform from log scale
    var predCost = Math.expm1(linPred);
    var lowerMean = Math.expm1(linPred - 1.96 * OLS.se_mean);
    var upperMean = Math.expm1(linPred + 1.96 * OLS.se_mean);

    // Format currency 
    function fmt(v) {
        if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
        if (v >= 1e3) return '$' + Math.round(v).toLocaleString();
        return '$' + Math.round(v).toLocaleString();
    }

    document.getElementById('res-cost').textContent = fmt(predCost);
    document.getElementById('res-ci').innerHTML =
        'Illustrative interval: <strong>' +
        fmt(lowerMean) + ' to ' + fmt(upperMean) + '</strong>';

    // Cost breakdown bars
    var breakdown = document.getElementById('res-breakdown');
    breakdown.innerHTML = '';
    var cats = Object.keys(COST_SPLIT);
    cats.forEach(function (cat) {
        var info = COST_SPLIT[cat];
        var amt = predCost * info.pct;
        var row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML =
            '<span class="bar-label">' + cat + '</span>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' +
            (info.pct * 100) + '%;background:' + info.color + '"></div></div>' +
            '<span class="bar-amount">' + fmt(amt) + '</span>';
        breakdown.appendChild(row);
    });

    // Driver pills  
    var drivers = document.getElementById('res-drivers');
    drivers.innerHTML = '';
    var pills = [];
    pills.push({ label: '50 yr equipment (baseline)', cls: 'med' });
    pills.push({ label: bbls + ' bbls released', cls: bbls > 200 ? 'high' : bbls > 50 ? 'med' : '' });
    if (hipop) pills.push({ label: 'High population', cls: 'high' });
    if (water) pills.push({ label: 'Water contamination', cls: 'high' });
    if (remed) pills.push({ label: 'Surface remediation', cls: 'med' });
    if (wcross) pills.push({ label: 'Water crossing', cls: 'med' });
    if (area === 'underwater') pills.push({ label: 'Underwater incident', cls: 'high' });
    if (facility === 'interstate') pills.push({ label: 'Interstate', cls: '' });
    pills.push({ label: 'State: ' + state, cls: (OLS.states[state] || 0) > 0.3 ? 'med' : '' });
    pills.forEach(function (p) {
        var el = document.createElement('div');
        el.className = 'driver-pill ' + p.cls;
        el.textContent = p.label;
        drivers.appendChild(el);
    });

    document.getElementById('sim-results').classList.add('visible');
document.getElementById('sim-results').classList.add('visible');
});

// barrel coloring gradient
function getGradientColor(bbls) {
    if (bbls <= 0) return '#fee08b'; 
    var score = Math.log1p(bbls) / Math.log1p(1000); 
    if (score > 1) score = 1; 

    var r, g, b;
    if (score < 0.25) {
        var t = score / 0.25;
        r = Math.round(254 + (253 - 254) * t); g = Math.round(224 + (187 - 224) * t); b = Math.round(139 + (132 - 139) * t);
    } else if (score < 0.55) {
        var t = (score - 0.25) / 0.30;
        r = Math.round(253 + (239 - 253) * t); g = Math.round(187 + (101 - 187) * t); b = Math.round(132 + (72 - 132) * t);
    } else if (score < 0.82) {
        var t = (score - 0.55) / 0.27;
        r = Math.round(239 + (215 - 239) * t); g = Math.round(101 + (48 - 101) * t); b = Math.round(72 + (39 - 72) * t);
    } else {
        var t = (score - 0.82) / 0.18;
        r = Math.round(215 + (74 - 215) * t); g = Math.round(48 + (0 - 48) * t); b = Math.round(39 + (0 - 39) * t);
    }
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function toggleSpillSeverity(useGradient) {
    // Locate either the target sublayer collection variable or global container references
    var targets = typeof geo_json_74a8ff648bc5b9190beaecc887f54037 !== 'undefined' 
        ? [geo_json_74a8ff648bc5b9190beaecc887f54037] 
        : (typeof spillsLayer !== 'undefined' ? [spillsLayer] : []);

    targets.forEach(function(layerInstance) {
        if (!layerInstance || typeof layerInstance.setStyle !== 'function') return;

        layerInstance.setStyle(function(feature) {
            var bbls = parseFloat(feature.properties.UNINTENTIONAL_RELEASE_BBLS) || 0;
            
            if (useGradient) {
                return {
                    radius: Math.max(3.5, Math.log1p(bbls) * 2.2),
                    fillColor: getGradientColor(bbls),
                    color: "#20262b",
                    weight: 0.7,
                    opacity: 0.85,
                    fillOpacity: 0.8
                };
            } else {
                // Revert to the default uniform presentation configuration
                return {
                    radius: 4,
                    fillColor: "#ff4444", 
                    color: "black",
                    weight: 1,
                    opacity: 1.0,
                    fillOpacity: 0.8
                };
            }
        });
    });
}
document.getElementById('severity-toggle-container').addEventListener('click', function() {
    var checkbox = document.getElementById('severity-gradient-checkbox');
    if (checkbox) {
        // Toggle the checkbox state
        checkbox.checked = !checkbox.checked;
        // Trigger the manual update function with the new state
        toggleSpillSeverity(checkbox.checked);
    }
});


// Space and Enter activate the map's existing layer and filter controls.
document.querySelectorAll('#pipeline-list li').forEach(function (control) {
    control.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        control.click();
    });
});
