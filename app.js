"use strict";
const $ = (s) => document.querySelector(s);
let lang = "fr",
  current = 0,
  paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
const visited = new Set();
const copy = {
  fr: {
    brand: "Humain. Travail. Montréal.",
    contact: "Dire bonjour ↗",
    eyebrow: "MONTRÉAL, QC · RELATIONS INDUSTRIELLES",
    headline: "Un parcours.<br><em>Toute une ville.</em>",
    intro:
      "Moi, c’est Liam. L’humain me passionne, la technologie m’inspire. Bienvenue dans mon petit Montréal.",
    tour: "Suivez Pepper →",
    note: "6 arrêts pour faire connaissance. À votre rythme.",
    mapTitle: "MONTRÉAL EN MINIATURE",
    season: "MONTRÉAL · AUTOMNE",
    hint: "Glissez pour explorer · Choisissez un arrêt",
    reset: "Recentrer",
    line: "LIGNE 01 · MON PARCOURS",
    footer: "Fait de curiosité. Ancré à Montréal.",
    previous: "← Précédent",
    next: "Suivant →",
    finish: "Fin de la visite ✓",
  },
  en: {
    brand: "People. Work. Montréal.",
    contact: "Say hello ↗",
    eyebrow: "MONTRÉAL, QC · INDUSTRIAL RELATIONS",
    headline: "One journey.<br><em>A whole city.</em>",
    intro:
      "I’m Liam. Inspired by people, curious about technology. Welcome to my little Montréal.",
    tour: "Follow Pepper →",
    note: "6 stops to get acquainted. At your own pace.",
    mapTitle: "MONTRÉAL IN MINIATURE",
    season: "MONTRÉAL · AUTUMN",
    hint: "Drag to explore · Choose a stop",
    reset: "Recenter",
    line: "LINE 01 · MY JOURNEY",
    footer: "Built with curiosity. Rooted in Montréal.",
    previous: "← Previous",
    next: "Next →",
    finish: "Tour complete ✓",
  },
};
// CV facts supplied by Liam. Landmarks are narrative anchors, not employer addresses.
const stops = [
  {
    x: 850,
    y: 795,
    fr: [
      "Bonjour !",
      "Place d’Armes",
      "L’humain comme point de départ.",
      "Je suis Liam Hellman, étudiant en relations industrielles avec une mineure en informatique à l’Université de Montréal. Je souhaite mettre ma curiosité, mon sens du service et mon aisance avec les outils numériques au service des ressources humaines.",
      ["Relations industrielles", "Français + anglais", "Montréal"],
      [
        [
          "CAP SUR LES RH",
          "Des personnes et des organisations",
          "Le recrutement, l’expérience employé et les relations du travail sont des domaines que je souhaite explorer. Mes expériences en service, en événementiel et en technologie constituent mon point de départ.",
        ],
        [
          "DEUX REGARDS",
          "L’humain et les systèmes",
          "Mon parcours combine des études sur le travail et une formation technique. Je m’intéresse à la manière dont les outils peuvent soutenir la collaboration et les équipes.",
        ],
      ],
    ],
    en: [
      "Hello there!",
      "Place d’Armes",
      "People are the starting point.",
      "I’m Liam Hellman, an industrial relations student with a computer science minor at Université de Montréal. I want to bring curiosity, a service mindset and confidence with digital tools to human resources.",
      ["Industrial relations", "French + English", "Montréal"],
      [
        [
          "TOWARD HR",
          "People and organizations",
          "Recruitment, employee experience and labour relations are areas I want to explore. My experience in service, events and technology gives me a practical starting point.",
        ],
        [
          "TWO PERSPECTIVES",
          "People and systems",
          "My studies combine an understanding of work with a technical foundation. I’m interested in how tools can support collaboration and teams.",
        ],
      ],
    ],
  },
  {
    x: 230,
    y: 300,
    fr: [
      "Formation",
      "Université de Montréal",
      "Apprendre à comprendre le travail.",
      "Les relations industrielles pour comprendre les milieux de travail. L’informatique pour mieux comprendre leurs outils.",
      ["UdeM", "Formation en cours"],
      [
        [
          "AOÛT 2024 — MAI 2027 PRÉVU",
          "Université de Montréal",
          "Baccalauréat ès arts et sciences : majeure en relations industrielles et mineure en informatique.",
        ],
        [
          "AOÛT 2021 — MAI 2024",
          "Collège de Maisonneuve",
          "DEC en administration et mathématiques.",
        ],
        [
          "2016 — 2021",
          "Académie de Roberval",
          "Robotique et littérature anglaise.",
        ],
      ],
    ],
    en: [
      "Education",
      "Université de Montréal",
      "Learning how work works.",
      "Industrial relations to understand workplaces. Computer science to understand their tools.",
      ["UdeM", "Studies in progress"],
      [
        [
          "AUG 2024 — MAY 2027 EXPECTED",
          "Université de Montréal",
          "Bachelor of Arts and Science: major in Industrial Relations and minor in Computer Science.",
        ],
        [
          "AUG 2021 — MAY 2024",
          "Collège de Maisonneuve",
          "DEC in Administration and Mathematics.",
        ],
        [
          "2016 — 2021",
          "Académie de Roberval",
          "Robotics and English Literature.",
        ],
      ],
    ],
  },
  {
    x: 1090,
    y: 340,
    fr: [
      "Expérience",
      "Quartier Rosemont",
      "Le terrain, ma première école.",
      "Du service à la clientèle aux projets techniques, j’ai appris à communiquer, à coordonner et à m’adapter.",
      ["Service", "Coordination", "Collaboration"],
      [
        [
          "AOÛT 2024 — PRÉSENT · BAR ROSEMONT",
          "Barman",
          "Assurer le service à la clientèle dans un milieu animé, gérer les opérations du bar, composer avec plusieurs priorités et créer de nouvelles recettes.",
        ],
        [
          "MAI 2022 — AVRIL 2023 · CANASSISTANCE",
          "Stagiaire DevOps · Croix Bleue Canassurance",
          "Collaborer dans une équipe Agile, maintenir et mettre à jour des serveurs DNS, travailler avec Microsoft Azure et utiliser l’infrastructure en tant que code et des outils de programmation.",
        ],
        [
          "JUIN — SEPTEMBRE 2021 · XP-MTL",
          "Technicien événementiel",
          "Assurer le service et le soutien sur place, coordonner les horaires et les échanges avec les artistes et contribuer à la logistique des événements.",
        ],
      ],
    ],
    en: [
      "Experience",
      "Rosemont neighbourhood",
      "Learning on the ground.",
      "From customer service to technical projects, I’ve learned to communicate, coordinate and adapt.",
      ["Service", "Coordination", "Collaboration"],
      [
        [
          "AUG 2024 — PRESENT · BAR ROSEMONT",
          "Bartender",
          "Deliver customer service in a fast-paced environment, manage daily bar operations, balance multiple priorities and develop new recipes.",
        ],
        [
          "MAY 2022 — APR 2023 · CANASSISTANCE",
          "DevOps intern · Croix Bleue Canassurance",
          "Collaborated in an Agile team, maintained and updated DNS servers, worked with Microsoft Azure, infrastructure as code and programming tools.",
        ],
        [
          "JUN — SEP 2021 · XP-MTL",
          "Event technician",
          "Provided customer service and on-site support, coordinated schedules and communication with artists, and supported event logistics.",
        ],
      ],
    ],
  },
  {
    x: 420,
    y: 730,
    fr: [
      "Savoir-faire",
      "Centre-ville",
      "À l’aise avec les gens et les outils.",
      "Un bagage pratique pour travailler avec des équipes, organiser l’information et découvrir de nouveaux systèmes.",
      ["Communication", "Outils numériques"],
      [
        [
          "RH ET PRODUCTIVITÉ",
          "Les outils du quotidien",
          "Microsoft 365, Workday, UKG, Google Forms, Microsoft Forms et Microsoft Planner. Ces outils figurent dans mon parcours; je ne les présente pas comme une certification.",
        ],
        [
          "INFORMATIQUE",
          "Un regard technique",
          "Python, Java, SQL, JavaScript, HTML/CSS, R, Bash, Git et React. Expérience avec Azure et Terraform.",
        ],
        [
          "LANGUES",
          "Créer des liens",
          "Français et anglais courants. Apprentissage de l’espagnol et du japonais.",
        ],
      ],
    ],
    en: [
      "Skills",
      "Downtown",
      "Comfortable with people and tools.",
      "A practical foundation for working with teams, organizing information and learning new systems.",
      ["Communication", "Digital tools"],
      [
        [
          "HR & PRODUCTIVITY",
          "Everyday tools",
          "Microsoft 365, Workday, UKG, Google Forms, Microsoft Forms and Microsoft Planner. These are tools from my background, rather than claimed certifications.",
        ],
        [
          "COMPUTER SCIENCE",
          "A technical perspective",
          "Python, Java, SQL, JavaScript, HTML/CSS, R, Bash, Git and React. Experience with Azure and Terraform.",
        ],
        [
          "LANGUAGES",
          "Making connections",
          "Fluent French and English. Currently learning Spanish and Japanese.",
        ],
      ],
    ],
  },
  {
    x: 1115,
    y: 860,
    fr: [
      "Projets",
      "Vieux-Montréal",
      "Des idées qui prennent forme.",
      "J’aime explorer une idée en construisant quelque chose de concret. Deux projets de mon parcours technique.",
      ["Curiosité", "Technologie"],
      [
        [
          "JANVIER 2025",
          "Factify.Tech",
          "Développement d’une application web et d’une extension Chrome pour analyser des biais linguistiques et vérifier des affirmations à l’aide de LLM. Analyse de texte et de vidéos sélectionnés sur une page. Technologies : React, CSS, JavaScript et OpenAI.",
        ],
        [
          "FÉVRIER 2025",
          "Roast-Me",
          "Application utilisant la vision par ordinateur pour produire des commentaires humoristiques ou des compliments. Suivi facial avec OpenCV et Dlib, génération de texte par LLM et lecture vocale. Technologies : Python, HTML, CSS et JavaScript.",
        ],
      ],
    ],
    en: [
      "Projects",
      "Old Montréal",
      "Ideas taking shape.",
      "I enjoy exploring an idea by building something tangible. Two projects from my technical background.",
      ["Curiosity", "Technology"],
      [
        [
          "JANUARY 2025",
          "Factify.Tech",
          "Built a web app and Chrome extension to analyze linguistic bias and fact-check claims using LLMs, processing selected text and video content. Technologies: React, CSS, JavaScript and OpenAI.",
        ],
        [
          "FEBRUARY 2025",
          "Roast-Me",
          "Built an app using computer vision to create humorous comments or compliments. Facial tracking with OpenCV and Dlib, LLM-generated text and voice-over. Technologies: Python, HTML, CSS and JavaScript.",
        ],
      ],
    ],
  },
  {
    x: 505,
    y: 160,
    fr: [
      "Au-delà du travail",
      "Parc du Mont-Royal",
      "La curiosité ne s’arrête pas au bureau.",
      "Le sport, les arts et les moments partagés font aussi partie de mon parcours. Et Pepper est toujours partant pour une promenade.",
      ["Sports d’équipe", "Arts", "Cuisine"],
      [
        [
          "SUR LE TERRAIN",
          "Jouer collectif",
          "Basketball, hockey, soccer et arts martiaux. Participation au basketball intra-muros.",
        ],
        [
          "SUR LE CAMPUS",
          "D’autres communautés",
          "UdeM AI et MealCare font partie des clubs mentionnés dans mon parcours.",
        ],
        [
          "AU QUOTIDIEN",
          "Continuer à explorer",
          "Histoire, arts visuels, politique, cuisine, informatique et robotique. Pour échanger : liamhellman@gmail.com.",
        ],
      ],
    ],
    en: [
      "Beyond work",
      "Mount Royal Park",
      "Curiosity doesn’t clock out.",
      "Sports, art and shared moments are part of my story too. And Pepper is always ready for a walk.",
      ["Team sports", "Art", "Cooking"],
      [
        [
          "ON THE COURT",
          "Playing together",
          "Basketball, hockey, soccer and martial arts. Participation in intramural basketball.",
        ],
        [
          "ON CAMPUS",
          "Other communities",
          "UdeM AI and MealCare are clubs listed in my background.",
        ],
        [
          "EVERYDAY LIFE",
          "Keep exploring",
          "History, visual arts, politics, cooking, computer science and robotics. Get in touch: liamhellman@gmail.com.",
        ],
      ],
    ],
  },
];
// The illustrated city is a local asset. Animated details have explicit safe
// regions and never travel through the architecture.
const pepperPlaces = [
  { x: 735, y: 805 },
  { x: 270, y: 315 },
  { x: 1130, y: 435 },
  { x: 450, y: 855 },
  { x: 1190, y: 870 },
  { x: 410, y: 91 },
];
function draw() {
  document.body.classList.toggle("motion-paused", paused);
}
draw();
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
function render() {
  document.documentElement.lang = lang;
  document.title =
    lang === "fr"
      ? "Liam Hellman · Un parcours montréalais"
      : "Liam Hellman · A Montréal journey";
  document
    .querySelectorAll("[data-t]")
    .forEach((el) => (el.innerHTML = copy[lang][el.dataset.t]));
  $("#city").alt =
    lang === "fr"
      ? "Montréal miniature en automne : mont Royal, Université de Montréal, triplex, centre-ville et Vieux-Port."
      : "Miniature autumn Montréal: Mount Royal, Université de Montréal, triplexes, downtown and the Old Port.";
  $("#language").textContent = lang === "fr" ? "EN" : "FR";
  $("#language").ariaLabel =
    lang === "fr" ? "Switch to English" : "Passer au français";
  $("#close").ariaLabel = lang === "fr" ? "Fermer" : "Close";
  $("#zoom-in").ariaLabel = lang === "fr" ? "Zoom avant" : "Zoom in";
  $("#zoom-out").ariaLabel = lang === "fr" ? "Zoom arrière" : "Zoom out";
  $("#motion").ariaLabel =
    lang === "fr" ? "Activer ou arrêter les animations" : "Toggle animations";
  $("#motion").ariaPressed = String(paused);
  $("#motion").textContent = paused ? "▶" : "Ⅱ";
  $("#viewport").ariaLabel =
    lang === "fr"
      ? "Carte : glisser pour déplacer, boutons pour zoomer, flèches du clavier pour déplacer"
      : "Map: drag to pan, use buttons to zoom, arrow keys to pan";
  $("#stops").innerHTML = stops
    .map(
      (s, i) =>
        `<button class="stop ${visited.has(i) ? "visited" : ""} ${visited.has(i) && i === current ? "selected" : ""}" data-stop="${i}" style="left:${s.x}px;top:${s.y}px" aria-label="${i + 1}. ${escape(s[lang][0])} — ${escape(s[lang][1])}"><b>${String(i + 1).padStart(2, "0")}</b><span>${escape(s[lang][0])}</span></button>`,
    )
    .join("");
  $("#route-stops").innerHTML = stops
    .map(
      (s, i) =>
        `<button data-stop="${i}" class="${visited.has(i) ? "visited" : ""}"><b>${String(i + 1).padStart(2, "0")}</b>${escape(s[lang][0])}</button>`,
    )
    .join("");
  $("#progress").textContent = `${visited.size} / 6`;
  if ($("#story").open) renderStory();
  positionPins();
}
function renderStory() {
  const s = stops[current][lang];
  $("#story-meta").textContent =
    `${String(current + 1).padStart(2, "0")} · ${s[1]}`;
  $("#story-content").innerHTML =
    `<h2 id="story-title">${escape(s[2])}</h2><p class="lead">${escape(s[3])}</p><p>${s[4].map((t) => `<span class="tag">${escape(t)}</span>`).join("")}</p>${s[5].map((d, i) => `<details ${i === 0 ? "open" : ""}><summary><small>${escape(d[0])}</small>${escape(d[1])}</summary><p>${escape(d[2])}</p></details>`).join("")}<a class="story-contact" href="mailto:liamhellman@gmail.com">${copy[lang].contact}</a>`;
  $("#story-count").textContent = `${current + 1} / 6`;
  $("#previous").disabled = current === 0;
  $("#next").textContent = copy[lang][current === 5 ? "finish" : "next"];
  $("#story-content").scrollTop = 0;
}
let returnFocus = null;
function openStop(i) {
  if (!$("#story").open) returnFocus = document.activeElement;
  current = i;
  visited.add(i);
  $("#pepper").style.left = `${pepperPlaces[i].x}px`;
  $("#pepper").style.top = `${pepperPlaces[i].y}px`;
  focusStop(i);
  render();
  renderStory();
  if (!$("#story").open) $("#story").showModal();
  $("#announce").textContent = stops[i][lang][0];
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-stop]");
  if (b) openStop(Number(b.dataset.stop));
});
$("#language").onclick = () => {
  lang = lang === "fr" ? "en" : "fr";
  render();
};
$("#tour").onclick = () => openStop(0);
$("#close").onclick = () => $("#story").close();
$("#previous").onclick = () => {
  if (current > 0) openStop(current - 1);
};
$("#next").onclick = () =>
  current === 5 ? $("#story").close() : openStop(current + 1);
