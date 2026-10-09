'use strict';

const $ = selector => document.querySelector(selector);
const svgNS = 'http://www.w3.org/2000/svg';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let language = 'en';
let activeStop = 0;
let lastFrame = null;

const copy = {
  en: {
    skip: 'Skip to the map',
    role: 'Industrial relations · Montréal',
    cv: 'Résumé',
    contact: 'Contact',
    eyebrow: 'PERSONAL NETWORK · RÉSEAU PERSONNEL',
    mapTitle: 'People, work, and the routes between them.',
    blueLine: 'Blue',
    orangeLine: 'Orange',
    greenLine: 'Green',
    yellowLine: 'Yellow',
    hint: 'Choose a featured station or landmark.',
    caption: 'A personal diagram inspired by Montréal · Not to scale',
    previous: '← Previous',
    next: 'Next station →',
    close: 'Close',
    mountRoyal: 'MONT ROYAL',
    oldMontreal: 'OLD MONTRÉAL'
  },
  fr: {
    skip: 'Aller à la carte',
    role: 'Relations industrielles · Montréal',
    cv: 'CV',
    contact: 'Contact',
    eyebrow: 'RÉSEAU PERSONNEL · PERSONAL NETWORK',
    mapTitle: 'L’humain, le travail et les parcours qui les relient.',
    blueLine: 'Bleue',
    orangeLine: 'Orange',
    greenLine: 'Verte',
    yellowLine: 'Jaune',
    hint: 'Choisissez une station ou un lieu associé.',
    caption: 'Un parcours personnel inspiré de Montréal · Carte non à l’échelle',
    previous: '← Précédente',
    next: 'Prochaine station →',
    close: 'Fermer',
    mountRoyal: 'MONT ROYAL',
    oldMontreal: 'VIEUX-MONTRÉAL'
  }
};

