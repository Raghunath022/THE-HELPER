/* ==========================================================================
   SK. RAGHUNATH PORTFOLIO - STRICT RESUME MATCHING ENGINE (PORTFOLIO.JS)
   ========================================================================== */

const projectsData = [
  {
    id: "sofc-thermal-fea",
    title: "SOFC Interconnect Thermal-Structural Analysis",
    subtitle: "Simulation Projects (Capstone, ANSYS Student Edition)",
    category: "ansys",
    categoryLabel: "ANSYS Simulation",
    year: "Capstone",
    summary: "Simulated an aluminium-coated SOFC interconnect under combined mechanical load and a 25–800°C thermal ramp.",
    metric: "Confirmed design limits held (peak 196.9 MPa, relaxing to 80.3 MPa) with negligible deformation (0.33 mm).",
    bullets: [
      "Simulated an aluminium-coated SOFC interconnect under combined mechanical load and a 25–800°C thermal ramp in ANSYS Student Edition.",
      "Confirmed design limits held: Peak stress of 196.9 MPa relaxed to 80.3 MPa under sustained high temperature.",
      "Recorded negligible physical deformation of 0.33 mm, confirming structural & material safety limits held."
    ],
    tags: ["ANSYS Student Edition", "Nonlinear Structural", "Thermal Ramp (25-800°C)", "Peak Stress: 196.9 MPa"],
    link: null
  },
  {
    id: "biomimetic-cooling-cfd",
    title: "Biomimetic Cooling Channel Optimization",
    subtitle: "ANSYS Fluent | Laminar Flow CFD Modeling",
    category: "ansys",
    categoryLabel: "ANSYS CFD",
    year: "CFD Study",
    summary: "Modeled laminar coolant flow through a spider-biomimicked groove geometry in ANSYS Fluent.",
    metric: "Achieved stable, converged heat transfer performance across a 288–308 K surface range.",
    bullets: [
      "Modeled laminar coolant flow through a spider-biomimicked channel groove geometry using ANSYS Fluent.",
      "Achieved stable, converged heat transfer performance across a 288–308 K surface temperature range.",
      "Optimized flow distribution to maintain uniform convective surface thermal dissipation."
    ],
    tags: ["ANSYS Fluent", "Laminar Flow", "Biomimetic Geometry", "288–308 K Heat Transfer"],
    link: null
  },
  {
    id: "sma-bearing-study",
    title: "Shape-Memory-Alloy (SMA) Bearing Study",
    subtitle: "Impact Resistance Simulation",
    category: "ansys",
    categoryLabel: "Simulation",
    year: "2025–2026",
    summary: "Ran a comparative impact-resistance simulation of a conventional bearing versus an SMA-layered design.",
    metric: "Quantified dynamic shock dissipation and damping improvements.",
    bullets: [
      "Ran a comparative impact-resistance simulation of a conventional bearing versus an SMA-layered design in ANSYS.",
      "Quantified structural shock dissipation and dynamic damping improvements under high dynamic impact loading."
    ],
    tags: ["ANSYS Mechanical", "Shape Memory Alloys", "Impact Resistance", "Damping Analysis"],
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
    metric: "Chromium Alloy Steel Frame | Gas-Spring Piston Rear Suspension",
    bullets: [
      "Designed and fabricated a human-powered mountain bike frame in chromium alloy steel, optimizing strength-to-weight ratio for repeated impact loading.",
      "Engineered a gas-spring piston rear suspension to replace the conventional coil spring, integrated with front hydraulic disc brakes."
    ],
    tags: ["Team Lead", "SAE India", "Chromium Alloy Steel", "Gas-Spring Suspension", "Hydraulic Disc Brakes"],
    link: null
  },
  {
    id: "mechanical-fabrication",
    title: "Mechanical Components Fabrication",
    subtitle: "Lathe Machining & Welding",
    category: "manufacturing",
    categoryLabel: "Core Mechanical",
    year: "2025–2026",
    summary: "Manufactured a taper live center via conventional lathe operations and fabricated a mechanical walker.",
    metric: "Lathe Taper Live Center & Precision Mechanical Walker",
    bullets: [
      "Manufactured a taper live center via conventional lathe operations to exact dimensional tolerances.",
      "Fabricated a mechanical walker through precision cutting, welding, and surface finishing."
    ],
    tags: ["Lathe Operations", "Taper Live Center", "Cutting & Welding", "Surface Finishing"],
    link: null
  },
  {
    id: "energis-scan",
    title: "EnergiScan — Portable Energy Diagnostic System",
    subtitle: "Independent Projects & Competitions",
    category: "independent",
    categoryLabel: "Independent IoT",
    year: "2026",
    summary: "Designed a non-invasive current-sensor diagnostic tool generating plain-language ROI reports within 15 mins.",
    metric: "15-Minute On-Site Screening & Plain-Language ROI Engine",
    bullets: [
      "Designed a non-invasive current-sensor diagnostic tool for electrical energy usage assessment.",
      "Engineered on-site screening workflow generating plain-language ROI energy reports within 15 minutes.",
      "Deployed live web diagnostic application."
    ],
    tags: ["Current Sensors", "15-Min On-Site Workflow", "Plain-Language ROI", "Cloudflare Workers"],
    link: "https://energis-scan.kavithaselvanthiran123.workers.dev/"
  },
  {
    id: "smart-axle-bearing",
    title: "Smart Axle Bearing Monitoring System",
    subtitle: "RailHack Finalist | IoT Sensor Fusion Concept",
    category: "independent",
    categoryLabel: "RailHack Finalist",
    year: "2025–2026",
    summary: "Proposed an IoT sensor-fusion concept for predictive maintenance of railway axle bearings.",
    metric: "RailHack National Finalist Distinction",
    bullets: [
      "Proposed an IoT sensor-fusion concept for predictive maintenance of railway axle bearings.",
      "Selected as National RailHack Finalist for real-time acoustic/thermal anomaly detection concept."
    ],
    tags: ["RailHack Finalist", "IoT Sensor Fusion", "Predictive Maintenance", "Railway Bearings"],
    link: null
  },
  {
    id: "agri-smart-ai",
    title: "AgriSmart AI",
    subtitle: "Independent Projects & Competitions",
    category: "independent",
    categoryLabel: "Web AI",
    year: "2026",
    summary: "Intelligent agricultural decision-support web platform for telemetry monitoring and crop insights.",
    metric: "Live Web App Deployed on Firebase",
    bullets: [
      "Built an intelligent decision-support web platform for smart farming and crop health monitoring.",
      "Deployed live app accessible on Firebase Hosting."
    ],
    tags: ["Firebase App", "Agricultural Tech", "Crop Telemetry", "Web Platform"],
    link: "https://agri-smart-ai.web.app"
  },
  {
    id: "telemedicine-portal",
    title: "Telemedicine System",
    subtitle: "Independent Projects & Competitions",
    category: "independent",
    categoryLabel: "Web App",
    year: "2025",
    summary: "Remote healthcare consultation and diagnostic portal built for digital patient management.",
    metric: "Live Web App Deployed on GitHub Pages",
    bullets: [
      "Engineered web healthcare system enabling remote doctor consultations and health tracking.",
      "Deployed live application on GitHub Pages."
    ],
    tags: ["Healthcare UI", "GitHub Pages", "Responsive Web App"],
    link: "https://raghunath022.github.io/Telemedicine/"
  }
];

