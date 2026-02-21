/* Concrete Strength Properties (EN 1992-1-1 based)
   v5 Fix:
   - Restores the full detailed step-by-step calculations (as in earlier revisions)
   - Keeps v4 changes:
     1) Stress–strain plot x-axis strain values rounded to 2 decimals.
     2) Summary does NOT include the Inputs section.
     3) Tensile strength MPa values are rounded UP to 1 decimal; compressive MPa to 0 decimals.
*/

const TABLE_31 = {
  "C12/15": { fck: 12, fckCube: 15, fcm: 20, fctm: 1.6, fctk005: 1.1, fctk095: 2.0, Ecm: 27, ec1: 1.8, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C16/20": { fck: 16, fckCube: 20, fcm: 24, fctm: 1.9, fctk005: 1.3, fctk095: 2.5, Ecm: 29, ec1: 1.9, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C20/25": { fck: 20, fckCube: 25, fcm: 28, fctm: 2.2, fctk005: 1.5, fctk095: 2.9, Ecm: 30, ec1: 2.0, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C25/30": { fck: 25, fckCube: 30, fcm: 33, fctm: 2.6, fctk005: 1.8, fctk095: 3.3, Ecm: 31, ec1: 2.1, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C30/37": { fck: 30, fckCube: 37, fcm: 38, fctm: 2.9, fctk005: 2.0, fctk095: 3.8, Ecm: 33, ec1: 2.2, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C35/45": { fck: 35, fckCube: 45, fcm: 43, fctm: 3.2, fctk005: 2.2, fctk095: 4.2, Ecm: 34, ec1: 2.25, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C40/50": { fck: 40, fckCube: 50, fcm: 48, fctm: 3.5, fctk005: 2.5, fctk095: 4.6, Ecm: 35, ec1: 2.3, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C45/55": { fck: 45, fckCube: 55, fcm: 53, fctm: 3.8, fctk005: 2.7, fctk095: 4.9, Ecm: 36, ec1: 2.4, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C50/60": { fck: 50, fckCube: 60, fcm: 58, fctm: 4.1, fctk005: 2.9, fctk095: 5.3, Ecm: 37, ec1: 2.45, ecu1: 3.5, ec2: 2.0, ecu2: 3.5, n: 2.0, ec3: 1.75, ecu3: 3.5 },
  "C55/67": { fck: 55, fckCube: 67, fcm: 63, fctm: 4.2, fctk005: 3.0, fctk095: 5.5, Ecm: 38, ec1: 2.5, ecu1: 3.2, ec2: 2.2, ecu2: 3.1, n: 1.75, ec3: 1.8, ecu3: 3.1 },
  "C60/75": { fck: 60, fckCube: 75, fcm: 68, fctm: 4.4, fctk005: 3.1, fctk095: 5.7, Ecm: 39, ec1: 2.6, ecu1: 3.0, ec2: 2.3, ecu2: 2.9, n: 1.6, ec3: 1.9, ecu3: 2.9 },
  "C70/85": { fck: 70, fckCube: 85, fcm: 78, fctm: 4.6, fctk005: 3.2, fctk095: 6.0, Ecm: 41, ec1: 2.7, ecu1: 2.8, ec2: 2.4, ecu2: 2.7, n: 1.45, ec3: 2.0, ecu3: 2.7 },
  "C80/95": { fck: 80, fckCube: 95, fcm: 88, fctm: 4.8, fctk005: 3.4, fctk095: 6.3, Ecm: 42, ec1: 2.8, ecu1: 2.8, ec2: 2.5, ecu2: 2.6, n: 1.4, ec3: 2.2, ecu3: 2.6 },
  "C90/105": { fck: 90, fckCube: 105, fcm: 98, fctm: 5.0, fctk005: 3.5, fctk095: 6.6, Ecm: 44, ec1: 2.8, ecu1: 2.8, ec2: 2.6, ecu2: 2.6, n: 1.4, ec3: 2.3, ecu3: 2.6 }
};

const CEMENT_S = { R: 0.20, N: 0.25, S: 0.38 };
const AGG_FACTOR = { Quartzite: 1.0, Limestone: 0.90, Sandstone: 0.70, Basalt: 1.20};

let chart = null;
let lastResult = null;

const $ = (id) => document.getElementById(id);

function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
}

function fmtInt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return String(Math.round(Number(value)));
}

function ceilTo(value, decimals) {
  if (value === null || value === undefined || Number.isNaN(value)) return NaN;
  const p = Math.pow(10, decimals);
  return Math.ceil((Number(value) * p) - 1e-12) / p;
}

// Compressive-type MPa: round UP to 0 decimals
function fmtMPaUp0(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return String(Math.ceil(Number(value) - 1e-12));
}

// Tensile-type MPa: round UP to 1 decimal
function fmtMPaUp1(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return ceilTo(value, 1).toFixed(1);
}


// GPa values: round to 0 decimals (nearest)
function fmtGPa0(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return String(Math.round(Number(value)));
}

// βcc(t): show 3 decimals
function fmtBeta2(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(3);
}

// Strain (‰): show 2 decimals
function fmtStrain2(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(2);
}

function initTheme() {
  const saved = localStorage.getItem("csp_theme");
  const isDark = saved ? saved === "dark" : false;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  $("themeToggle").checked = isDark;

  $("themeToggle").addEventListener("change", (e) => {
    const dark = e.target.checked;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("csp_theme", dark ? "dark" : "light");
  });
}

function initPrint() {
  $("btnPrint").addEventListener("click", () => window.print());
}

function initGrades() {
  const gradeSel = $("grade");
  Object.keys(TABLE_31).forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    gradeSel.appendChild(opt);
  });
  gradeSel.value = "C30/37";
}