const stops = [
  {
    id: 'berri', x: 650, y: 430, line: 'green',
    label: {x: 670, y: 374, width: 160, leader: [663, 420, 670, 402]},
    landmark: {en: 'Berri entrance', fr: 'Entrée Berri'},
    en: {
      station: 'Berri–UQAM', story: 'START HERE', title: 'The interchange.',
      lead: 'I’m Liam Hellman, an industrial relations student at Université de Montréal with a computer science background.',
      cards: [
        ['THE COMMON THREAD', 'People, work, and systems', 'My experience spans a corporate technology team, a busy Montréal bar, and live events. Each setting shaped my interest in how people collaborate and adapt at work.'],
        ['MY DIRECTION', 'Industrial relations', 'I’m building a foundation in the relationships between workers, employers, and organizations, with technology as a second way of understanding workplace systems.']
      ],
      chips: ['Montréal', 'English & French', 'Industrial relations', 'Computer science']
    },
    fr: {
      station: 'Berri–UQAM', story: 'POINT DE DÉPART', title: 'La correspondance.',
      lead: 'Moi, c’est Liam Hellman. J’étudie en relations industrielles à l’Université de Montréal avec un parcours en informatique.',
      cards: [
        ['LE FIL CONDUCTEUR', 'L’humain, le travail et les systèmes', 'Mon expérience passe par une équipe informatique, un bar montréalais animé et des événements. Chaque milieu a nourri mon intérêt pour la collaboration et l’adaptation au travail.'],
        ['MA DIRECTION', 'Relations industrielles', 'Je construis une base sur les rapports entre travailleurs, employeurs et organisations, avec la technologie comme second regard sur les systèmes de travail.']
      ],
      chips: ['Montréal', 'Français et anglais', 'Relations industrielles', 'Informatique']
    }
  },
  {
    id: 'udem', x: 260, y: 260, line: 'blue',
    label: {x: 112, y: 282, width: 215, leader: [260, 276, 260, 282]},
    landmark: {en: 'Roger-Gaudry pavilion', fr: 'Pavillon Roger-Gaudry'},
    en: {
      station: 'Université-de-Montréal', story: 'EDUCATION', title: 'Two fields, one perspective.',
      lead: 'My studies connect an interest in people and organizations with a practical understanding of technology.',
      cards: [
        ['2024 — ONGOING', 'Université de Montréal', 'Bachelor’s degree in progress with a major in industrial relations and a minor in computer science.'],
        ['2021 — 2024', 'Collège de Maisonneuve', 'DEC in administration and mathematics, building a base in organizations and quantitative thinking.'],
        ['2016 — 2021', 'Académie de Roberval', 'Robotics and English literature—an early mix of technical exploration, language, and ideas.']
      ],
      chips: ['Industrial relations', 'Computer science', 'Administration', 'Continuous learning']
    },
    fr: {
      station: 'Université-de-Montréal', story: 'FORMATION', title: 'Deux domaines, un regard.',
      lead: 'Mon parcours relie un intérêt pour les personnes et les organisations à une compréhension pratique de la technologie.',
      cards: [
        ['2024 — EN COURS', 'Université de Montréal', 'Baccalauréat en cours avec une majeure en relations industrielles et une mineure en informatique.'],
        ['2021 — 2024', 'Collège de Maisonneuve', 'DEC en administration et mathématiques, avec des bases en organisation et en raisonnement quantitatif.'],
        ['2016 — 2021', 'Académie de Roberval', 'Robotique et littérature anglaise : une première rencontre entre technologie, langue et idées.']
      ],
      chips: ['Relations industrielles', 'Informatique', 'Administration', 'Apprentissage continu']
    }
  },
  {
    id: 'rosemont', x: 580, y: 275, line: 'orange',
    label: {x: 395, y: 277, width: 160, leader: [564, 275, 555, 296]},
    landmark: {en: 'Bar Rosemont', fr: 'Bar Rosemont'},
    en: {
      station: 'Rosemont', story: 'EXPERIENCE', title: 'Learning on the ground.',
      lead: 'Different workplaces gave me different responsibilities and the same opportunity to work with people and solve practical problems.',
      cards: [
        ['2024 — PRESENT · BAR ROSEMONT', 'Bartender', 'Customer service, bar management, and new recipes in a setting where coordination matters every shift.'],
        ['2022 — 2023 · CROIX BLEUE CANASSURANCE', 'DevOps intern', 'Worked in an Agile team with DNS, Microsoft Azure, infrastructure as code, and programming tools.'],
        ['2021 · XP-MTL', 'Event technician', 'Supported customers, artist schedules, artist management, and event coordination.']
      ],
      chips: ['Customer service', 'Coordination', 'Teamwork', 'Adaptability']
    },
    fr: {
      station: 'Rosemont', story: 'EXPÉRIENCE', title: 'Apprendre sur le terrain.',
      lead: 'Des milieux variés m’ont donné des responsabilités différentes et la même occasion de travailler avec les gens et de résoudre des problèmes concrets.',
      cards: [
        ['2024 — PRÉSENT · BAR ROSEMONT', 'Barman', 'Service à la clientèle, gestion du bar et création de recettes dans un milieu où la coordination compte à chaque quart.'],
        ['2022 — 2023 · CROIX BLEUE CANASSURANCE', 'Stagiaire DevOps', 'Travail en équipe Agile avec les DNS, Microsoft Azure, l’infrastructure en tant que code et des outils de programmation.'],
        ['2021 · XP-MTL', 'Technicien événementiel', 'Soutien à la clientèle, aux horaires et à la gestion des artistes ainsi qu’à la coordination des événements.']
      ],
      chips: ['Service à la clientèle', 'Coordination', 'Travail d’équipe', 'Adaptabilité']
    }
  },
  {
    id: 'square', x: 450, y: 565, line: 'orange',
    label: {x: 470, y: 590, width: 210, leader: [466, 575, 470, 605]},
    landmark: {en: 'Guimard entrance', fr: 'Édicule Guimard'},
    en: {
      station: 'Square-Victoria–OACI', story: 'PEOPLE & WORK', title: 'The human side of work.',
      lead: 'Industrial relations brings together the questions I want to explore: how we organize work and navigate different interests.',
      cards: [
        ['AREA OF INTEREST', 'Labour and employee relations', 'Dialogue between workers and employers, collective representation, and the way organizations respond to competing needs.'],
        ['AREA OF INTEREST', 'Recruitment and people experience', 'How organizations connect with candidates and how the experience of work develops from the first conversation onward.'],
        ['AREA OF INTEREST', 'Organizations and technology', 'How digital tools can support HR work and how technological change affects people.']
      ],
      chips: ['Labour relations', 'Talent acquisition', 'Organizations', 'HR technology']
    },
    fr: {
      station: 'Square-Victoria–OACI', story: 'HUMAIN ET TRAVAIL', title: 'Le côté humain du travail.',
      lead: 'Les relations industrielles réunissent les questions que je souhaite explorer : comment organiser le travail et composer avec des intérêts différents.',
      cards: [
        ['CHAMP D’INTÉRÊT', 'Relations du travail', 'Le dialogue entre travailleurs et employeurs, la représentation collective et la réponse des organisations à des besoins différents.'],
        ['CHAMP D’INTÉRÊT', 'Recrutement et expérience employé', 'La relation avec les candidats et la façon dont l’expérience du travail se construit dès le premier échange.'],
        ['CHAMP D’INTÉRÊT', 'Organisations et technologie', 'La contribution des outils numériques aux RH et les effets du changement technologique sur les personnes.']
      ],
      chips: ['Relations du travail', 'Acquisition de talents', 'Organisations', 'Technologie RH']
    }
  },
  {
    id: 'pda', x: 500, y: 500, line: 'green',
    label: {x: 300, y: 453, width: 175, leader: [486, 500, 475, 485]},
    landmark: {en: 'Place des Arts', fr: 'Place des Arts'},
    en: {
      station: 'Place-des-Arts', story: 'PROJECTS', title: 'Ideas made tangible.',
      lead: 'My technical projects are places to experiment and turn curiosity into something people can use.',
      cards: [
        ['2025 · REACT / JAVASCRIPT / OPENAI', 'Factify.Tech', 'A web app and Chrome extension using LLMs to explore language-based bias and claims in selected text or video. AI assessments are exploratory, not a guarantee of accuracy.'],
        ['2025 · PYTHON / OPENCV / DLIB', 'Roast-Me', 'A playful computer vision app that generates roasts or compliments from detected facial proportions, with AI voice-over.'],
        ['TECHNICAL TOOLKIT', 'A second set of tools', 'Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform, and Microsoft Azure.']
      ],
      chips: ['Prototyping', 'Web applications', 'AI experiments', 'Cloud tools']
    },
    fr: {
      station: 'Place-des-Arts', story: 'PROJETS', title: 'Des idées concrétisées.',
      lead: 'Mes projets techniques sont des espaces d’expérimentation où la curiosité devient quelque chose d’utilisable.',
      cards: [
        ['2025 · REACT / JAVASCRIPT / OPENAI', 'Factify.Tech', 'Une application web et une extension Chrome utilisant des LLM pour explorer les biais linguistiques et les affirmations dans du texte ou des vidéos. Les analyses par IA restent exploratoires.'],
        ['2025 · PYTHON / OPENCV / DLIB', 'Roast-Me', 'Une application ludique de vision par ordinateur qui génère des critiques humoristiques ou des compliments, avec narration par IA.'],
        ['OUTILS TECHNIQUES', 'Une deuxième boîte à outils', 'Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform et Microsoft Azure.']
      ],
      chips: ['Prototypage', 'Applications web', 'Expérimentation IA', 'Infonuagique']
    }
  },
  {
    id: 'drapeau', x: 830, y: 570, line: 'yellow',
    label: {x: 650, y: 650, width: 160, leader: [818, 581, 810, 662]},
    landmark: {en: 'Montréal Biosphere', fr: 'Biosphère de Montréal'},
    en: {
      station: 'Jean-Drapeau', story: 'OFF THE CLOCK', title: 'Beyond the résumé.',
      lead: 'Outside work and university, I keep several routes open for curiosity, movement, and community.',
      cards: [
        ['MOVE', 'Team sports and martial arts', 'Basketball, hockey, soccer, martial arts, and intramural basketball.'],
        ['EXPLORE', 'Art, history, politics, and cooking', 'A mix of big ideas and hands-on creativity, including experiments in the kitchen.'],
        ['CONNECT', 'Community and languages', 'UdeM AI and MealCare. Fluent in French and English, and learning Spanish and Japanese.']
      ],
      chips: ['Basketball', 'Cooking', 'Art & history', 'MealCare', 'Languages']
    },
    fr: {
      station: 'Jean-Drapeau', story: 'APRÈS LE TRAVAIL', title: 'Au-delà du CV.',
      lead: 'En dehors du travail et de l’université, je garde plusieurs voies ouvertes vers la curiosité, le mouvement et la communauté.',
      cards: [
        ['BOUGER', 'Sports d’équipe et arts martiaux', 'Basketball, hockey, soccer, arts martiaux et basketball intra-muros.'],
        ['EXPLORER', 'Art, histoire, politique et cuisine', 'Un mélange de grandes idées et de création concrète, notamment dans la cuisine.'],
        ['ÉCHANGER', 'Communauté et langues', 'UdeM AI et MealCare. Français et anglais courants; espagnol et japonais en apprentissage.']
      ],
      chips: ['Basketball', 'Cuisine', 'Art et histoire', 'MealCare', 'Langues']
    }
  }
];

