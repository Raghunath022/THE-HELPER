/* ==========================================================================
   SK. RAGHUNATH PORTFOLIO - INTERACTIVE APPLICATION ENGINE
   ========================================================================== */

// COMPLETE PROJECT DATASET (All 9 Projects)
const projectsData = [
  {
    id: "sofc-thermal-fea",
    title: "SOFC Interconnect Thermal-Structural Analysis",
    subtitle: "Nonlinear Structural & Thermal Stress Simulation",
    category: "ansys",
    categoryLabel: "ANSYS & FEA",
    year: "2025",
    summary: "Simulated an aluminium-coated Solid Oxide Fuel Cell (SOFC) interconnect under combined mechanical load and a 25°C to 800°C thermal ramp to confirm structural integrity.",
    metric: "Peak Stress: 196.9 MPa → Relaxing to 80.3 MPa | Max Deform: 0.33 mm",
    tags: ["ANSYS Mechanical", "Nonlinear Structural", "Thermal Stress Ramp", "Fuel Cell Materials"],
    description: "Solid Oxide Fuel Cells operate under severe thermomechanical stress during high-temperature thermal cycling. This project analyzed the stress-relaxation and elastic-plastic deformation behavior of an aluminium-coated interconnect alloy subjected to combined clamping pressure and thermal ramping from 25°C up to 800°C.",
    keyResults: [
      "Peak thermal stress localized at 196.9 MPa during early heating phase.",
      "Stress relaxation occurred under sustained high temperature, stabilizing at 80.3 MPa.",
      "Negligible physical deformation recorded (peak 0.33 mm), confirming design safety limits held.",
      "Validated coating adhesion resilience under transient thermomechanical gradient."
    ],
    tools: ["ANSYS Mechanical", "FEA Mesh Refinement", "CAD Geometry Cleanup", "Material Non-Linearity"],
    link: null,
    badgeClass: "badge-ansys"
  },
  {
    id: "biomimetic-cooling-cfd",
    title: "Biomimetic Cooling Channel Optimization",
    subtitle: "ANSYS Fluent CFD & Conjugate Heat Transfer",
    category: "ansys",
    categoryLabel: "ANSYS & CFD",
    year: "2025",
    summary: "Modeled laminar coolant flow through a spider-biomimicked groove geometry to optimize convective heat transfer rates across high-heat surfaces.",
    metric: "Converged Heat Transfer Across 288 K – 308 K Surface Range",
    tags: ["ANSYS Fluent", "CFD Modeling", "Laminar Flow", "Biomimetic Geometry"],
    description: "Inspired by natural micro-channel architectures found in arachnid web structures, this fluid dynamics study modeled laminar coolant flow through spider-patterned groove geometries to enhance thermal management efficiency in high-power density electronics.",
    keyResults: [
      "Achieved stable, converged velocity and pressure flow profiles within ANSYS Fluent.",
      "Maintained uniform surface temperature distribution across 288 K to 308 K.",
      "Reduced localized thermal hotspots by 24% compared to straight-line cooling channels.",
      "Optimized pumping power requirements while maximizing heat transfer coefficients."
    ],
    tools: ["ANSYS Fluent CFD", "Mesh Generation", "Conjugate Heat Transfer", "Boundary Layer Analysis"],
    link: null,
    badgeClass: "badge-ansys"
  },
  {
    id: "sma-bearing-study",
    title: "Shape-Memory-Alloy (SMA) Bearing Impact Study",
    subtitle: "Nonlinear Impact & Dynamic Damping Simulation",
    category: "ansys",
    categoryLabel: "ANSYS & Material Science",
    year: "2025–2026",
    summary: "Ran a comparative impact-resistance simulation of a conventional steel bearing versus an SMA-layered design to quantify shock damping improvements.",
    metric: "Quantified Dynamic Damping & Impact Shock Dissipation",
    tags: ["SMA Material", "Impact Resistance", "Dynamic FEA", "Shock Dissipation"],
    description: "Mechanical bearings subjected to high impact loads suffer early fatigue spalling. This comparative simulation study integrated Shape Memory Alloy (SMA) damping layers into conventional bearing housings to evaluate energy absorption and dynamic stress dissipation during high-velocity shock events.",
    keyResults: [
      "Quantified significant amplitude attenuation of peak transient shock waves.",
      "Demonstrated self-recovering elastic strain behavior characteristic of pseudoelastic SMAs.",
      "Reduced peak von Mises stress transferred to inner bearing race by over 30%.",
      "Paved the way for resilient bearing design in high-vibration machinery."
    ],
    tools: ["ANSYS Mechanical", "Explicit Dynamics / Transient FEA", "SMA Material Modeling"],
    link: null,
    badgeClass: "badge-ansys"
  },
  {
    id: "energis-scan",
    title: "EnergiScan — Portable Energy Diagnostic System",
    subtitle: "Non-Invasive Current Sensor & ROI Analytics",
    category: "web-ai",
    categoryLabel: "IoT & Web AI",
    year: "2026",
    summary: "Designed a non-invasive current-sensor diagnostic tool generating plain-language ROI reports within a 15-minute on-site screening workflow.",
    metric: "15-Minute On-Site Screening & Real-Time ROI Engine",
    tags: ["Current Sensors", "Diagnostic Tool", "ROI Engine", "Cloudflare Workers"],
    description: "EnergiScan is a portable hardware-software diagnostic solution engineered to assess electrical energy inefficiencies in small-to-medium industrial and commercial facilities without interrupting operations.",
    keyResults: [
      "15-minute non-invasive current clamp screening workflow.",
      "Automated plain-language ROI energy audit report generator.",
      "Deployed and accessible live on Cloudflare Workers edge network."
    ],
    tools: ["Current Transformers (CT)", "JavaScript Cloudflare Workers", "Signal Processing", "HTML5/CSS3"],
    link: "https://energis-scan.kavithaselvanthiran123.workers.dev/",
    badgeClass: "badge-web-ai"
  },
  {
    id: "agri-smart-ai",
    title: "AgriSmart AI — Precision Agriculture Platform",
    subtitle: "AI Decision Support & Smart Telemetry",
    category: "web-ai",
    categoryLabel: "AI & Web Apps",
    year: "2026",
    summary: "Comprehensive web platform delivering smart agricultural analytics, crop health monitoring, and soil telemetry for optimized farming outcomes.",
    metric: "Full-Stack Web App Deployed on Firebase",
    tags: ["AI Machine Learning", "Crop Telemetry", "Firebase App", "Agricultural Tech"],
    description: "AgriSmart AI brings modern web analytics and machine learning decision-support algorithms to agriculture, empowering farmers with real-time insights on soil moisture, weather predictions, and crop pathology diagnosis.",
    keyResults: [
      "Interactive multi-dashboard layout for crop metrics and micro-climate conditions.",
      "Integrated machine learning recommendation engine for fertilizer and irrigation scheduling.",
      "Hosted and live on Firebase hosting infrastructure."
    ],
    tools: ["React / Modern Web", "Firebase Hosting", "Python ML Backend", "RESTful APIs"],
    link: "https://agri-smart-ai.web.app",
    badgeClass: "badge-web-ai"
  },
  {
    id: "telemedicine-system",
    title: "Telemedicine & Remote Healthcare Portal",
    subtitle: "Web Diagnostics & Online Patient Platform",
    category: "web-ai",
    categoryLabel: "AI & Web Apps",
    year: "2025",
    summary: "Designed and deployed a responsive telemedicine web platform facilitating remote doctor consultations, digital health records, and diagnostic tracking.",
    metric: "Live Web App Deployed via GitHub Pages",
    tags: ["Healthcare Tech", "GitHub Pages", "Responsive Web UI", "Patient Portal"],
    description: "A digital telemedicine portal built to streamline remote medical appointments, diagnostic result viewing, and prescription management with an intuitive user interface.",
    keyResults: [
      "Seamless multi-role workflow (Patient, Doctor, Admin).",
      "Lightweight, responsive frontend design optimized for low-bandwidth mobile connections.",
      "Deployed live on GitHub Pages."
    ],
    tools: ["HTML5", "CSS3", "JavaScript", "GitHub Pages Deployment"],
    link: "https://raghunath022.github.io/Telemedicine/",
    badgeClass: "badge-web-ai"
  },
  {
    id: "sae-bicycle-design",
    title: "SAE Mountain Bike Frame & Gas-Spring Suspension",
    subtitle: "Team Lead | SAE India Specifications",
    category: "manufacturing",
    categoryLabel: "Core Mechanical & SAE",
    year: "2025",
    summary: "Designed and fabricated a human-powered mountain bike frame in chromium alloy steel; integrated a custom gas-spring piston rear suspension.",
    metric: "Chromium Alloy Steel Frame | Gas-Spring Piston Rear Suspension",
    tags: ["SAE India Lead", "Chromium Alloy Steel", "Gas-Spring Suspension", "Hydraulic Brakes"],
    description: "As Team Lead for the SAE India human-powered vehicle challenge, engineered a rugged mountain bike chassis designed to withstand repeated impact loads while minimizing total weight.",
    keyResults: [
      "Selected and stress-analyzed Chromium Alloy Steel tubing for high strength-to-weight ratio.",
      "Engineered an innovative gas-spring piston rear suspension replacing heavy conventional coil springs.",
      "Integrated high-performance front hydraulic disc brakes for instant braking response under dynamic shock."
    ],
    tools: ["SolidWorks CAD", "Chassis Fabrication", "MIG Welding", "Hydraulic Brake Telemetry"],
    link: null,
    badgeClass: "badge-manufacturing"
  },
  {
    id: "mechanical-fabrication",
    title: "Mechanical Components Precision Fabrication",
    subtitle: "Lathe Machining, Welding & Metal Finishing",
    category: "manufacturing",
    categoryLabel: "Core Manufacturing",
    year: "2025–2026",
    summary: "Manufactured a taper live center via conventional lathe operations and fabricated a mechanical walker through precision cutting, welding, and surface finishing.",
    metric: "Lathe Taper Live Center & Precision Mechanical Walker",
    tags: ["Lathe Machining", "Taper Turning", "Welding", "Surface Finishing"],
    description: "Hands-on machine shop manufacturing project demonstrating mastery over conventional machine tools, precision metalworking tolerances, and structural assembly.",
    keyResults: [
      "Turned and ground a hardened taper live center on a conventional lathe to strict ISO dimensional tolerances.",
      "Fabricated a multi-link mechanical walker using precision pipe cutting, TIG/MIG welding, and anti-corrosive surface coating.",
      "Verified fitment and smooth rotational bearing engagement under heavy axial loads."
    ],
    tools: ["Conventional Lathe", "Taper Turning Attachment", "Precision Micrometers", "Welding Rig"],
    link: null,
    badgeClass: "badge-manufacturing"
  },
  {
    id: "smart-axle-bearing",
    title: "Smart Axle Bearing Monitoring System",
    subtitle: "RailHack Finalist Project | IoT Sensor Fusion",
    category: "iot",
    categoryLabel: "IoT & Hardware",
    year: "2025–2026",
    summary: "Proposed an IoT sensor-fusion concept for predictive maintenance of railway axle bearings, alerting engineers to thermal & vibration anomalies.",
    metric: "RailHack National Finalist Distinction",
    tags: ["RailHack Finalist", "Sensor Fusion", "Predictive Maintenance", "Railway IoT"],
    description: "Selected as a finalist in the National RailHack competition. Proposed an intelligent IoT sensor node combining piezoelectric vibration transducers and infrared thermal sensors to monitor high-speed railway wheelset bearings in real-time.",
    keyResults: [
      "Earned RailHack Finalist honors among nationwide engineering submissions.",
      "Designed early anomaly detection algorithms for acoustic emission and bearing hot-box prevention.",
      "Engineered low-power wireless telemetry concept for freight and passenger cars."
    ],
    tools: ["Vibration Sensors", "Thermal IR Sensors", "IoT Gateway Architecture", "Predictive ML Logic"],
    link: null,
    badgeClass: "badge-iot"
  }
];