function renderProjects(filter) {
  try {
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
        
        <div class="p-bullet">
          ${p.summary}
        </div>

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
  } catch (err) {
    console.error("renderProjects error:", err);
  }
}

function initFilterTabs() {
  try {
    const btns = document.querySelectorAll(".filter-btn");
    if (!btns || !btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProjects(btn.getAttribute("data-filter"));
      });
    });
  } catch (err) {
    console.error("initFilterTabs error:", err);
  }
}

function openModal(id) {
  try {
    const p = projectsData.find(item => item.id === id);
    if (!p) return;

    const modalBody = document.getElementById("modalBody");
    const modal = document.getElementById("projectModal");
    if (!modalBody || !modal) return;

    modalBody.innerHTML = `
      <div style="font-size: 0.78rem; font-family: var(--font-code); color: var(--accent-blue-light); margin-bottom: 0.25rem;">
        ${p.categoryLabel} • ${p.year}
      </div>
      <h2 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.25rem;">${p.title}</h2>
      <div style="font-size: 0.88rem; color: var(--accent-amber); margin-bottom: 1.25rem; font-weight: 500;">${p.subtitle}</div>

      <div style="background: rgba(15, 23, 42, 0.6); border-left: 3px solid var(--accent-blue-light); padding: 0.65rem 0.85rem; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600;">
        Exact Result: ${p.metric}
      </div>

      <h4 style="font-size: 0.92rem; margin-bottom: 0.5rem; color: var(--text-main);">Resume Bullet Points:</h4>
      <ul style="padding-left: 1.1rem; color: var(--text-muted); font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem;">
        ${p.bullets.map(b => `<li style="margin-bottom: 0.35rem;">${b}</li>`).join('')}
      </ul>

      <div style="display: flex; gap: 0.75rem;">
        ${p.link ? `
          <a href="${p.link}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
            <i class="fa-solid fa-external-link"></i> Test Live Link
          </a>
        ` : ''}
        <button class="btn btn-sm btn-outline" onclick="closeModal()">Close</button>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  } catch (err) {
    console.error("openModal error:", err);
  }
}

function closeModal() {
  try {
    const modal = document.getElementById("projectModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  } catch (err) {
    console.error("closeModal error:", err);
  }
}

function initModal() {
  try {
    const modal = document.getElementById("projectModal");
    const closeBtn = document.getElementById("modalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }
  } catch (err) {
    console.error("initModal error:", err);
  }
}

function initNavbar() {
  try {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      });
    }

    const menuBtn = document.getElementById("menuBtn") || document.getElementById("mobileToggle");
    const navLinks = document.getElementById("navLinks") || document.getElementById("navMenu");

    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }
  } catch (err) {
    console.error("initNavbar error:", err);
  }
}

// Execute initial load safely
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderProjects("all");
    initFilterTabs();
    initModal();
    initNavbar();
  });
} else {
  renderProjects("all");
  initFilterTabs();
  initModal();
  initNavbar();
}