const escapeText = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const current = stop => stop[language];

function renderMinorStations() {
  const dots = [
    [180, 260, 'blue'], [360, 215, 'blue'], [640, 170, 'blue'], [730, 170, 'blue'],
    [548, 215, 'orange'], [595, 308, 'orange'], [625, 374, 'orange'], [628, 455, 'orange'], [570, 505, 'orange'], [500, 544, 'orange'],
    [190, 540, 'green'], [280, 535, 'green'], [360, 530, 'green'], [430, 515, 'green'], [540, 481, 'green'], [720, 430, 'green'], [790, 430, 'green'], [875, 430, 'green'], [960, 430, 'green'],
    [735, 500, 'yellow'], [925, 605, 'yellow'], [1020, 640, 'yellow']
  ];
  const labels = [
    [140, 240, 'Snowdon'], [525, 146, 'Jean-Talon'], [738, 145, 'Saint-Michel'],
    [800, 455, 'Papineau'], [965, 415, 'Frontenac'], [1025, 675, 'Longueuil']
  ];
  const colorClass = line => `core-${line}`;
  const dotsMarkup = dots.map(([x, y, line]) => `<circle class="minor-node" cx="${x}" cy="${y}" r="5"/><circle class="minor-core ${colorClass(line)}" cx="${x}" cy="${y}" r="2.2"/>`).join('');
  const jeanTalon = '<circle class="interchange-ring" cx="520" cy="170" r="12"/><circle class="interchange-core core-blue" cx="520" cy="170" r="6"/><path class="transfer-orange" d="M514 170a6 6 0 0 0 12 0"/>';
  const labelsMarkup = labels.map(([x, y, name]) => `<text class="minor-label" x="${x}" y="${y}">${name}</text>`).join('');
  $('#minor-stations').innerHTML = dotsMarkup + jeanTalon + labelsMarkup;
}