function initConfinement() {
  const conf = $("confinement");
  const wrap = $("sigma2Wrap");
  conf.addEventListener("change", () => {
    wrap.classList.toggle("field--hidden", conf.value !== "confined");
  });
}

// ------------------------------
// Core calculations
// ------------------------------
function betaCC(t, s) {
  // Define βcc(0)=0 for plotting from day 0
  if (t <= 0) return 0;
  const tt = Math.max(1e-6, t);
  return Math.exp(s * (1 - Math.sqrt(28 / tt)));
}

function meanCompressiveStrength(fck) {
  // fcm = fck + 8
  return fck + 8;
}

function fctm28(fck, fcm) {
  // For fck <= 50: 0.3 fck^(2/3)
  // For fck > 50: 2.12 ln(1 + fcm/10)
  if (fck <= 50) return 0.3 * Math.pow(fck, 2 / 3);
  return 2.12 * Math.log(1 + (fcm / 10));
}

function calcAll(inputs) {
  const base = TABLE_31[inputs.grade];
  const fck_base = base.fck;

  // Confined adjustment
  let fck_used = fck_base;
  let fck_confined = null;

  if (inputs.confinement === "confined") {
    const sigma2 = Math.max(0, inputs.sigma2);
    if (sigma2 <= 0.05 * fck_base) {
      fck_confined = fck_base * (1.0 + 5.0 * (sigma2 / fck_base));
    } else {
      fck_confined = fck_base * (1.125 + 2.5 * (sigma2 / fck_base));
    }
    fck_used = fck_confined;
  }

  const fcm_used = meanCompressiveStrength(fck_used);

  const s = CEMENT_S[inputs.cem];
  const bcc = betaCC(inputs.t, s);

  const fcm_t = bcc * fcm_used;
  const fcd = (inputs.alphaCC * fck_used) / inputs.gammaC;

  const fctm_calc = fctm28(fck_used, fcm_used);
  const fctk005_calc = 0.7 * fctm_calc;
  const fctk095_calc = 1.3 * fctm_calc;

  const alphaAge = (inputs.t <= 28) ? 1.0 : (2 / 3);
  const fctm_t = Math.pow(bcc, alphaAge) * fctm_calc;

  const fctd = (inputs.alphaCT * fctk005_calc) / inputs.gammaC;

  const Ecm_quartz_calc = 22 * Math.pow((fcm_used / 10), 0.3);
  const Ecm_calc = Ecm_quartz_calc * AGG_FACTOR[inputs.agg];
  const Ecm_t = Math.pow(bcc, 0.3) * Ecm_calc;

  const nu = 0.2;

  // Strains used for models (‰) - confined modification for εc2 and εcu2
  let ec2_used = base.ec2, ecu2_used = base.ecu2;
  if (inputs.confinement === "confined") {
    const sigma2 = Math.max(0, inputs.sigma2);
    ec2_used = base.ec2 * Math.pow((fck_used / fck_base), 2);
    ecu2_used = base.ecu2 + 0.2 * (sigma2 / fck_base);
  }

  return {
    inputs,
    base,
    s,
    bcc,
    fck_base,
    fck_used,
    fck_confined,
    fcm_used,
    fcm_t,
    fcd,
    fctm_calc,
    fctk005_calc,
    fctk095_calc,
    fctm_t,
    fctd,
    Ecm_calc,
    Ecm_t,
    Ecm_quartz_calc,
    nu,
    alphaAge,
    ec2_used,
    ecu2_used
  };
}

