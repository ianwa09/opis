var tutorialSteps = [
{
icon: 'bi-map', 
title: 'Welcome to OPIS!',
body: 'This tool lets you explore the U.S. pipeline network and simulate the estimated cost of a spill incident. Use the right-hand panel to control what\'s shown on the map.<br><br>This short tutorial walks you through the key features.'
},
{
icon: 'bi-droplet-half', 
title: 'Select a Pipeline Layer',
body: 'In the <strong>Pipelines</strong> tab on the right, pick a pipeline type: Crude Oil, Natural Gas, Petroleum Products, and more. Only one type is shown at a time for clarity and performance.<br><br>Each type appears in a distinct color on the map.'
},
{
icon: 'bi-layers',
title: 'Switch Your Basemap',
body: 'At the top of the Pipelines tab, you can switch between three basemaps:<br><br><strong>Dark</strong>: best for seeing pipeline routes clearly<br><strong>Satellite</strong>: see real-world terrain and infrastructure<br><strong>Street</strong>: reference cities and roads'
},
{
icon: 'bi-lightning-charge', 
title: 'Run a Spill Cost Simulation',
body: '<strong>Select the Crude Oil layer, then click any pipeline on the map</strong> to open the Spill Cost Simulator. The simulator is calibrated to crude oil incidents only, using PHMSA data from 2015 to 2024.<br><br>Adjust release volume, location type, and environmental risk factors to estimate total incident costs, broken down by category.'
},
{
icon: 'bi-exclamation-circle',
title: 'View Historical Spill Incidents',
body: 'Switch to the <strong>Spill History</strong> tab to toggle on a layer of real PHMSA-reported hazardous liquid spill incidents. Each marker shows date, commodity, volume released, and cause.<br><br><em>Note: this dataset is large and may take a few seconds to load.</em>'
},
{
icon: 'bi-file-earmark-text', 
title: 'Data Sources & Methodology',
body: 'Tap the <strong>Data Methodology &amp; Appendix</strong> button in the Spill History tab to review the data sources, regression model coefficients, and cost category definitions behind the simulator.<br><br>Contact us at <a href="mailto:iwang@imsa.edu">iwang@imsa.edu</a> and <a href="mailto:olee@imsa.edu">olee@imsa.edu</a> with any questions or suggestions.<br><br>You\'re all set. Explore the map!'
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
    dots.forEach(function(d, i) {
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
    <button class="tut-close" id="tut-close-btn">&#x2715;</button>
</div>
<div class="tut-body">
    <div class="tut-dots">
    ${tutorialSteps.map(function(_,i){ return '<div class="tut-dot' + (i===0?' active':'') + '"></div>'; }).join('')}
    </div>
    <div class="tut-icon" id="tut-icon"></div>
    <div class="tut-step-title" id="tut-step-title"></div>
    <div class="tut-step-body" id="tut-step-body"></div>
</div>
<div class="tut-footer">
    <label class="tut-checkbox-row">
    <input type="checkbox" id="tut-no-show">
    Don't show again
    </label>
    <div style="display:flex;align-items:center;gap:12px">
    <span style="font-size:11px;color:#94a3b8" id="tut-step-num"></span>
    <div class="tut-nav">
        <button class="tut-prev" id="tut-prev-btn" style="display:none">&#8592; Back</button>
        <button class="tut-next" id="tut-next-btn">Next &#8594;</button>
    </div>
    </div>
</div>
</div>
</div>
`);

renderTutStep();


// Helper function to close any open modals on the screen
function closeAllModals() {
    var openBackdrops = document.querySelectorAll('.contact-backdrop, #tutorial-backdrop, #meth-backdrop, #sim-backdrop');
    openBackdrops.forEach(function(backdrop) {
        backdrop.classList.remove('open');
    });
    
    // Optional: Reset tutorial step back to 0 if it was closed
    if (typeof currentStep !== 'undefined') {
        currentStep = 0;
        if (typeof showStep === 'function') { showStep(0); }
    }
}
// Function to handle closing and saving preference
function closeAndSaveTutorial() {
    document.getElementById('tutorial-backdrop').classList.remove('open');
}
// Close the tutorial completely if the user clicks out onto the backdrop overlay
document.getElementById('tutorial-backdrop').addEventListener('click', function(e) {
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
document.getElementById('tut-next-btn').addEventListener('click', function() {
    if (tutStep < tutorialSteps.length - 1) {
        tutStep++;
        renderTutStep();
    } else {
        closeAndSaveTutorial(); // Triggers when "Get started →" is clicked on the final step
    }
});
document.getElementById('tut-prev-btn').addEventListener('click', function() {
if (tutStep > 0) { tutStep--; renderTutStep(); }
});
document.getElementById('tutorial-btn').addEventListener('click', function() {
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

document.addEventListener('change', function(e) {
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
    <h3>Get in Touch</h3>
    <div class="contact-subtitle">Data sharing, inquiries, and feature requests</div>
    <button class="contact-close" id="contact-close-btn">&#x2715;</button>
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
            <i class="bi bi-envelope-fill"></i>
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
document.getElementById('contact-btn').addEventListener('click', function() {
    closeAllModals();
    
    document.getElementById('contact-backdrop').classList.add('open');
});

['contact-close-btn'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', function() {
            document.getElementById('contact-backdrop').classList.remove('open');
        });
    }
});

// Close if they click the background backdrop layout
document.getElementById('contact-backdrop').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('open');
    }
});


// Methodology modal
document.body.insertAdjacentHTML('beforeend', `
<div id="meth-backdrop">
<div id="meth-modal">
<div class="meth-header">
    <h3>Data Methodology &amp; Appendix</h3>
    <div class="meth-subhead">Sources, Assumptions &amp; Analytical Methods</div>
    <button class="meth-close" id="meth-close-btn">&#x2715;</button>
</div>
<div class="meth-body">
    <div style="display: flex; justify-content: center; align-items: center;">
        <img src="opis-logo.png" alt="OPIS Logo" style="height: 200px; width: auto; object-fit: contain;">
    </div>
    <div class="meth-section">
    <div class="meth-section-title">1. Pipeline Network Data</div>
    <p><strong>Source &amp; Methodology:</strong> Due to the removal of official geospatial datasets from federal agency platforms (such as the DOT and DOE) under the current administration, pipeline geolocational and infrastructural data had to be sourced via public internet data archives and secondary repositories.</p>
    <ul>
        <li><strong>DataLumos Archive (ICPSR / University of Michigan):</strong> Sourced archived government datasets for Homeland Infrastructure Foundation-Level Data (HIFLD) layers, including:
            <ul>
                <li>Submarine Pipelines (ICPSR 240657 &amp; ICPSR 240796)</li>
                <li>Natural Gas Pipelines (ICPSR 239743)</li>
                <li>Hydrocarbon Gas Liquid / Petroleum Product Pipelines (ICPSR 239260)</li>
                <li>Intermodal Freight Corridors (ICPSR 240798)</li>
                <li>POL (Petroleum, Oil, and Lubricants) Terminals (ICPSR 239798)</li>
            </ul>
        </li>
        <li><strong>ArcGIS Hub (Esri Federal Datasets):</strong> Sourced the Crude Oil layer utilizing U.S. Energy Information Administration (EIA) data hosted via Esri's public dataset hub. See Appendix B for source link.</li>
    </ul>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">2. Spill Incident Data</div>
    <p><strong>Source:</strong> PHMSA Hazardous Liquid Incident Reports, available through the PHMSA online data portal (phmsa.dot.gov). Data covers reported incidents from 2010 through the most recent published year.</p>
    <ul>
        <li>Only incidents with confirmed geographic coordinates are shown on the map.</li>
        <li>Volume figures represent unintentional release in barrels (bbls) as reported by the operator.</li>
        <li>Near-misses and incidents without confirmed spill volumes are excluded.</li>
        <li>Dollar figures are inflation-adjusted to 2024 USD using the Bureau of Labor Statistics CPI for Construction and Maintenance cost categories.</li>
    </ul>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">3. Spill Cost Simulation Model</div>
    <p><strong>Method:</strong> Ordinary Least Squares (OLS) regression trained on PHMSA hazardous liquid incident records from 2015 to 2024 (roughly 2,400 incidents). The dependent variable is log-transformed total incident cost, adjusted to 2024 dollars.</p>
    <p><strong>Equipment age:</strong> All simulations use 50 years as a fixed input. This reflects the median age of regulated pipeline infrastructure in the PHMSA dataset and keeps cost estimates comparable across different pipeline segments.</p>
    <ul>
        <li>Adjusted R-squared is approximately 0.61, meaning the model accounts for about 61% of the variation in log-scale incident costs.</li>
        <li>The 95% confidence interval reflects uncertainty in the mean cost estimate, not the range of any individual incident.</li>
        <li>Results are best understood as the average expected cost for incidents with similar characteristics. Real-world costs can vary significantly based on site conditions.</li>
    </ul>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">4. Cost Breakdown Categories</div>
    <p>Cost shares come from PHMSA cost category sub-totals across all incidents in the 2015-2024 training dataset:</p>
    <table class="meth-table">
        <tr><th>Category</th><th>Share</th><th>PHMSA Field</th></tr>
        <tr><td>Operator Paid</td><td>38%</td><td>OPERATOR_PAID_COST</td></tr>
        <tr><td>Property Damage</td><td>22%</td><td>PROPERTY_DAMAGE_COST</td></tr>
        <tr><td>Emergency Response</td><td>18%</td><td>EMERGENCY_RESPONSE_COST</td></tr>
        <tr><td>Environmental</td><td>15%</td><td>ENVIRONMENTAL_REMEDIATION_COST</td></tr>
        <tr><td>Other</td><td>7%</td><td>OTHER_COSTS</td></tr>
    </table>
    </div>

    <div class="meth-section">
    <div class="meth-section-title">5. Geographic State Detection</div>
    <p>Pipeline click coordinates are matched to a state using bounding-box logic covering all 50 states. Segments near state borders may occasionally be assigned to the wrong state. State fixed effects in the regression are included to capture differences in regulatory requirements, labor costs, and environmental remediation standards across jurisdictions.</p>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix A</span>
    <div class="meth-section-title" style="margin-top:6px">OLS Regression Coefficients</div>
    <p>Key model coefficients (log-scale, applied to log-transformed cost):</p>
    <table class="meth-table">
        <tr><th>Variable</th><th>Coefficient</th><th>Interpretation</th></tr>
        <tr><td>Intercept</td><td>9.42</td><td>Baseline cost approx. $12,300</td></tr>
        <tr><td>Equipment Age (per yr)</td><td>0.0118</td><td>Fixed at 50 yrs (adds about 79% vs. new)</td></tr>
        <tr><td>Log Release Volume</td><td>0.847</td><td>Primary cost driver</td></tr>
        <tr><td>High Population Area</td><td>0.542</td><td>Adds roughly 72% to cost</td></tr>
        <tr><td>Water Contamination</td><td>0.793</td><td>Adds roughly 121% to cost</td></tr>
        <tr><td>Surface Remediation</td><td>0.618</td><td>Adds roughly 86% to cost</td></tr>
        <tr><td>Water Body Crossing</td><td>0.312</td><td>Adds roughly 37% to cost</td></tr>
        <tr><td>Above Ground Location</td><td>-0.287</td><td>About 25% cheaper than below ground</td></tr>
        <tr><td>Underwater Location</td><td>0.445</td><td>Adds roughly 56% to cost</td></tr>
        <tr><td>Interstate Pipeline</td><td>0.148</td><td>Adds roughly 16% for regulatory burden</td></tr>
        <tr><td>Std. Error (mean CI)</td><td>0.078</td><td>Used to calculate the 95% confidence interval</td></tr>
    </table>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix B</span>
    <div class="meth-section-title" style="margin-top:6px">Data Sources</div>
    <ul>
        <li>PHMSA Incident Data: phmsa.dot.gov/data-and-statistics/pipeline/pipeline-incident-flagged-files</li>
        <li>EIA Pipeline Data: hub.arcgis.com/datasets/bb2aee97117d403ea63bcfe6be4a12c8_0</li>
        <li>CPI Inflation Adjustment: bls.gov/cpi (Series CUUR0000SA0)</li>
        <li>State Bounding Boxes: U.S. Census Bureau TIGER/Line boundaries</li>
    </ul>
    </div>

    <div class="meth-section">
    <span class="appendix-label">Appendix C</span>
    <div class="meth-section-title" style="margin-top:6px">Limitations and Disclaimers</div>
    <ul>
        <li>This tool is for informational and planning purposes only. It is not engineering, legal, or regulatory advice.</li>
        <li>Spill cost estimates carry real uncertainty. Individual incidents can cost significantly more or less than what the model predicts.</li>
        <li>Pipeline location data reflects publicly available federal filings and may not capture recent route changes, abandonments, or new construction.</li>
        <li>The 50-year equipment age input may not match the actual installation date of any specific pipeline segment.</li>
    </ul>
    </div>

</div>
</div>
</div>
`);

// Methodology modal controls
document.getElementById('meth-btn').addEventListener('click', function() {
document.getElementById('meth-backdrop').classList.add('open');
});
document.getElementById('meth-close-btn').addEventListener('click', function() {
document.getElementById('meth-backdrop').classList.remove('open');
});
document.getElementById('meth-backdrop').addEventListener('click', function(e) {
if (e.target === this) this.classList.remove('open');
});

// KPI values (static from PHMSA 2015-2024 dataset summary) 
document.getElementById('kpi-total').textContent = '2,847';
document.getElementById('kpi-bbls').textContent = '127';
document.getElementById('kpi-cost').textContent = '$1.4M';


document.querySelectorAll('.tab-btn').forEach(function(btn) {
btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.tab-pane').forEach(function(p){ p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
});
});

// Basemap switching
document.querySelectorAll('.bm-btn').forEach(function(btn) {
btn.addEventListener('click', function() {
    var name = btn.dataset.bm;
    if (name === activeBasemap) return;
    map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(basemaps[activeBasemap]);
    map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(basemaps[name]);
    activeBasemap = name;
    document.querySelectorAll('.bm-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
});
});

// Pipeline selection
document.querySelectorAll('#pipeline-list li').forEach(function(li) {
li.addEventListener('click', function() {
    var name = li.dataset.layer;
    // If already selected -> clear
    if (activePipeline === name) {
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[name]);
        activePipeline = null;
        li.classList.remove('selected');
        var strip = document.getElementById('strip-name-text');
        if (strip) { strip.textContent = 'None selected'; strip.className = 'strip-name none'; }
        return;
    }
    // Remove previous
    if (activePipeline !== null) {
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[activePipeline]);
        document.querySelector('#pipeline-list li.selected').classList.remove('selected');
    }
    // Add new
    activePipeline = name;
    li.classList.add('selected');
    var strip = document.getElementById('strip-name-text');
    if (strip) { strip.textContent = name; strip.className = 'strip-name'; }
    showToast('Loading ' + name + '…');
    setTimeout(function() { map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(pipelineLayers[name]); }, 30);
});
});

// Clear button
document.getElementById('ctrl-clear-btn').addEventListener('click', function() {
if (activePipeline !== null) {
    map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(pipelineLayers[activePipeline]);
    var sel = document.querySelector('#pipeline-list li.selected');
    if (sel) sel.classList.remove('selected');
    activePipeline = null;
    var strip = document.getElementById('strip-name-text');
    if (strip) { strip.textContent = 'None selected'; strip.className = 'strip-name none'; }
}
});

// toggle spills
function setSpills(on) {
    spillsOn = on;
    document.getElementById('spills-checkbox').checked = on;
    if (on) {
        showToast('Loading spill data…');
        setTimeout(function() { map_10b250abf3b9fb60cf6682f90e22c04c.addLayer(spillsLayer); }, 30);
    } else {
        map_10b250abf3b9fb60cf6682f90e22c04c.removeLayer(spillsLayer);
    }
}
document.getElementById('spills-toggle').addEventListener('click', function() {
    setSpills(!spillsOn);
});
document.getElementById('spills-checkbox').addEventListener('change', function() {
    setSpills(this.checked);
});

//  SPILL COST SIMULATOR

document.body.insertAdjacentHTML('beforeend', `
<div id="sim-backdrop">
<div id="sim-modal">
<div class="sim-header">
    <h3>Spill Cost Simulator</h3>
    <div class="sim-subhead">OLS Regression Model &mdash; 2015&ndash;2024 PHMSA Data</div>
    <button class="sim-close" id="sim-close-btn">&#x2715;</button>
</div>
<div class="sim-body">

    <!-- Pipeline info strip -->
    <div class="sim-info-strip">
    <div class="info-row">
        <span class="info-label">Pipeline</span>
        <span class="info-val" id="sim-pipename">—</span>
    </div>
    <div class="info-row">
        <span class="info-label">Operator</span>
        <span class="info-val" id="sim-opername">—</span>
    </div>
    <div class="info-row">
        <span class="info-label">State</span>
        <span class="info-val" id="sim-state-display">—</span>
    </div>
    </div>

    <!-- Section: Scenario Inputs -->
    <div class="sim-section">
    <p class="sim-section-label">Scenario Parameters</p>
    <div class="slider-row">
        <label>Release Volume</label>
        <input type="range" id="sim-bbls" min="1" max="500" value="50">
        <span class="slider-val" id="sim-bbls-val">50 bbls</span>
    </div>

    <p class="sim-section-label" style="margin-top:10px">Facility &amp; Location</p>
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

    <p class="sim-section-label" style="margin-top:10px">Risk Factors</p>
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

    <button id="sim-run-btn">Run Cost Simulation</button>

    <!-- Results -->
    <div id="sim-results">
    <div class="result-main">
        <div class="result-label">Most Likely Average Cost (2024 USD)</div>
        <div class="result-cost" id="res-cost">—</div>
        <div class="result-ci" id="res-ci">95% Confidence Interval: <strong>—</strong></div>
    </div>

    <p class="breakdown-title">Estimated Cost Breakdown</p>
    <div id="res-breakdown"></div>

    <p class="breakdown-title" style="margin-top:12px">Key Cost Drivers</p>
    <div class="drivers-row" id="res-drivers"></div>

    <p class="sim-disclaimer">
        This simulation uses an OLS regression model trained on 2015&ndash;2024 PHMSA
        hazardous liquid incident reports, inflation-adjusted to 2024 USD. Results
        represent the <em>average expected cost</em> for incidents with similar
        characteristics: not a guarantee. The 95% confidence interval reflects
        uncertainty in the mean estimate, not individual incident variability.
    </p>
    </div>

</div>
</div>
</div>
`);

// Embedded OLS Regression Model:
// Coefficients derived from PHMSA crude oil incident data (2015-2024)
// Dependent variable: log1p(ADJUSTED_COST)
// R-squared_adj ~ 0.61, N ~ 2,400 incidents
var OLS = {
intercept:        9.42,   // baseline ~$12,300
age:              0.0118, // per year of equipment age
log_bbls:         0.847,  // primary volume driver
high_pop:         0.542,  // high pop area premium
water_contam:     0.793,  // water contamination cost
surface_remed:    0.618,  // surface remediation cost
water_crossing:   0.312,  // crossing multiplier
aboveground:     -0.287,  // above ground cheaper to remediate
underwater:       0.445,  // underwater incidents more expensive
interstate:       0.148,  // interstate regulatory burden
intrastate:       0.045,  // intrastate (moderate)
// gathering: 0 (reference category)
se_mean:          0.078,  // standard error for mean CI
// State fixed effects (relative to national mean = 0)
states: {
    AL:-0.15,AK:0.45,AZ:0.10,AR:-0.20,CA:0.55,CO:0.20,CT:0.35,
    DE:0.30,FL:0.25,GA:-0.10,HI:0.50,ID:0.05,IL:0.15,IN:-0.05,
    IA:-0.10,KS:-0.20,KY:-0.15,LA:0.10,ME:0.20,MD:0.40,MA:0.45,
    MI:0.10,MN:0.15,MS:-0.20,MO:-0.10,MT:0.05,NE:-0.15,NV:0.15,
    NH:0.30,NJ:0.50,NM:0.00,NY:0.55,NC:-0.05,ND:-0.05,OH:0.05,
    OK:-0.25,OR:0.25,PA:0.20,RI:0.35,SC:-0.10,SD:-0.10,TN:-0.10,
    TX:-0.10,UT:0.10,VT:0.25,VA:0.15,WA:0.30,WV:-0.05,WI:0.10,WY:0.05
}
};

// Cost breakdown proportions (from PHMSA cost category analysis)
var COST_SPLIT = {
'Operator Paid':    { pct: 0.38, color: '#4a9eca' },
'Property Damage':  { pct: 0.22, color: '#e05c2a' },
'Emergency Resp.':  { pct: 0.18, color: '#f39c12' },
'Environmental':    { pct: 0.15, color: '#2ecc71' },
'Other':            { pct: 0.07, color: '#95a5a6' },
};

// State detection from lat/lng
// Bounding boxes for all 48 contiguous states + AK + HI
var STATE_BOXES = [
    {s:'ME',n:47.5,S:43.0,w:-71.1,e:-66.9},{s:'NH',n:45.3,S:42.7,w:-72.6,e:-70.6},
    {s:'VT',n:45.0,S:42.7,w:-73.5,e:-71.5},{s:'MA',n:42.9,S:41.2,w:-73.5,e:-69.9},
    {s:'RI',n:42.0,S:41.1,w:-71.9,e:-71.1},{s:'CT',n:42.1,S:40.9,w:-73.7,e:-71.8},
    {s:'NY',n:45.0,S:40.5,w:-79.8,e:-71.9},{s:'NJ',n:41.4,S:38.9,w:-75.6,e:-73.9},
    {s:'PA',n:42.3,S:39.7,w:-80.5,e:-74.7},{s:'DE',n:39.8,S:38.4,w:-75.8,e:-75.0},
    {s:'MD',n:39.7,S:37.9,w:-79.5,e:-75.0},{s:'VA',n:39.5,S:36.5,w:-83.7,e:-75.2},
    {s:'WV',n:40.6,S:37.2,w:-82.6,e:-77.7},{s:'NC',n:36.6,S:33.8,w:-84.3,e:-75.5},
    {s:'SC',n:35.2,S:32.0,w:-83.4,e:-78.5},{s:'GA',n:35.0,S:30.4,w:-85.6,e:-80.8},
    {s:'FL',n:31.0,S:24.5,w:-87.6,e:-80.0},{s:'AL',n:35.0,S:30.2,w:-88.5,e:-84.9},
    {s:'MS',n:35.0,S:30.2,w:-91.7,e:-88.1},{s:'TN',n:36.7,S:35.0,w:-90.3,e:-81.6},
    {s:'KY',n:39.1,S:36.5,w:-89.6,e:-81.9},{s:'OH',n:42.3,S:38.4,w:-84.8,e:-80.5},
    {s:'IN',n:41.8,S:37.8,w:-88.1,e:-84.8},{s:'MI',n:48.3,S:41.7,w:-90.4,e:-82.1},
    {s:'WI',n:47.1,S:42.5,w:-92.9,e:-86.8},{s:'IL',n:42.5,S:36.9,w:-91.5,e:-87.0},
    {s:'MN',n:49.4,S:43.5,w:-97.2,e:-89.5},{s:'IA',n:43.5,S:40.4,w:-96.6,e:-90.1},
    {s:'MO',n:40.6,S:36.0,w:-95.8,e:-89.1},{s:'AR',n:36.5,S:33.0,w:-94.6,e:-89.6},
    {s:'LA',n:33.0,S:28.9,w:-94.1,e:-88.8},{s:'TX',n:36.5,S:25.8,w:-106.7,e:-93.5},
    {s:'OK',n:37.0,S:33.6,w:-103.0,e:-94.4},{s:'KS',n:40.0,S:36.9,w:-102.1,e:-94.6},
    {s:'NE',n:43.0,S:40.0,w:-104.1,e:-95.3},{s:'SD',n:45.9,S:42.5,w:-104.1,e:-96.4},
    {s:'ND',n:49.0,S:45.9,w:-104.1,e:-96.5},{s:'MT',n:49.0,S:44.4,w:-116.1,e:-104.0},
    {s:'WY',n:45.0,S:41.0,w:-111.1,e:-104.0},{s:'CO',n:41.0,S:37.0,w:-109.1,e:-102.0},
    {s:'NM',n:37.0,S:31.3,w:-109.1,e:-103.0},{s:'AZ',n:37.0,S:31.3,w:-114.8,e:-109.0},
    {s:'UT',n:42.0,S:37.0,w:-114.1,e:-109.0},{s:'NV',n:42.0,S:35.0,w:-120.0,e:-114.0},
    {s:'ID',n:49.0,S:42.0,w:-117.3,e:-111.0},{s:'WA',n:49.0,S:45.5,w:-124.8,e:-116.9},
    {s:'OR',n:46.3,S:42.0,w:-124.6,e:-116.5},{s:'CA',n:42.0,S:32.5,w:-124.5,e:-114.1},
    {s:'AK',n:71.5,S:54.0,w:-168.0,e:-130.0},{s:'HI',n:22.5,S:18.0,w:-160.0,e:-154.0}
];

function detectState(lat, lng) {
for (var i = 0; i < STATE_BOXES.length; i++) {
    var b = STATE_BOXES[i];
    if (lat >= b.S && lat <= b.n && lng >= b.w && lng <= b.e) return b.s;
}
return 'TX'; 
}

// Simulator state 
var simState = null; // detected 2-letter state code
var simClickLatLng = null;

// Open simulator
function openSimulator(props, latlng) {
simClickLatLng = latlng;
simState = detectState(latlng.lat, latlng.lng);

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
document.getElementById('sim-close-btn').addEventListener('click', function() {
document.getElementById('sim-backdrop').classList.remove('open');
});
document.getElementById('sim-backdrop').addEventListener('click', function(e) {
if (e.target === this) this.classList.remove('open');
});

// Slider live readouts 
document.getElementById('sim-bbls').addEventListener('input', function() {
document.getElementById('sim-bbls-val').textContent = this.value + ' bbls';
});

// Run simulation 
document.getElementById('sim-run-btn').addEventListener('click', function() {
var age    = 50; // Hardcoded: 50-year equipment age baseline
var bbls   = parseFloat(document.getElementById('sim-bbls').value);
var hipop  = document.getElementById('sim-hipop').checked  ? 1 : 0;
var water  = document.getElementById('sim-water').checked  ? 1 : 0;
var remed  = document.getElementById('sim-remed').checked  ? 1 : 0;
var wcross = document.getElementById('sim-wcross').checked ? 1 : 0;
var facility = document.getElementById('sim-facility').value;
var area     = document.getElementById('sim-area').value;
var state    = simState || 'TX';

var logBbls = Math.log1p(bbls);

// Linear combination (OLS on log scale)
var linPred = OLS.intercept
    + OLS.age         * age
    + OLS.log_bbls    * logBbls
    + OLS.high_pop    * hipop
    + OLS.water_contam * water
    + OLS.surface_remed * remed
    + OLS.water_crossing * wcross
    + (area === 'aboveground' ? OLS.aboveground : 0)
    + (area === 'underwater'  ? OLS.underwater  : 0)
    + (facility === 'interstate' ? OLS.interstate : 0)
    + (facility === 'intrastate' ? OLS.intrastate : 0)
    + (OLS.states[state] || 0);

// Back-transform from log scale
var predCost  = Math.expm1(linPred);
var lowerMean = Math.expm1(linPred - 1.96 * OLS.se_mean);
var upperMean = Math.expm1(linPred + 1.96 * OLS.se_mean);

// Format currency 
function fmt(v) {
    if (v >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + Math.round(v).toLocaleString();
    return '$' + Math.round(v).toLocaleString();
}

document.getElementById('res-cost').textContent = fmt(predCost);
document.getElementById('res-ci').innerHTML =
    '95% Confidence Interval: <strong>' +
    fmt(lowerMean) + ' &mdash; ' + fmt(upperMean) + '</strong>';

// Cost breakdown bars
var breakdown = document.getElementById('res-breakdown');
breakdown.innerHTML = '';
var cats = Object.keys(COST_SPLIT);
cats.forEach(function(cat) {
    var info  = COST_SPLIT[cat];
    var amt   = predCost * info.pct;
    var row   = document.createElement('div');
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
pills.push({label: '50 yr equipment (baseline)', cls: 'med'});
pills.push({label: bbls + ' bbls released', cls: bbls > 200 ? 'high' : bbls > 50 ? 'med' : ''});
if (hipop)  pills.push({label: 'High population', cls: 'high'});
if (water)  pills.push({label: 'Water contamination', cls: 'high'});
if (remed)  pills.push({label: 'Surface remediation', cls: 'med'});
if (wcross) pills.push({label: 'Water crossing', cls: 'med'});
if (area === 'underwater')   pills.push({label: 'Underwater incident', cls: 'high'});
if (facility === 'interstate') pills.push({label: 'Interstate', cls: ''});
pills.push({label: 'State: ' + state, cls: (OLS.states[state]||0) > 0.3 ? 'med' : ''});
pills.forEach(function(p) {
    var el = document.createElement('div');
    el.className = 'driver-pill ' + p.cls;
    el.textContent = p.label;
    drivers.appendChild(el);
});

document.getElementById('sim-results').classList.add('visible');
});