function landmarkMarkup(stop, index) {
  const caption = escapeText(stop.landmark[language].toUpperCase());
  const attributes = `class="landmark line-${stop.line}${index === activeStop && $('#story').open ? ' active' : ''}" data-stop="${index}" role="button" tabindex="0" aria-label="${caption} — ${escapeText(current(stop).station)}"`;
  const templates = {
    udem: `<g ${attributes} transform="translate(130 125)"><rect class="landmark-hit" x="-8" y="-8" width="126" height="108"/><path class="landmark-outline" d="M8 74V31L56 9l51 22v43Z"/><path class="landmark-accent" d="M49 9h15v65H49Z"/><path class="landmark-detail" d="M17 42h24m-24 12h24m32-12h25M73 54h25M17 66h24m32 0h25"/><text class="landmark-caption" x="57" y="92" text-anchor="middle" textLength="108" lengthAdjust="spacingAndGlyphs">${caption}</text></g>`,
    rosemont: `<g ${attributes} transform="translate(770 175)"><rect class="landmark-hit" x="-8" y="-8" width="126" height="108"/><rect class="landmark-outline" x="8" y="20" width="96" height="58"/><path class="landmark-accent" d="M4 38h104v13H4Z"/><path class="landmark-detail" d="M17 27h20v11H17zm29 0h20v11H46zm29 0h20v11H75zM19 57h28v21m18-21h27v21"/><text class="landmark-caption" x="56" y="93" text-anchor="middle">${caption}</text></g>`,
    berri: `<g ${attributes} transform="translate(650 276)"><rect class="landmark-hit" x="-8" y="-8" width="112" height="102"/><rect class="landmark-accent" x="35" y="2" width="30" height="29"/><text class="landmark-m" x="50" y="22" text-anchor="middle">M</text><path class="landmark-outline" d="M9 73h82L75 43H25Z"/><path class="landmark-detail" d="M27 47h46M22 54h56M17 61h66M12 68h76"/><text class="landmark-caption" x="50" y="89" text-anchor="middle">${caption}</text></g>`,
    pda: `<g ${attributes} transform="translate(380 325)"><rect class="landmark-hit" x="-8" y="-8" width="128" height="110"/><rect class="landmark-outline" x="6" y="28" width="105" height="49"/><path class="landmark-accent" d="M17 40h83v14H17Z"/><path class="landmark-detail" d="M17 61h83M29 61v16m19-16v16m20-16v16m20-16v16"/><text class="landmark-caption" x="58" y="93" text-anchor="middle">${caption}</text></g>`,
    square: `<g ${attributes} transform="translate(300 580)"><rect class="landmark-hit" x="-8" y="-8" width="120" height="94"/><path class="landmark-detail" d="M18 65V29Q18 10 35 10M94 65V29Q94 10 77 10M35 10q21 18 42 0M27 34h58"/><circle class="landmark-accent" cx="35" cy="10" r="4"/><circle class="landmark-accent" cx="77" cy="10" r="4"/><path class="landmark-outline" d="M9 65h94v10H9Z"/><text class="landmark-caption" x="56" y="89" text-anchor="middle">${caption}</text></g>`,
    drapeau: `<g ${attributes} transform="translate(945 450)"><rect class="landmark-hit" x="-8" y="-8" width="126" height="112"/><circle class="landmark-outline" cx="57" cy="45" r="39"/><g class="landmark-detail"><ellipse cx="57" cy="45" rx="35" ry="12"/><ellipse cx="57" cy="45" rx="35" ry="25"/><path d="M22 45h70M57 6v78M29 20l56 50M29 70l56-50"/></g><text class="landmark-caption" x="57" y="99" text-anchor="middle">${caption}</text></g>`
  };
  return templates[stop.id];
}