// ------------------------------
// Summary rendering (single line per parameter)
// (Inputs section intentionally removed)
// ------------------------------
function section(title) {
  const div = document.createElement('div');
  div.className = 'summarySection';
  div.textContent = title;
  return div;
}

function row(label, valueText) {
  const div = document.createElement('div');
  div.className = 'summaryRow';
  div.innerHTML = `<span class="summaryLabel">${label} :</span><span class="summaryValue">${valueText}</span>`;
  return div;
}

function renderSummary(res) {
  const grid = $("summaryGrid");
  grid.innerHTML = "";
  const b = res.base;

  grid.appendChild(section('Table 3.1 (selected grade)'));
  grid.appendChild(row('Strength Class', `${res.inputs.grade}`));
  grid.appendChild(row('Characteristic cylinder strength (fck)', `${fmtMPaUp0(b.fck)} MPa`));
  grid.appendChild(row('Characteristic cube strength (fck,cube)', `${fmtMPaUp0(b.fckCube)} MPa`));
  grid.appendChild(row('Mean cylinder strength (fcm)', `${fmtMPaUp0(b.fcm)} MPa`));
  grid.appendChild(row('Mean tensile strength (fctm)', `${fmtMPaUp1(b.fctm)} MPa`));
  grid.appendChild(row('5% fractile tensile (fctk,0.05)', `${fmtMPaUp1(b.fctk005)} MPa`));
  grid.appendChild(row('95% fractile tensile (fctk,0.95)', `${fmtMPaUp1(b.fctk095)} MPa`));
  grid.appendChild(row('Secant modulus (Ecm)', `${fmtGPa0(b.Ecm)} GPa`));
  grid.appendChild(row('Peak strain (εc1)', `${fmtStrain2(b.ec1)} ‰`));
  grid.appendChild(row('Ultimate strain (εcu1)', `${fmtStrain2(b.ecu1)} ‰`));
  grid.appendChild(row('Peak strain (εc2)', `${fmtStrain2(b.ec2)} ‰`));
  grid.appendChild(row('Ultimate strain (εcu2)', `${fmtStrain2(b.ecu2)} ‰`));
  grid.appendChild(row('Exponent (n)', `${fmt(b.n, 2)}`));
  grid.appendChild(row('Peak strain (εc3)', `${fmtStrain2(b.ec3)} ‰`));
  grid.appendChild(row('Ultimate strain (εcu3)', `${fmtStrain2(b.ecu3)} ‰`));

  grid.appendChild(section('Estimated / derived (including age-dependent at t)'));
  grid.appendChild(row('Characteristic strength used (fck,used)', `${fmtMPaUp0(res.fck_used)} MPa`));
  grid.appendChild(row('Mean compressive strength used (fcm,used)', `${fmtMPaUp0(res.fcm_used)} MPa`));
  grid.appendChild(row('Age factor (βcc(t))', `${fmtBeta2(res.bcc)}`));
  grid.appendChild(row('Age-dependent mean compressive strength (fcm(t))', `${fmtMPaUp0(res.fcm_t)} MPa`));
  grid.appendChild(row('Design compressive strength (fcd)', `${fmtMPaUp0(res.fcd)} MPa`));

  grid.appendChild(row('Computed mean tensile at 28d (fctm)', `${fmtMPaUp1(res.fctm_calc)} MPa`));
  grid.appendChild(row('Computed 5% fractile tensile (fctk,0.05)', `${fmtMPaUp1(res.fctk005_calc)} MPa`));
  grid.appendChild(row('Computed 95% fractile tensile (fctk,0.95)', `${fmtMPaUp1(res.fctk095_calc)} MPa`));
  grid.appendChild(row('Age-dependent mean tensile strength (fctm(t))', `${fmtMPaUp1(res.fctm_t)} MPa`));
  grid.appendChild(row('Design tensile strength (fctd)', `${fmtMPaUp1(res.fctd)} MPa`));

  grid.appendChild(row('Aggregate-adjusted modulus at 28d (Ecm,calc)', `${fmtGPa0(res.Ecm_calc)} GPa`));
  grid.appendChild(row('Age-dependent modulus (Ecm(t))', `${fmtGPa0(res.Ecm_t)} GPa`));

  grid.appendChild(row('εc2 used (confined if applicable)', `${fmtStrain2(res.ec2_used)} ‰`));
  grid.appendChild(row('εcu2 used (confined if applicable)', `${fmtStrain2(res.ecu2_used)} ‰`));
  grid.appendChild(row('Poisson’s ratio (ν)', `${fmt(res.nu, 2)}`));
}