// DOM ELEMENTS
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initTypingEffect();
  renderProjects("all");
  initFilterButtons();
  initModalListeners();
});

// NAVBAR SCROLL & MOBILE TOGGLE
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
}

// TYPING EFFECT FOR HERO TITLE
function initTypingEffect() {
  const words = [
    "FEA & CFD Simulation",
    "ANSYS Stress Analysis",
    "IoT Predictive Systems",
    "Core Mechanical Design"
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const targetEl = document.getElementById("typingText");
  if (!targetEl) return;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      targetEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      targetEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 2200; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 500;
    }

    setTimeout(type, speed);
  }

  type();
}

// RENDER PROJECTS GRID
function renderProjects(filterCategory) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const filtered = filterCategory === "all" 
    ? projectsData 
    : projectsData.filter(p => p.category === filterCategory);

  grid.innerHTML = filtered.map(project => `
    <div class="project-card glass-panel" data-id="${project.id}">
      <div class="project-card-header">
        <span class="project-category-badge ${project.badgeClass}">${project.categoryLabel}</span>
        <span class="project-year">${project.year}</span>
      </div>

      <div class="project-body">
        <h3 class="project-title">${project.title}</h3>
        <div class="project-subtitle">${project.subtitle}</div>
        <p class="project-desc">${project.summary}</p>
        
        <div class="project-metric-box">
          <i class="fa-solid fa-chart-line"></i> ${project.metric}
        </div>

        <div class="project-tags">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>

        <div class="project-actions">
          <button class="btn btn-sm btn-primary view-details-btn" onclick="openProjectModal('${project.id}')">
            <i class="fa-solid fa-circle-info"></i> View Details
          </button>
          ${project.link ? `
            <a href="${project.link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Live App
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// FILTER BUTTON LISTENERS
function initFilterButtons() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      renderProjects(category);
    });
  });
}

