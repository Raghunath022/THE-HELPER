/* ==========================================================================
   SK. RAGHUNATH PORTFOLIO - RESUME-OPTIMIZED PROJECT ENGINE
   ========================================================================== */

const projectsData = [
  {
    id: "sofc-thermal-fea",
    title: "SOFC Interconnect Thermal-Structural Analysis",
    subtitle: "ANSYS Student Edition | Nonlinear Structural Simulation",
    category: "ansys",
    categoryLabel: "ANSYS FEA",
    year: "2025",
    summary: "Simulated an aluminium-coated SOFC interconnect under combined mechanical load and a 25–800°C thermal ramp.",
    metric: "Peak Stress: 196.9 MPa → Relaxed: 80.3 MPa | Deform: 0.33 mm",
    bullets: [
      "Simulated aluminium-coated SOFC interconnect under 25–800°C thermal ramp & mechanical load.",
      "Confirmed design limits held: Peak stress of 196.9 MPa relaxed to 80.3 MPa under sustained heat.",
      "Recorded negligible physical deformation of 0.33 mm, confirming structural integrity."
    ],
    tags: ["ANSYS Mechanical", "Thermal Ramp (25-800°C)", "Nonlinear FEA", "Stress Relaxation"],
    link: null
  },
  {
    id: "biomimetic-cooling-cfd",
    title: "Biomimetic Cooling Channel Optimization",
    subtitle: "ANSYS Fluent | Laminar Flow CFD Modeling",
    category: "ansys",
    categoryLabel: "ANSYS CFD",
    year: "2025",
    summary: "Modeled laminar coolant flow through a spider-biomimicked groove geometry in ANSYS Fluent.",
    metric: "Converged Heat Transfer Across 288–308 K Surface Range",
    bullets: [
      "Modeled laminar coolant flow through spider-biomimicked micro-channel groove geometry.",
      "Achieved stable, converged heat transfer performance across 288–308 K surface temperature range.",
      "Optimized flow distribution to eliminate localized surface thermal hotspots."
    ],
    tags: ["ANSYS Fluent", "CFD Modeling", "Laminar Flow", "Biomimetic Geometry"],
    link: null
  },
  {
    id: "sma-bearing-study",
    title: "Shape-Memory-Alloy (SMA) Bearing Study",
    subtitle: "Impact Resistance & Shock Damping Simulation",
    category: "ansys",
    categoryLabel: "FEA Simulation",
    year: "2025–2026",
    summary: "Ran a comparative impact-resistance simulation of conventional vs. SMA-layered bearing designs.",
    metric: "Quantified Dynamic Damping & Impact Dissipation",
    bullets: [
      "Executed dynamic impact simulation comparing standard steel bearing vs. SMA-layered housing.",
      "Quantified structural shock dissipation and damping performance under high-velocity impact.",
      "Demonstrated pseudoelastic strain recovery to mitigate bearing dynamic fatigue."
    ],
    tags: ["ANSYS Mechanical", "Shape Memory Alloys", "Impact Simulation", "Damping Analysis"],
    link: null
  },
  {
    id: "sae-bicycle-design",
    title: "SAE Bicycle Design",
    subtitle: "Team Lead | SAE India Specifications",
    category: "manufacturing",
    categoryLabel: "Core Mechanical",
    year: "2025",
    summary: "Designed and fabricated a human-powered mountain bike frame in chromium alloy steel.",
    metric: "Chromium Steel Frame | Gas-Spring Rear Piston Suspension",
    bullets: [
      "Designed and fabricated mountain bike frame in chromium alloy steel, optimizing strength-to-weight ratio.",
      "Engineered gas-spring piston rear suspension to replace conventional coil spring.",
      "Integrated front hydraulic disc brakes for responsive dynamic braking."
    ],
    tags: ["SAE India Lead", "Chromium Alloy Steel", "Gas-Spring Suspension", "Hydraulic Brakes"],
    link: null
  },
  {
    id: "mechanical-fabrication",
    title: "Mechanical Components Fabrication",
    subtitle: "Lathe Machining & Precision Welding",
    category: "manufacturing",
    categoryLabel: "Core Mechanical",
    year: "2025–2026",
    summary: "Manufactured a taper live center on conventional lathe and fabricated a mechanical walker.",
    metric: "Lathe Live Center & Precision Mechanical Walker",
    bullets: [
      "Manufactured a taper live center via conventional lathe operations to precise ISO tolerances.",
      "Fabricated a mechanical walker through precision tube cutting, welding, and surface finishing.",
      "Verified rotational alignment and structural integrity under static load."
    ],
    tags: ["Lathe Operations", "Taper Turning", "Welding", "Surface Finishing"],
    link: null
  },
  {
    id: "energis-scan",
    title: "EnergiScan — Portable Energy Diagnostic System",
    subtitle: "Non-Invasive CT Sensor & Automated ROI Engine",
    category: "independent",
    categoryLabel: "IoT & Hardware",
    year: "2026",
    summary: "Designed a non-invasive current-sensor diagnostic tool generating plain-language ROI reports.",
    metric: "15-Minute On-Site Screening & ROI Report Engine",
    bullets: [
      "Designed non-invasive current-sensor diagnostic tool for instant electrical energy audits.",
      "Built 15-minute on-site screening workflow producing plain-language ROI reports.",
      "Deployed live web application on Cloudflare Workers."
    ],
    tags: ["Current CT Sensors", "Energy Audit", "15-Min Workflow", "Cloudflare Workers"],
    link: "https://energis-scan.kavithaselvanthiran123.workers.dev/"
  },
  {
    id: "smart-axle-bearing",
    title: "Smart Axle Bearing Monitoring System",
    subtitle: "RailHack Finalist | IoT Predictive Maintenance",
    category: "independent",
    categoryLabel: "IoT Competition",
    year: "2025–2026",
    summary: "Proposed an IoT sensor-fusion concept for predictive maintenance of railway axle bearings.",
    metric: "RailHack National Finalist Distinction",
    bullets: [
      "Proposed IoT sensor-fusion system for real-time predictive maintenance of railway axle bearings.",
      "Shortlisted as RailHack National Finalist for early thermal and acoustic failure detection concept."
    ],
    tags: ["RailHack Finalist", "Sensor Fusion", "Railway IoT", "Predictive Maintenance"],
    link: null
  },
  {
    id: "agri-smart-ai",
    title: "AgriSmart AI Platform",
    subtitle: "AI Decision Support & Crop Diagnostics",
    category: "independent",
    categoryLabel: "AI Web Application",
    year: "2026",
    summary: "Built an intelligent agricultural web application for telemetry monitoring and crop insights.",
    metric: "Live Web App Deployed on Firebase",
    bullets: [
      "Developed precision agriculture platform with crop diagnostic decision support.",
      "Integrated real-time soil telemetry tracking and weather analytics.",
      "Deployed live application on Firebase Hosting."
    ],
    tags: ["React / Web", "Firebase Hosting", "Crop AI", "Agricultural Tech"],
    link: "https://agri-smart-ai.web.app"
  },
  {
    id: "telemedicine-system",
    title: "Telemedicine Healthcare System",
    subtitle: "Web Consultation & Patient Portal",
    category: "independent",
    categoryLabel: "Web Application",
    year: "2025",
    summary: "Built a responsive telemedicine portal enabling online consultations and health tracking.",
    metric: "Live Web App Deployed on GitHub Pages",
    bullets: [
      "Engineered web healthcare portal facilitating remote doctor consultations and record tracking.",
      "Designed responsive mobile-friendly UI deployed live on GitHub Pages."
    ],
    tags: ["HTML5 / JS", "GitHub Pages", "Healthcare UI", "Patient Portal"],
    link: "https://raghunath022.github.io/Telemedicine/"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderProjects("all");
  initFilterTabs();
  initModal();
});