// ------------------------------
// Detailed calculations (FULL step-by-step restored)
// ------------------------------
function dLine(desc, math) {
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = `<div class="desc">${desc}</div><div class="math">${math}</div>`;
  return div;
}

function dBlock(title, lines) {
  const div = document.createElement("div");
  div.className = "block";
  const inner = document.createElement("div");
  inner.className = "lines";
  lines.forEach(l => inner.appendChild(l));
  div.innerHTML = `<h3>${title}</h3>`;
  div.appendChild(inner);
  return div;
}

function renderDetails(res) {
  const root = $("details");
  root.innerHTML = "";

  const inp = res.inputs;
  const b = res.base;

  // 1) Inputs
  root.appendChild(dBlock("1) Inputs",
    [
      dLine("Selected grade (Table 3.1)", `\\( ${inp.grade} \\)`),
      dLine("Cement class (s)", `\\( \\text{CEM }${inp.cem},\\; s=${res.s} \\)`),
      dLine("Aggregate type", `\\( ${inp.agg} \\)`),
      dLine("Condition", `\\( ${inp.confinement} \\)`),
      ...(inp.confinement === "confined" ? [dLine("Effective lateral stress", `\\( \\sigma_2 = ${fmt(inp.sigma2,3)}\\,\\text{MPa} \\)`)] : []),
      dLine("Partial factor", `\\( \\gamma_c = ${fmt(inp.gammaC,2)} \\)`),
      dLine("Long-term coefficient (compressive)", `\\( \\alpha_{cc} = ${fmt(inp.alphaCC,2)} \\)`),
      dLine("Long-term coefficient (tensile)", `\\( \\alpha_{ct} = ${fmt(inp.alphaCT,2)} \\)`),
      dLine("Age", `\\( t = ${fmtInt(inp.t)}\\,\\text{days} \\)`),
    ]
  ));

  // 2) Confined concrete (if selected)
  if (inp.confinement === "confined") {
    const sigma2 = Math.max(0, inp.sigma2);
    const threshold = 0.05 * res.fck_base;
    const usingFirst = sigma2 <= threshold;

    root.appendChild(dBlock("2) Confined concrete enhancement",
      [
        dLine("Unconfined characteristic strength", `\\( f_{ck} = ${fmtMPaUp0(res.fck_base)}\\,\\text{MPa} \\)`),
        dLine("Check limit", `\\( 0.05 f_{ck} = 0.05\\times${fmtMPaUp0(res.fck_base)} = ${fmt(threshold,3)}\\,\\text{MPa} \\)`),
        dLine("Selected expression",
          usingFirst
            ? `\\( \\sigma_2 \\le 0.05 f_{ck} \\Rightarrow f_{ck,c}=f_{ck}(1+5\\,\\sigma_2/f_{ck}) \\)`
            : `\\( \\sigma_2 > 0.05 f_{ck} \\Rightarrow f_{ck,c}=f_{ck}(1.125+2.5\\,\\sigma_2/f_{ck}) \\)`
        ),
        dLine("Substitution (numeric)",
          usingFirst
            ? `\\( f_{ck,c}=${fmt(res.fck_base,2)}\\left(1+5\\times\\frac{${fmt(sigma2,3)}}{${fmt(res.fck_base,2)}}\\right)=${fmt(res.fck_used,3)}\\,\\text{MPa} \\)`
            : `\\( f_{ck,c}=${fmt(res.fck_base,2)}\\left(1.125+2.5\\times\\frac{${fmt(sigma2,3)}}{${fmt(res.fck_base,2)}}\\right)=${fmt(res.fck_used,3)}\\,\\text{MPa} \\)`
        ),
        dLine("fck,c used (rounded)", `\\( f_{ck,c}\, \approx \, ${fmtMPaUp0(res.fck_used)}\\,\\text{MPa} \\)`),
        dLine("Strain increase (εc2,c)", `\\( \\varepsilon_{c2,c}=\\varepsilon_{c2}\\left(\\frac{f_{ck,c}}{f_{ck}}\\right)^2 = ${fmt(b.ec2,3)}\\left(\\frac{${fmt(res.fck_used,3)}}{${fmt(res.fck_base,2)}}\\right)^2=${fmt(res.ec2_used,3)}\\,‰\\)`),
        dLine("Strain increase (εcu2,c)", `\\( \\varepsilon_{cu2,c}=\\varepsilon_{cu2}+0.2\\,\\sigma_2/f_{ck} = ${fmt(b.ecu2,3)}+0.2\\times\\frac{${fmt(sigma2,3)}}{${fmt(res.fck_base,2)}}=${fmt(res.ecu2_used,3)}\\,‰\\)`)
      ]
    ));
  }

  // 3) Compressive strength properties
  root.appendChild(dBlock("3) Compressive strength properties",
    [
      dLine("Characteristic compressive strength used", `\\( f_{ck} = ${fmtMPaUp0(res.fck_used)}\\,\\text{MPa} \\)`),
      dLine("Mean compressive strength", `\\( f_{cm}=f_{ck}+8 = ${fmtMPaUp0(res.fck_used)}+8 = ${fmtMPaUp0(res.fcm_used)}\\,\\text{MPa} \\)`),
      dLine("Age factor", `\\( \\beta_{cc}(t)=\\exp\\left[s\\left(1-\\sqrt{\\frac{28}{t}}\\right)\\right]=\\exp\\left[${res.s}\\left(1-\\sqrt{\\frac{28}{${fmtInt(inp.t)}}}\\right)\\right]=${fmtBeta2(res.bcc)} \\)`),
      dLine("Age-dependent mean strength", `\\( f_{cm}(t)=\\beta_{cc}(t)\\,f_{cm}=${fmtBeta2(res.bcc)}\\times${fmt(res.fcm_used,1)}=${fmt(res.fcm_t,1)}\\,\\text{MPa}\\)`),
      dLine("Design compressive strength", `\\( f_{cd}=\\frac{\\alpha_{cc}f_{ck}}{\\gamma_c}=\\frac{${fmt(inp.alphaCC,2)}\\times${fmt(res.fck_used,0)}}{${fmt(inp.gammaC,2)}}=${fmt(res.fcd,0)}\\,\\text{MPa}\\)`)
    ]
  ));

  // 4) Tensile strength properties
  const tensileFormula = (res.fck_used <= 50)
    ? `\\( f_{ctm}=0.3\\,f_{ck}^{2/3} \\)`
    : `\\( f_{ctm}=2.12\\ln\\left(1+\\frac{f_{cm}}{10}\\right) \\)`;

  root.appendChild(dBlock("4) Tensile strength properties",
    [
      dLine("Mean tensile strength at 28 days (formula)", tensileFormula),
      dLine("Computed mean tensile (numeric)", `\\( f_{ctm}=${fmt(res.fctm_calc,2)}\\,\\text{MPa}\\)`),
      dLine("Characteristic tensile 5%", `\\( f_{ctk,0.05}=0.7\\,f_{ctm}=0.7\\times${fmt(res.fctm_calc,2)}=${fmt(res.fctk005_calc,2)}\\,\\text{MPa}\\)`),
      dLine("Characteristic tensile 95%", `\\( f_{ctk,0.95}=1.3\\,f_{ctm}=1.3\\times${fmt(res.fctm_calc,2)}=${fmt(res.fctk095_calc,2)}\\,\\text{MPa}\\)`),
      dLine("Age exponent", `\\( \\alpha=${fmt(res.alphaAge,3)}\\; (1\\;\\text{for }t\\le 28\;2/3 \\; \\text{for }t>28)\\)`),
      dLine("Age-dependent mean tensile", `\\( f_{ctm}(t)=\\beta_{cc}(t)^{\\alpha}\\,f_{ctm}=${fmt(res.fctm_t,2)}\\,\\text{MPa}\\)`),
      dLine("Design tensile strength", `\\( f_{ctd}=\\frac{\\alpha_{ct}f_{ctk,0.05}}{\\gamma_c}=\\frac{${fmt(inp.alphaCT,2)}\\times${fmt(res.fctk005_calc,2)}}{${fmt(inp.gammaC,2)}}=${fmt(res.fctd,2)}\\,\\text{MPa}\\)`)
    ]
  ));

  // 5) Modulus of elasticity
  root.appendChild(dBlock("5) Modulus of Elasticity",
    [
      dLine("Quartzite base modulus", `\\( E_{cm}=22\\left(\\frac{f_{cm}}{10}\\right)^{0.3}=22\\left(\\frac{${fmt(res.fcm_used,3)}}{10}\\right)^{0.3}=${fmtGPa0(res.Ecm_quartz_calc)}\\,\\text{GPa}\\)`),
      dLine("Aggregate adjustment", `\\( E_{cm,adj}=E_{cm}\\times ${fmt(AGG_FACTOR[inp.agg],2)}=${fmtGPa0(res.Ecm_calc)}\\,\\text{GPa}\\)`),
      dLine("Age-dependent modulus", `\\( E_{cm}(t)=\\beta_{cc}(t)^{0.3}\\,E_{cm,adj}=${fmtGPa0(res.Ecm_t)}\\,\\text{GPa}\\)`),
      dLine("Poisson’s ratio (typ.)", `\\( \\nu=0.2\\)`)
    ]
  ));

  // 6) Stress–strain models (definitions)
  root.appendChild(dBlock("6) Stress–Strain models (for plotting)",
    [
      dLine("Parabolic-Rectangular", `\\( \\sigma_c=f_{cd}\\left[1-\\left(1-\\frac{\\varepsilon_c}{\\varepsilon_{c2}}\\right)^n\\right] \\; (0\\le\\varepsilon_c\\le\\varepsilon_{c2}),\\; \\sigma_c=f_{cd}\\; (\\varepsilon_{c2}\\le\\varepsilon_c\\le\\varepsilon_{cu2}) \\)`),
      dLine("Bi-linear", `\\( \\sigma_c \\text{ linear to }(\\varepsilon_{c3},f_{cd})\;\\text{then plateau to }\\varepsilon_{cu3} \\)`),
      dLine("Nonlinear (EN)", `\\( \\frac{\\sigma_c}{f_{cm}}=\\frac{k\\eta-\\eta^2}{1+(k-2)\\eta},\\;\\eta=\\varepsilon_c/\\varepsilon_{c1},\\;k=\\frac{1.05E_{cm}\\varepsilon_{c1}}{f_{cm}} \\)`)
    ]
  ));

  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([root]);
  }
}