function renderLandmarks() {
  $('#landmarks').innerHTML = stops.map(landmarkMarkup).join('');
}

function renderStations() {
  $('#feature-stations').innerHTML = stops.map((stop, index) => {
    const data = current(stop);
    const {x, y, width, leader} = stop.label;
    const active = index === activeStop && $('#story').open ? ' active' : '';
    return `<g class="feature-stop line-${stop.line}${active}" data-stop="${index}" role="button" tabindex="0" aria-label="${escapeText(data.station)} — ${escapeText(data.story)}">
      <line class="label-leader" x1="${leader[0]}" y1="${leader[1]}" x2="${leader[2]}" y2="${leader[3]}"/>
      <g class="stop-label"><rect class="label-safe" x="${x}" y="${y}" width="${width}" height="40"/><text class="stop-name" x="${x + 8}" y="${y + 16}">${escapeText(data.station)}</text><text class="stop-story" x="${x + 8}" y="${y + 30}">${escapeText(data.story)}</text><line class="label-rule" x1="${x + 8}" y1="${y + 36}" x2="${x + 48}" y2="${y + 36}"/></g>
      <circle class="stop-hit" cx="${stop.x}" cy="${stop.y}" r="30"/><circle class="stop-arrival" cx="${stop.x}" cy="${stop.y}" r="18"/><circle class="stop-outer" cx="${stop.x}" cy="${stop.y}" r="15"/><circle class="stop-inner" cx="${stop.x}" cy="${stop.y}" r="7"/>
    </g>`;
  }).join('');
}

