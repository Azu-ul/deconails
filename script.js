/* ==========================================================
   Deco Nails · script.js

   DATOS DE CONTACTO — editá SOLO este bloque para reemplazarlos.
   ========================================================== */
const CONFIG = {
  studioName: "Deco Nails",

  // DEMO: número ficticio. Reemplazalo por el real, con código de país y área,
  // sin "+", espacios ni guiones (ej.: 5492235551234).
  whatsappNumber: "5490000000000",

  // DEMO: enlace de ejemplo. Reemplazalo por el Instagram real del estudio.
  instagramUrl: "https://www.instagram.com/",

  // Dirección que abre el botón "Cómo llegar" en Google Maps.
  mapsQuery: "Güemes 2450, Mar del Plata, Buenos Aires, Argentina",
};

/* ---------- Utilidades de contacto ---------- */
function buildWhatsAppMessage(service) {
  const base = `Hola, ${CONFIG.studioName}. Quisiera consultar disponibilidad para un turno`;
  return service ? `${base} de ${service}.` : `${base}.`;
}

function buildWhatsAppUrl(service) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(service))}`;
}

function buildMapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
}

/* Abre el enlace en pestaña nueva y lo anuncia a lectores de pantalla */
function openInNewTab(link) {
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (!link.querySelector(".visually-hidden.external-note")) {
    const note = document.createElement("span");
    note.className = "visually-hidden external-note";
    note.textContent = " (se abre en una pestaña nueva)";
    link.appendChild(note);
  }
}

/* ---------- Enlaces de contacto ---------- */
function initContactLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = buildWhatsAppUrl(link.dataset.service || "");
    openInNewTab(link);
  });

  document.querySelectorAll("[data-directions]").forEach((link) => {
    link.href = buildMapsUrl();
    openInNewTab(link);
  });

  document.querySelectorAll("[data-instagram]").forEach((link) => {
    link.href = CONFIG.instagramUrl;
    openInNewTab(link);
  });
}

/* ---------- Selector de servicio en "Reservá tu próximo turno" ---------- */
function initBooking() {
  const select = document.getElementById("service-select");
  const link = document.getElementById("booking-link");
  const preview = document.getElementById("message-preview");
  if (!select || !link || !preview) return;

  const update = () => {
    const service = select.value;
    link.href = buildWhatsAppUrl(service);
    link.dataset.service = service;
    preview.textContent = `Mensaje que se enviará: «${buildWhatsAppMessage(service)}»`;
  };

  select.addEventListener("change", update);
  update();
}

/* ---------- Menú móvil ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const label = toggle.querySelector(".visually-hidden");
  const desktop = window.matchMedia("(min-width: 62em)");

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setOpen(false);
  });

  desktop.addEventListener("change", () => setOpen(false));
}

/* ---------- Navegación entre secciones (desplazamiento suave) ---------- */
function initSmoothAnchors() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", `#${id}`);

    // Mueve el foco a la sección para usuarios de teclado y lectores de pantalla
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

/* ---------- Enlace activo del menú según la sección visible ---------- */
function initActiveNav() {
  if (!("IntersectionObserver" in window)) return;

  const sectionToLink = {
    inicio: "inicio",
    servicios: "servicios",
    horarios: "horarios",
    ubicacion: "horarios",
    faq: "faq",
  };

  const links = new Map();
  document.querySelectorAll(".site-nav a").forEach((a) => links.set(a.getAttribute("href").slice(1), a));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = sectionToLink[entry.target.id];
        links.forEach((a, id) => {
          if (id === activeId) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  Object.keys(sectionToLink).forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* ---------- Acordeón de preguntas frecuentes ---------- */
function initFaq() {
  document.querySelectorAll(".faq__trigger").forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    panel.hidden = true;

    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
}

/* ---------- Copiar dirección ---------- */
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("No se pudo copiar");
}

function initCopyAddress() {
  const button = document.querySelector("[data-copy-address]");
  const source = document.getElementById("address-text");
  const status = document.getElementById("copy-status");
  if (!button || !source || !status) return;

  let timer;
  button.addEventListener("click", async () => {
    clearTimeout(timer);
    try {
      await copyText(source.textContent.trim());
      status.textContent = "Dirección copiada.";
    } catch (error) {
      status.textContent = "No se pudo copiar. Podés seleccionar el texto de la dirección.";
    }
    timer = setTimeout(() => { status.textContent = ""; }, 3500);
  });
}

/* ---------- Inicio ---------- */
initContactLinks();
initBooking();
initMobileMenu();
initSmoothAnchors();
initActiveNav();
initFaq();
initCopyAddress();