// ------------------------------
// Plotting
// ------------------------------
function destroyChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

function genAgeCurve(res, yKey) {
  const tMax = Math.max(56, Math.min(365, Math.round(res.inputs.t * 2)));
  const xs = [];
  const ys = [];
  for (let t = 0; t <= tMax; t++) {
    const bcc = betaCC(t, res.s);
    if (yKey === "fcm_t") {
      xs.push(t);
      ys.push(bcc * res.fcm_used);
    } else if (yKey === "fctm_t") {
      const alpha = (t <= 28) ? 1.0 : (2 / 3);
      xs.push(t);
      ys.push(Math.pow(bcc, alpha) * res.fctm_calc);
    } else if (yKey === "Ecm_t") {
      xs.push(t);
      ys.push(Math.pow(bcc, 0.3) * res.Ecm_calc);
    }
  }
  return { xs, ys };
}

function genStressStrain(res, model) {
  const b = res.base;
  const fcd = res.fcd;
  const fcm = res.fcm_used;

  const ec2 = (res.ec2_used / 1000);
  const ecu2 = (res.ecu2_used / 1000);
  const n = b.n;

  const ec3 = (b.ec3 / 1000);
  const ecu3 = (b.ecu3 / 1000);

  const ec1 = (b.ec1 / 1000);
  const ecu1 = (b.ecu1 / 1000);

  const Ecm_MPa = res.Ecm_calc * 1000;

  const N = 140;
  const xs = [];
  const ys = [];

  function push(eps, sig) {
    xs.push(Number((eps * 1000).toFixed(2))); // ‰ rounded to 2 decimals
    ys.push(sig);
  }

  if (model === "ss_parabola") {
    for (let i = 0; i <= N; i++) {
      const eps = (ecu2 * i) / N;
      let sig = 0;
      if (eps <= ec2) {
        const r = 1 - (eps / ec2);
        sig = fcd * (1 - Math.pow(r, n));
      } else {
        sig = fcd;
      }
      push(eps, sig);
    }
  }

  if (model === "ss_bilinear") {
    for (let i = 0; i <= N; i++) {
      const eps = (ecu3 * i) / N;
      let sig = 0;
      if (eps <= ec3) sig = fcd * (eps / ec3);
      else sig = fcd;
      push(eps, sig);
    }
  }

  if (model === "ss_nonlinear") {
    const k = (1.05 * Ecm_MPa * ec1) / fcm;
    for (let i = 0; i <= N; i++) {
      const eps = (ecu1 * i) / N;
      const eta = eps / ec1;
      const frac = (k * eta - eta * eta) / (1 + (k - 2) * eta);
      const sig = frac * fcm;
      push(eps, sig);
    }
  }

  return { xs, ys };
}