$("#story").addEventListener("click", (e) => {
  if (e.target === $("#story")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
$("#motion").onclick = () => {
  paused = !paused;
  $("#pepper").style.transition = paused ? "none" : "";
  render();
  draw();
};
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (e) => {
    paused = e.matches;
    render();
    draw();
  },
);
// Shared transform supports mouse, keyboard, touch pan and two-finger pinch.
const viewport = $("#viewport"),
  world = $("#world");
let scale = 1,
  tx = 0,
  ty = 0;
const pointers = new Map();
let drag = null,
  pinched = false;
function positionPins() {
  if (typeof scale === "undefined") return;
  document.querySelectorAll("#stops .stop").forEach((el, i) => {
    el.style.left = `${tx + stops[i].x * scale}px`;
    el.style.top = `${ty + stops[i].y * scale}px`;
  });
}
function apply() {
  const w = viewport.clientWidth,
    h = viewport.clientHeight;
  tx =
    1600 * scale <= w
      ? (w - 1600 * scale) / 2
      : Math.min(0, Math.max(w - 1600 * scale, tx));
  ty =
    1040 * scale <= h
      ? (h - 1040 * scale) / 2
      : Math.min(0, Math.max(h - 1040 * scale, ty));
  world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  positionPins();
}
function focusStop(i) {
  const point = stops[i];
  scale = Math.max(scale, viewport.clientWidth > 700 ? 1.25 : 0.7);
  // Keep the landmark visible to the left of the desktop story drawer.
  const available =
    viewport.clientWidth > 700
      ? viewport.clientWidth * 0.34
      : viewport.clientWidth * 0.5;
  tx = available - point.x * scale;
  ty = viewport.clientHeight * 0.55 - point.y * scale;
  apply();
}
function reset() {
  scale =
    viewport.clientWidth < 650
      ? Math.max(viewport.clientWidth / 1600, viewport.clientHeight / 1040)
      : Math.min(viewport.clientWidth / 1600, viewport.clientHeight / 1040);
  tx = (viewport.clientWidth - 1600 * scale) / 2;
  ty = (viewport.clientHeight - 1040 * scale) / 2;
  apply();
}
function zoom(f, x = viewport.clientWidth / 2, y = viewport.clientHeight / 2) {
  const next = Math.max(0.4, Math.min(2, scale * f));
  tx = x - ((x - tx) * next) / scale;
  ty = y - ((y - ty) * next) / scale;
  scale = next;
  apply();
}
viewport.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) return;
  viewport.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  drag = { x: e.clientX, y: e.clientY };
  pinched = pointers.size > 1;
  viewport.classList.add("dragging");
});
viewport.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const old = [...pointers.values()];
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const now = [...pointers.values()];
  if (now.length === 2) {
    const d = (a) => Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
    const r = viewport.getBoundingClientRect();
    if (d(old) > 0)
      zoom(
        d(now) / d(old),
        (now[0].x + now[1].x) / 2 - r.left,
        (now[0].y + now[1].y) / 2 - r.top,
      );
    pinched = true;
  } else if (drag && !pinched) {
    tx += e.clientX - drag.x;
    ty += e.clientY - drag.y;
    apply();
  }
  drag = { x: e.clientX, y: e.clientY };
});
function end(e) {
  pointers.delete(e.pointerId);
  if (!pointers.size) {
    drag = null;
    pinched = false;
    viewport.classList.remove("dragging");
  }
}
viewport.addEventListener("pointerup", end);
viewport.addEventListener("pointercancel", end);
viewport.addEventListener("keydown", (e) => {
  if (e.target !== viewport) return;
  const delta = {
    ArrowLeft: [45, 0],
    ArrowRight: [-45, 0],
    ArrowUp: [0, 45],
    ArrowDown: [0, -45],
  }[e.key];
  if (delta) {
    e.preventDefault();
    tx += delta[0];
    ty += delta[1];
    apply();
  }
});
$("#zoom-in").onclick = () => zoom(1.2);
$("#zoom-out").onclick = () => zoom(1 / 1.2);
$("#reset").onclick = reset;
new ResizeObserver(reset).observe(viewport);
render();
reset();
$("#pepper").style.left = `${pepperPlaces[0].x}px`;
$("#pepper").style.top = `${pepperPlaces[0].y}px`;

$("#story").addEventListener("close", () => {
  const target = returnFocus?.dataset?.stop;
  if (target !== undefined)
    document.querySelector(`[data-stop="${target}"]`)?.focus();
  else returnFocus?.focus();
});