// PROJECT DETAIL MODAL LOGIC
function openProjectModal(projectId) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  const modalContent = document.getElementById("modalContent");
  const modalOverlay = document.getElementById("projectModal");

  modalContent.innerHTML = `
    <span class="modal-header-badge">${project.categoryLabel} • ${project.year}</span>
    <h2 class="modal-title">${project.title}</h2>
    <div class="modal-subtitle">${project.subtitle}</div>

    <div class="modal-spec-grid">
      <div class="modal-spec-card">
        <div class="modal-spec-label">Key Engineering Result / Metric</div>
        <div class="modal-spec-val">${project.metric}</div>
      </div>
      <div class="modal-spec-card">
        <div class="modal-spec-label">Primary Software & Methods</div>
        <div class="modal-spec-val" style="font-size: 0.95rem;">${project.tools.join(', ')}</div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">Project Overview</h4>
      <p style="color: var(--text-secondary); line-height: 1.7;">${project.description}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 1.1rem; color: var(--accent-amber); margin-bottom: 0.75rem;">Key Achievements & Analysis Highlights</h4>
      <ul style="padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.8;">
        ${project.keyResults.map(res => `<li style="margin-bottom: 0.4rem;">${res}</li>`).join('')}
      </ul>
    </div>

    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      ${project.link ? `
        <a href="${project.link}" target="_blank" rel="noopener" class="btn btn-primary">
          <i class="fa-solid fa-external-link"></i> Launch Live Application
        </a>
      ` : ''}
      <button class="btn btn-outline" onclick="closeModal()">Close Window</button>
    </div>
  `;

  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modalOverlay = document.getElementById("projectModal");
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

function initModalListeners() {
  const modalOverlay = document.getElementById("projectModal");
  const modalClose = document.getElementById("modalClose");

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}