function renderPlot(res) {
  const param = $("plotParam").value;
  const ctx = $("chart");

  destroyChart();

  if (["fcm_t", "fctm_t", "Ecm_t"].includes(param)) {
    const curve = genAgeCurve(res, param);
    const currentT = Math.round(res.inputs.t);

    const title = (param === "fcm_t") ? "Age-dependent mean compressive strength"
      : (param === "fctm_t") ? "Age-dependent mean tensile strength"
      : "Age-dependent modulus of elasticity";

    const yLabel = (param === "Ecm_t") ? "Ecm(t) (GPa)" : "Strength (MPa)";

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: curve.xs,
        datasets: [
          { label: title, data: curve.ys, tension: 0.25, borderWidth: 2, pointRadius: 0 },
          {
            label: `Selected t = ${currentT} days`,
            data: curve.xs.map((x, i) => (x === currentT ? curve.ys[i] : null)),
            showLine: false,
            pointRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true }, title: { display: false } },
        scales: {
          x: { title: { display: true, text: "Age, t (days)" } },
          y: { title: { display: true, text: yLabel } }
        }
      }
    });
    return;
  }

  const ss = genStressStrain(res, param);
  const title = (param === "ss_parabola") ? "Parabolic-Rectangular (design)"
    : (param === "ss_bilinear") ? "Bi-linear (design)"
    : "Nonlinear (mean)";

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ss.xs,
      datasets: [ { label: title, data: ss.ys, tension: 0.25, borderWidth: 2, pointRadius: 0 } ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true }, title: { display: false } },
      scales: {
        x: { title: { display: true, text: "Strain ε (‰)" } },
        y: { title: { display: true, text: "Stress σ (MPa)" } }
      }
    }
  });
}