function renderStory() {
  const stop = stops[activeStop];
  const data = current(stop);
  $('#story-line').innerHTML = `<i class="line-dot line-${stop.line}"></i>${escapeText(data.station.toUpperCase())} · ${escapeText(data.story)}`;
  $('#story-content').innerHTML = `<p class="story-number">${String(activeStop + 1).padStart(2, '0')} / 06</p><h2 class="story-title" id="story-title">${escapeText(data.title)}</h2><p class="story-lead">${escapeText(data.lead)}</p><div class="chips">${data.chips.map(chip => `<span>${escapeText(chip)}</span>`).join('')}</div>${data.cards.map(([meta, title, body]) => `<article class="story-card"><small>${escapeText(meta)}</small><h3>${escapeText(title)}</h3><p>${escapeText(body)}</p></article>`).join('')}<div class="story-links"><a href="assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf" target="_blank" rel="noopener">${language === 'en' ? 'RÉSUMÉ' : 'CV'} ↗</a><a href="mailto:liamhellman@gmail.com">CONTACT ↗</a><a href="https://www.linkedin.com/in/liam-hellman" target="_blank" rel="noopener">LINKEDIN ↗</a></div>`;
}

function renderMapTargets() {
  renderLandmarks();
  renderStations();
}

function openStop(index) {
  activeStop = (index + stops.length) % stops.length;
  renderStory();
  if (!$('#story').open) $('#story').showModal();
  renderMapTargets();
  $('#announcement').textContent = `${language === 'en' ? 'Arrived at' : 'Arrivée à'} ${current(stops[activeStop]).station}`;
  $('#close-story').focus({preventScroll: true});
}

function translate() {
  document.documentElement.lang = language;
  document.title = language === 'en' ? 'Liam Hellman — Montréal connections' : 'Liam Hellman — Connexions montréalaises';
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = copy[language][element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-svg]').forEach(element => {
    element.textContent = copy[language][element.dataset.i18nSvg];
  });
  $('#language').textContent = language === 'en' ? 'FR' : 'EN';
  $('#language').setAttribute('aria-label', language === 'en' ? 'Passer au français' : 'Switch to English');
  $('#close-story').setAttribute('aria-label', copy[language].close);
  $('#cv-link').href = `assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf`;
  $('.actions').setAttribute('aria-label', language === 'en' ? 'Main navigation' : 'Navigation principale');
  $('.line-key').setAttribute('aria-label', language === 'en' ? 'Montréal métro lines' : 'Lignes du métro de Montréal');
  $('#map-viewport').setAttribute('aria-label', language === 'en' ? 'Interactive Montréal portfolio map; scroll horizontally on small screens' : 'Carte interactive du portfolio montréalais; défilement horizontal sur petit écran');
  $('#svg-title').textContent = language === 'en' ? 'Liam Hellman’s Montréal network' : 'Le réseau montréalais de Liam Hellman';
  $('#svg-desc').textContent = language === 'en' ? 'A clean retro Montréal métro map with six interactive portfolio stations, real landmarks, moving trains, and purposeful pedestrian routes.' : 'Une carte rétro du métro de Montréal avec six stations interactives, des lieux réels, des trains en mouvement et des parcours piétons liés aux arrivées.';
  renderMapTargets();
  if ($('#story').open) renderStory();
}

function closestDistance(path, x, y) {
  const length = path.getTotalLength();
  let bestDistance = 0;
  let bestGap = Infinity;
  for (let distance = 0; distance <= length; distance += 1.5) {
    const point = path.getPointAtLength(distance);
    const gap = Math.hypot(point.x - x, point.y - y);
    if (gap < bestGap) {
      bestGap = gap;
      bestDistance = distance;
    }
  }
  return bestDistance;
}

const routeSpecs = [
  {line: 'blue', pathId: 'blue-route', speed: 80, delay: 250, points: [[180, 260], ['udem', 260, 260], [360, 215], [520, 170], [640, 170], [730, 170]]},
  {line: 'orange', pathId: 'orange-route', speed: 76, delay: 900, points: [[520, 170], [548, 215], ['rosemont', 580, 275], [610, 340], ['berri', 650, 430], [605, 480], [535, 530], ['square', 450, 565]]},
  {line: 'green', pathId: 'green-route', speed: 82, delay: 1550, reverse: true, points: [[190, 540], [360, 530], ['pda', 500, 500], [575, 465], ['berri', 650, 430], [790, 430], [960, 430]]},
  {line: 'yellow', pathId: 'yellow-route', speed: 78, delay: 2200, points: [['berri', 650, 430], [735, 500], ['drapeau', 830, 570], [1020, 640]]}
];