function renderProjects(filter) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const filtered = filter === "all" 
    ? projectsData 
    : projectsData.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <div class="project-item">
      <div class="p-header">
        <span class="p-category">${p.categoryLabel}</span>
        <span class="p-year">${p.year}</span>
      </div>

      <h3 class="p-title">${p.title}</h3>
      <div class="p-subtitle">${p.subtitle}</div>
      <p class="p-bullet">${p.summary}</p>
      
      <div class="p-metric">
        <i class="fa-solid fa-check-circle"></i> ${p.metric}
      </div>

      <div class="p-tags">
        ${p.tags.map(t => `<span class="p-tag">${t}</span>`).join('')}
      </div>

      <div class="p-actions">
        <button class="btn btn-sm btn-outline" onclick="openModal('${p.id}')">
          <i class="fa-solid fa-list-check"></i> Details
        </button>
        ${p.link ? `
          <a href="${p.link}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Link
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function initFilterTabs() {
  const btns = document.querySelectorAll(".tab-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects(btn.getAttribute("data-filter"));
    });
  });
}

function openModal(id) {
  const p = projectsData.find(item => item.id === id);
  if (!p) return;

  const content = document.getElementById("modalContent");
  const modal = document.getElementById("projectModal");

  content.innerHTML = `
    <div style="font-size: 0.78rem; font-family: var(--font-code); color: var(--accent-blue-light); margin-bottom: 0.25rem;">
      ${p.categoryLabel} • ${p.year}
    </div>
    <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 0.25rem;">${p.title}</h2>
    <div style="font-size: 0.9rem; color: var(--accent-amber); margin-bottom: 1.25rem; font-weight: 500;">${p.subtitle}</div>

    <div style="background: rgba(15, 23, 42, 0.6); border-left: 3px solid var(--accent-blue-light); padding: 0.65rem 0.85rem; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600;">
      Key Metric: ${p.metric}
    </div>

    <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-main);">Resume Bullet Points & Key Highlights:</h4>
    <ul style="padding-left: 1.1rem; color: var(--text-muted); font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem;">
      ${p.bullets.map(b => `<li style="margin-bottom: 0.35rem;">${b}</li>`).join('')}
    </ul>

    <div style="display: flex; gap: 0.75rem;">
      ${p.link ? `
        <a href="${p.link}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
          <i class="fa-solid fa-external-link"></i> Open Live Project
        </a>
      ` : ''}
      <button class="btn btn-sm btn-outline" onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function initModal() {
  const modal = document.getElementById("projectModal");
  const closeBtn = document.getElementById("modalClose");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}