// ------------------------------
// Main actions
// ------------------------------
function readInputs() {
  return {
    grade: $("grade").value,
    cem: $("cem").value,
    agg: $("agg").value,
    confinement: $("confinement").value,
    sigma2: Number($("sigma2").value || 0),
    gammaC: Number($("gammaC").value || 1.5),
    alphaCC: Number($("alphaCC").value || 0.85),
    alphaCT: Number($("alphaCT").value || 1.0),
    t: Number($("ageT").value || 28)
  };
}

function validate(inp) {
  const errs = [];
  if (!TABLE_31[inp.grade]) errs.push("Please select a valid grade.");
  if (!(inp.t >= 0)) errs.push("Age t must be ≥ 0.");
  if (!(inp.gammaC > 0)) errs.push("γc must be > 0.");
  if (!(inp.alphaCC > 0)) errs.push("αcc must be > 0.");
  if (!(inp.alphaCT > 0)) errs.push("αct must be > 0.");
  if (inp.confinement === "confined" && inp.sigma2 < 0) errs.push("σ2 must be ≥ 0.");
  return errs;
}

function runCalculationAndRender(alsoPlot = true) {
  const inp = readInputs();
  const errs = validate(inp);
  if (errs.length) {
    alert(errs.join("\n"));
    return;
  }

  const res = calcAll(inp);
  lastResult = res;

  renderSummary(res);
  renderDetails(res);

  if (alsoPlot) renderPlot(res);
}

function init() {
  initTheme();
  initPrint();
  initGrades();
  initConfinement();

  $("btnCalc").addEventListener("click", () => runCalculationAndRender(true));
  $("btnPlot").addEventListener("click", () => {
    if (!lastResult) runCalculationAndRender(true);
    else renderPlot(lastResult);
  });

  runCalculationAndRender(true);
}

document.addEventListener("DOMContentLoaded", init);