function createTrain(spec) {
  const path = $(`#${spec.pathId}`);
  const group = document.createElementNS(svgNS, 'g');
  group.classList.add('train');
  group.innerHTML = `<rect class="train-body train-line-${spec.line}" x="-20" y="-7" width="40" height="14" rx="3"/><path class="train-divider" d="M0-6V6"/><rect class="train-window" x="-14" y="-4" width="8" height="5" rx="1"/><rect class="train-window" x="6" y="-4" width="8" height="5" rx="1"/><circle class="train-wheel" cx="-12" cy="7" r="2"/><circle class="train-wheel" cx="12" cy="7" r="2"/>`;
  $('#trains').append(group);
  const points = spec.points.map(point => {
    const hasId = typeof point[0] === 'string';
    const x = hasId ? point[1] : point[0];
    const y = hasId ? point[2] : point[1];
    return {id: hasId ? point[0] : null, distance: closestDistance(path, x, y)};
  });
  const currentIndex = spec.reverse ? points.length - 1 : 0;
  return {
    path, group, points, currentIndex,
    direction: spec.reverse ? -1 : 1,
    targetIndex: null,
    position: points[currentIndex].distance,
    startDistance: points[currentIndex].distance,
    endDistance: points[currentIndex].distance,
    progress: 0,
    duration: 1,
    phase: 'dwell',
    dwellRemaining: spec.delay,
    speed: spec.speed
  };
}

function trainAngle(train) {
  const length = train.path.getTotalLength();
  const before = train.path.getPointAtLength(Math.max(0, train.position - 1));
  const after = train.path.getPointAtLength(Math.min(length, train.position + 1));
  return Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI + (train.direction < 0 ? 180 : 0);
}

function positionTrain(train) {
  const point = train.path.getPointAtLength(train.position);
  train.group.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${trainAngle(train).toFixed(2)})`);
}

function beginTrainSegment(train) {
  if (train.currentIndex === 0) train.direction = 1;
  if (train.currentIndex === train.points.length - 1) train.direction = -1;
  train.targetIndex = train.currentIndex + train.direction;
  train.startDistance = train.points[train.currentIndex].distance;
  train.endDistance = train.points[train.targetIndex].distance;
  train.progress = 0;
  train.duration = Math.max(.75, Math.abs(train.endDistance - train.startDistance) / train.speed);
  train.phase = 'travel';
}

const arrivalTimers = new Map();
function triggerArrival(id) {
  if (!id) return;
  const index = stops.findIndex(stop => stop.id === id);
  document.querySelectorAll(`[data-stop="${index}"]`).forEach(element => element.classList.add('arriving'));
  clearTimeout(arrivalTimers.get(id));
  arrivalTimers.set(id, setTimeout(() => {
    document.querySelectorAll(`[data-stop="${index}"]`).forEach(element => element.classList.remove('arriving'));
  }, 1150));
  startWalker(id);
}

function updateTrain(train, delta) {
  if (train.phase === 'dwell') {
    train.dwellRemaining -= delta * 1000;
    if (train.dwellRemaining <= 0) beginTrainSegment(train);
    return;
  }
  train.progress = Math.min(1, train.progress + delta / train.duration);
  const progress = train.progress < .5 ? 4 * train.progress ** 3 : 1 - ((-2 * train.progress + 2) ** 3) / 2;
  train.position = train.startDistance + (train.endDistance - train.startDistance) * progress;
  positionTrain(train);
  if (train.progress === 1) {
    train.currentIndex = train.targetIndex;
    train.position = train.points[train.currentIndex].distance;
    train.phase = 'dwell';
    train.dwellRemaining = 850;
    triggerArrival(train.points[train.currentIndex].id);
  }
}

function createWalker(stop) {
  const path = $(`#walk-${stop.id}`);
  const group = document.createElementNS(svgNS, 'g');
  group.classList.add('walker', `line-${stop.line}`);
  group.innerHTML = '<use href="#person" x="-8" y="-29" width="16" height="31"/>';
  $('#walkers').append(group);
  const walker = {
    id: stop.id,
    path,
    group,
    length: path.getTotalLength(),
    position: 0,
    direction: 1,
    nextDirection: 1,
    speed: path.getTotalLength() / 2.25,
    active: false
  };
  positionWalker(walker);
  return walker;
}

function positionWalker(walker) {
  const point = walker.path.getPointAtLength(walker.position);
  walker.group.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
}

function startWalker(id) {
  if (prefersReducedMotion.matches || $('#story').open) return;
  const walker = walkers.find(item => item.id === id);
  if (!walker || walker.active || walkers.filter(item => item.active).length >= 2) return;
  walker.direction = walker.nextDirection;
  walker.nextDirection *= -1;
  walker.position = walker.direction > 0 ? 0 : walker.length;
  walker.active = true;
  walker.group.classList.add('active');
  positionWalker(walker);
}

function updateWalker(walker, delta) {
  if (!walker.active) return;
  walker.position += walker.direction * walker.speed * delta;
  if (walker.position >= walker.length || walker.position <= 0) {
    walker.position = Math.max(0, Math.min(walker.length, walker.position));
    positionWalker(walker);
    walker.active = false;
    walker.group.classList.remove('active');
    return;
  }
  positionWalker(walker);
}

function setLinkedStop(index, linked) {
  document.querySelectorAll(`[data-stop="${index}"]`).forEach(element => element.classList.toggle('linked', linked));
  const path = $(`#walk-${stops[index].id}`);
  if (path) path.classList.toggle('linked', linked);
}

renderMinorStations();
renderMapTargets();
translate();

const trains = routeSpecs.map(createTrain);
const walkers = stops.map(createWalker);
trains.forEach(positionTrain);

function animate(time) {
  const delta = lastFrame === null ? 0 : Math.min((time - lastFrame) / 1000, .05);
  lastFrame = time;
  const paused = prefersReducedMotion.matches || document.hidden || $('#story').open;
  if (!paused) {
    trains.forEach(train => updateTrain(train, delta));
    walkers.forEach(walker => updateWalker(walker, delta));
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

document.addEventListener('click', event => {
  const target = event.target.closest('[data-stop]');
  if (target) openStop(Number(target.dataset.stop));
});

$('#metro-map').addEventListener('keydown', event => {
  const target = event.target.closest('[data-stop]');
  if (target && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    openStop(Number(target.dataset.stop));
  }
});

$('#metro-map').addEventListener('pointerover', event => {
  const target = event.target.closest('[data-stop]');
  if (target && !target.contains(event.relatedTarget)) setLinkedStop(Number(target.dataset.stop), true);
});
$('#metro-map').addEventListener('pointerout', event => {
  const target = event.target.closest('[data-stop]');
  if (target && !target.contains(event.relatedTarget)) setLinkedStop(Number(target.dataset.stop), false);
});
$('#metro-map').addEventListener('focusin', event => {
  const target = event.target.closest('[data-stop]');
  if (target) setLinkedStop(Number(target.dataset.stop), true);
});
$('#metro-map').addEventListener('focusout', event => {
  const target = event.target.closest('[data-stop]');
  if (target) setLinkedStop(Number(target.dataset.stop), false);
});

$('#language').addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  translate();
});
$('#close-story').addEventListener('click', () => $('#story').close());
$('#story').addEventListener('close', () => {
  renderMapTargets();
  $(`.feature-stop[data-stop="${activeStop}"]`)?.focus({preventScroll: true});
});
$('#story').addEventListener('click', event => {
  if (event.target === $('#story')) $('#story').close();
});
$('#previous').addEventListener('click', () => openStop(activeStop - 1));
$('#next').addEventListener('click', () => openStop(activeStop + 1));
document.addEventListener('visibilitychange', () => { lastFrame = null; });

window.addEventListener('load', () => {
  if (!window.matchMedia('(max-width: 760px)').matches) return;
  requestAnimationFrame(() => {
    const viewport = $('#map-viewport');
    const point = $('#metro-map').createSVGPoint();
    point.x = 650;
    point.y = 430;
    const screenPoint = point.matrixTransform($('#metro-map').getScreenCTM());
    const viewportRect = viewport.getBoundingClientRect();
    viewport.scrollLeft += screenPoint.x - viewportRect.left - viewport.clientWidth * .52;
  });
}, {once: true});
