'use strict';

// Everything is local: no analytics, APIs, cookies, or third-party scripts.
const $ = (selector) => document.querySelector(selector);
const svgNS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = 'en';
let selected = 0;
let paused = reducedMotion.matches;
let tourActive = false;
let tourTimer = null;
const visited = new Set();

const translations = {
  en: { skip:'Skip to stations', brandSub:'A personal network', resume:'Résumé ↗', contact:'Say hello ↗', location:'MONTRÉAL, QUÉBEC', headline:'People.<br>Work.<br><em>Possibilities.</em>', intro:'I’m Liam. An industrial relations student with a computer science background and a curiosity for what makes people and workplaces thrive.', tour:'Take the scenic route', endTour:'End the tour', introHint:'Or pick a station. Every stop has a story.', ticket:'ONE CURIOUS MIND', ticketSub:'People + technology', mapCaption:'A LITTLE CITY. A FEW BIG IDEAS.', pause:'Pause motion', play:'Resume motion', night:'Night', day:'Day', linePeople:'People & work', lineTech:'Technology', lineLife:'Everyday life', mapHint:'Click a stop to explore ↗', stationsHeading:'YOUR NEXT STOP', visited:' / 6 explored', footer:'Built with curiosity. Rooted in Montréal.', previous:'← Previous stop', next:'Next stop →', close:'Close story', tourNext:'Continue the tour →' },
  fr: { skip:'Aller aux stations', brandSub:'Un réseau personnel', resume:'CV ↗', contact:'Dire bonjour ↗', location:'MONTRÉAL, QUÉBEC', headline:'Humain.<br>Travail.<br><em>Possibilités.</em>', intro:'Moi, c’est Liam. Étudiant en relations industrielles avec un parcours en informatique, je m’intéresse à ce qui permet aux personnes et aux milieux de travail de s’épanouir.', tour:'Prendre la route panoramique', endTour:'Terminer la visite', introHint:'Ou choisissez une station. Chaque arrêt a son histoire.', ticket:'UN ESPRIT CURIEUX', ticketSub:'Humain + technologie', mapCaption:'UNE PETITE VILLE. DE GRANDES IDÉES.', pause:'Arrêter l’animation', play:'Reprendre l’animation', night:'Nuit', day:'Jour', linePeople:'Humain et travail', lineTech:'Technologie', lineLife:'Au quotidien', mapHint:'Explorez une station ↗', stationsHeading:'VOTRE PROCHAIN ARRÊT', visited:' / 6 explorées', footer:'Créé avec curiosité. Ancré à Montréal.', previous:'← Station précédente', next:'Station suivante →', close:'Fermer', tourNext:'Continuer la visite →' }
};
const stops = [
  {x:160,y:480,en:{name:'Start here',sub:'A little introduction',title:'A curiosity for people.',lead:'Hi, I’m Liam Hellman. I’m studying industrial relations at Université de Montréal, alongside a minor in computer science.',cards:[['THE COMMON THREAD','People, work, and how things fit together','My experience spans a corporate technology team, a busy bar, and live events. Those settings have made me curious about how people collaborate, adapt, and find their place at work.'],['MY DIRECTION','Exploring industrial relations','I’m building a foundation in the relationships between workers, employers, and organizations. My technical background adds another perspective on the systems people use every day.']],chips:['Montréal','English & French','Industrial relations','Computer science']},fr:{name:'Départ',sub:'Quelques mots sur moi',title:'La curiosité de l’humain.',lead:'Bonjour, je suis Liam Hellman. J’étudie en relations industrielles à l’Université de Montréal, avec une mineure en informatique.',cards:[['LE FIL CONDUCTEUR','L’humain, le travail et leurs liens','Mon parcours passe par une équipe informatique en entreprise, un bar animé et des événements. Ces milieux ont éveillé ma curiosité pour la collaboration, l’adaptation et la place de chacun au travail.'],['MA DIRECTION','Explorer les relations industrielles','Je développe mes connaissances des rapports entre les travailleurs, les employeurs et les organisations. Mon bagage technique apporte un autre regard sur les systèmes utilisés au quotidien.']],chips:['Montréal','Français et anglais','Relations industrielles','Informatique']}},
  {x:410,y:335,en:{name:'People & work',sub:'What draws me in',title:'The human side of work.',lead:'Industrial relations brings together questions I want to explore: how we work, how we organize, and how we navigate different interests.',cards:[['AREA OF INTEREST','Labour & employee relations','I’m interested in dialogue between workers and employers, collective representation, and the ways organizations handle competing needs.'],['AREA OF INTEREST','Recruitment & people experience','I want to understand how organizations connect with candidates and how the experience of work develops from that first conversation onward.'],['AREA OF INTEREST','Organizations & technology','With a background in computer science, I’m curious about how digital tools can support HR work and how technological change affects people.']],chips:['Labour relations','Talent acquisition','Organizational development','HR technology']},fr:{name:'Humain et travail',sub:'Ce qui m’intéresse',title:'Le côté humain du travail.',lead:'Les relations industrielles réunissent les questions que je souhaite explorer : comment travailler ensemble, s’organiser et composer avec des intérêts différents.',cards:[['CHAMP D’INTÉRÊT','Relations du travail','Je m’intéresse au dialogue entre les travailleurs et les employeurs, à la représentation collective et à la façon de concilier des besoins différents.'],['CHAMP D’INTÉRÊT','Recrutement et expérience employé','Je veux comprendre comment les organisations entrent en contact avec les candidats et comment l’expérience du travail se construit à partir de ce premier échange.'],['CHAMP D’INTÉRÊT','Organisations et technologie','Avec mon parcours en informatique, je m’intéresse aux outils numériques en RH et aux effets des changements technologiques sur les personnes.']],chips:['Relations du travail','Acquisition de talents','Développement organisationnel','Technologie RH']}},
  {x:700,y:460,en:{name:'Experience',sub:'Different worlds of work',title:'Learning on the ground.',lead:'Different environments. Different responsibilities. A consistent opportunity to work with people and solve practical problems.',cards:[['AUG 2024 — PRESENT · BAR ROSEMONT','Bartender','Providing customer service, managing the bar, and creating new recipes. A hands-on environment where communication and coordination matter every shift.'],['MAY 2022 — APR 2023 · CROIX BLEUE CANASSURANCE','DevOps intern','Worked in an Agile team, maintained and updated DNS servers, and used Microsoft Azure, infrastructure as code, and programming tools.'],['JUN — SEP 2021 · XP-MTL','Event technician','Provided customer service, handled artist scheduling and management, and assisted with event coordination.']],chips:['Customer service','Teamwork','Coordination','Adaptability']},fr:{name:'Expérience',sub:'Différents milieux de travail',title:'Apprendre sur le terrain.',lead:'Des environnements variés, des responsabilités différentes et des occasions de travailler avec les gens et de résoudre des problèmes concrets.',cards:[['AOÛT 2024 — PRÉSENT · BAR ROSEMONT','Barman','Service à la clientèle, gestion du bar et création de nouvelles recettes. Un milieu concret où la communication et la coordination comptent à chaque quart.'],['MAI 2022 — AVRIL 2023 · CROIX BLEUE CANASSURANCE','Stagiaire DevOps','Travail au sein d’une équipe Agile, maintenance et mise à jour de serveurs DNS, utilisation de Microsoft Azure, de l’infrastructure en tant que code et d’outils de programmation.'],['JUIN — SEPTEMBRE 2021 · XP-MTL','Technicien événementiel','Service à la clientèle, gestion des horaires des artistes et soutien à la coordination d’événements.']],chips:['Service à la clientèle','Travail d’équipe','Coordination','Adaptabilité']}},
  {x:840,y:220,en:{name:'Learning',sub:'Building a foundation',title:'Two fields. One perspective.',lead:'My studies combine an interest in people and organizations with a practical understanding of technology.',cards:[['2024 — ONGOING · UNIVERSITÉ DE MONTRÉAL','Industrial relations + computer science','Working toward a bachelor’s degree with a major in industrial relations and a minor in computer science.'],['2021 — 2024 · COLLÈGE DE MAISONNEUVE','Administration & mathematics','A DEC that laid a foundation in administration and quantitative thinking.'],['2016 — 2021 · ACADÉMIE DE ROBERVAL','Robotics & English literature','An early combination of technical exploration and an interest in language and ideas.']],chips:['Université de Montréal','Administration','Quantitative thinking','Continuous learning']},fr:{name:'Formation',sub:'Construire mes bases',title:'Deux domaines. Un regard.',lead:'Mon parcours allie un intérêt pour les personnes et les organisations à une compréhension pratique de la technologie.',cards:[['2024 — EN COURS · UNIVERSITÉ DE MONTRÉAL','Relations industrielles et informatique','Baccalauréat en cours avec une majeure en relations industrielles et une mineure en informatique.'],['2021 — 2024 · COLLÈGE DE MAISONNEUVE','Administration et mathématiques','Un DEC qui m’a apporté des bases en administration et en raisonnement quantitatif.'],['2016 — 2021 · ACADÉMIE DE ROBERVAL','Robotique et littérature anglaise','Une première combinaison d’exploration technique et d’intérêt pour la langue et les idées.']],chips:['Université de Montréal','Administration','Analyse quantitative','Apprentissage continu']}},
  {x:585,y:130,en:{name:'Projects',sub:'An instinct to build',title:'Ideas, made tangible.',lead:'My technical projects are a place to experiment. They complement my industrial relations studies and show how I turn curiosity into something concrete.',cards:[['JAN 2025 · REACT / JAVASCRIPT / OPENAI','Factify.Tech','Built a web app and Chrome extension using LLMs to analyze language-based biases and claims. The extension lets users select text or videos for analysis. AI-generated assessments are an exploratory tool, rather than a guarantee of accuracy.'],['FEB 2025 · PYTHON / OPENCV / DLIB','Roast-Me','Developed a playful computer vision web app that generates roasts or compliments from detected facial proportions, with AI voice-over. Used OpenCV and Dlib for facial tracking.'],['TECHNICAL TOOLKIT','A second set of tools','Experience with Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform, and Microsoft Azure.']],chips:['Prototyping','Web applications','AI experimentation','Cloud tools']},fr:{name:'Projets',sub:'L’envie de créer',title:'Des idées concrétisées.',lead:'Mes projets techniques sont un terrain d’expérimentation. Ils complètent mes études en relations industrielles et montrent comment je transforme ma curiosité en réalisations.',cards:[['JANVIER 2025 · REACT / JAVASCRIPT / OPENAI','Factify.Tech','Création d’une application web et d’une extension Chrome utilisant des LLM pour analyser des biais linguistiques et des affirmations. L’extension permet de sélectionner du texte ou des vidéos. Les analyses par IA restent exploratoires et ne garantissent pas l’exactitude.'],['FÉVRIER 2025 · PYTHON / OPENCV / DLIB','Roast-Me','Développement d’une application ludique de vision par ordinateur qui génère des critiques humoristiques ou des compliments à partir de proportions faciales détectées, avec narration par IA. Suivi facial avec OpenCV et Dlib.'],['OUTILS TECHNIQUES','Une autre boîte à outils','Expérience avec Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform et Microsoft Azure.']],chips:['Prototypage','Applications web','Expérimentation IA','Outils infonuagiques']}},
  {x:265,y:150,en:{name:'Off the clock',sub:'Beyond the résumé',title:'Room for everything else.',lead:'Outside work and university, I like having more than one thing to be curious about.',cards:[['MOVE','Team sports & martial arts','Basketball, hockey, soccer, and martial arts are among my interests. I also participate in intramural basketball.'],['EXPLORE','Art, history, politics & cooking','I enjoy both big ideas and hands-on creativity, including experimenting in the kitchen.'],['CONNECT','Community & languages','My clubs include UdeM AI and MealCare. I’m fluent in English and French, and learning Spanish and Japanese.']],chips:['Basketball','Cooking','Art & history','MealCare','Languages']},fr:{name:'Après le travail',sub:'Au-delà du CV',title:'Une place pour le reste.',lead:'En dehors du travail et de l’université, j’aime garder plusieurs sources de curiosité.',cards:[['BOUGER','Sports d’équipe et arts martiaux','Basketball, hockey, soccer et arts martiaux font partie de mes intérêts. Je participe aussi au basketball intra-muros.'],['EXPLORER','Art, histoire, politique et cuisine','J’aime autant les grandes idées que la création concrète, notamment l’expérimentation en cuisine.'],['ÉCHANGER','Communauté et langues','Mes clubs comprennent UdeM AI et MealCare. Je parle français et anglais et j’apprends l’espagnol et le japonais.']],chips:['Basketball','Cuisine','Art et histoire','MealCare','Langues']}}
];

function escapeText(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function windows(width, floors, color) {
  let result='';
  for(let row=0;row<floors;row++) for(let col=0;col<Math.floor(width/23);col++) {
    const x=10+col*23, y=12+row*28;
    result+=`<rect x="${x}" y="${y}" width="13" height="18" rx="1" fill="${color}"/><rect class="window" x="${x+2}" y="${y+2}" width="9" height="13"/><path d="M${x} ${y+19}h14" stroke="#795d4b" stroke-width="2"/>`;
  }
  return result;
}
function building(x,y,width,height,color,roof,name,floors=2) {
  return `<g transform="translate(${x} ${y})" filter="url(#shadow)"><path d="M0 0l23-16h${width}l-23 16Z" fill="${roof}"/><path d="M${width} 0l23-16v${height}l-23 16Z" fill="#9b9983"/><rect width="${width}" height="${height}" fill="${color}"/><path d="M0 6h${width}M0 ${height-5}h${width}" stroke="#fff6e0" opacity=".35" stroke-width="3"/>${windows(width,floors,'#bda48a')}<rect x="${width-28}" y="${height-27}" width="18" height="27" fill="#40564b"/><rect x="${width-25}" y="${height-24}" width="12" height="15" class="window"/><rect x="7" y="${height-27}" width="${Math.max(28,width-40)}" height="12" rx="1" fill="#445f50"/><text x="12" y="${height-18}" class="building-name">${name}</text></g>`;
}
function tree(x,y,scale=1) {return `<use href="#tree" x="${x}" y="${y}" width="${45*scale}" height="${65*scale}"/>`;}
function person(x,y,color='#c8664d',scale=1) {return `<use href="#person" x="${x}" y="${y}" width="${18*scale}" height="${34*scale}" color="${color}"/>`;}
function pixelPerson(x,y,color='#c8664d',scale=1,frame='a') {return `<use href="#pixel-person-${frame}" x="${x}" y="${y}" width="${18*scale}" height="${34*scale}" color="${color}"/>`;}
function scene(index,markup) {return `<g class="scene-hotspot" role="button" tabindex="0" data-stop="${index}" aria-label="${escapeText(stops[index][language].name)}">${markup}</g>`;}

function drawScenery() {
  $('#scenery').innerHTML =
    scene(5,`<ellipse class="scene-ground" cx="201" cy="116" rx="113" ry="53" fill="#d4dfc5"/>${tree(83,42,1.1)}${tree(310,40)}${tree(115,14,.7)}<g transform="translate(170 77) rotate(-12)"><rect width="116" height="64" rx="5" fill="#c7ac8a" stroke="#e9e1ca" stroke-width="2"/><path d="M58 0v64M0 32h116M0 16h12v32H0m116-32h-12v32h12" stroke="#f8f0df" fill="none"/><circle cx="58" cy="32" r="12" fill="none" stroke="#f8f0df"/><circle cx="8" cy="32" r="3" fill="none" stroke="#ae654b"/><path d="M5 24v-13h14" stroke="#657365" stroke-width="2" fill="none"/><rect class="ball pixel-ball" x="46" y="31" width="8" height="8" fill="#bc6c43"/>${person(40,17,'#608bab',.7)}${person(70,35,'#c8664d',.7)}</g><path d="M127 135h28m-25-4v12m23-12v12" stroke="#8e775e" stroke-width="4"/>${person(115,121,'#c8664d',.8)}`)+
    scene(4,`<ellipse class="scene-ground" cx="568" cy="73" rx="83" ry="36" fill="#e3dfce"/>${building(490,10,83,65,'#b8c4b2','#d4dbc6','ATELIER',1)}<g transform="translate(600 34)"><rect width="30" height="43" rx="3" fill="#526657"/><rect x="4" y="5" width="22" height="26" fill="#a8c5b7"/><path d="M8 13l5 5-5 5m9 0h6" stroke="#46645b" fill="none" stroke-width="2"/><circle cx="7" cy="37" r="2" fill="#e1c985"/></g>${tree(638,9,.8)}${person(580,65,'#608bab',.8)}`)+
    scene(3,`<ellipse class="scene-ground" cx="873" cy="170" rx="110" ry="42" fill="#dedfce"/>${building(774,83,132,88,'#d5c4a3','#e7dfc7','UNIVERSITÉ',2)}<g transform="translate(814 55)"><path d="M0 25l33-23 33 23Z" fill="#b6ab91"/><rect x="18" y="11" width="30" height="40" fill="#e5d8b9"/><circle cx="33" cy="26" r="10" fill="#f5f0dc" stroke="#a59d88"/><path d="M33 19v8l6 3" stroke="#526657" fill="none" stroke-width="1.5"/></g>${tree(947,109)}${person(839,179,'#608bab',.8)}${person(866,180,'#c8664d',.8)}<path d="M793 178h105m-101 5h95" stroke="#b5b9a6" stroke-width="3"/>`)+
    scene(1,`<ellipse class="scene-ground" cx="378" cy="280" rx="110" ry="36" fill="#dfe0d0"/>${building(287,192,117,85,'#cb9273','#e4c5a6','COLLECTIF',2)}<g transform="translate(314 241)"><rect width="58" height="27" fill="#bdd2c2"/><ellipse cx="29" cy="18" rx="18" ry="7" fill="#f1e0bf"/><circle cx="13" cy="8" r="3" fill="#956a4d"/><circle cx="43" cy="8" r="3" fill="#bd9870"/><circle cx="30" cy="23" r="3" fill="#725a45"/><path d="M13 12v7m30-7v7m-13 7v-6" stroke="#567867" stroke-width="4"/></g><g transform="translate(409 213)"><path d="M0 0h30v59H0Z" fill="#e6d8bb"/><path d="M-4-3h38v7H-4Z" fill="#6b8070"/><rect x="7" y="12" width="16" height="22" class="window"/></g>${tree(442,225,.9)}${person(334,280,'#608bab',.8)}`)+
    scene(2,`<ellipse class="scene-ground" cx="701" cy="369" rx="161" ry="53" fill="#e0decd"/>${building(557,272,84,94,'#c8896d','#ddbea0','CAFÉ',2)}<g transform="translate(559 337)"><path d="M0 0h78l8 13H-8Z" fill="#eee2c3"/><path d="M4 0l-3 13m18-13v13m17-13 2 13m17-13 4 13m13-13 6 13" stroke="#bd604b" stroke-width="8"/></g><path d="M661 367h35m-31-5v17m28-17v17" stroke="#918568" stroke-width="3"/><ellipse cx="671" cy="397" rx="12" ry="6" fill="#94775c"/><path d="M671 397v13" stroke="#79674f" stroke-width="3"/>${person(647,387,'#608bab',.7)}${person(682,389,'#c8664d',.7)}<g class="smoke pixel-smoke" aria-hidden="true"><rect x="600" y="252" width="5" height="5"/><rect x="606" y="240" width="4" height="4"/><rect x="599" y="228" width="5" height="5"/></g>${building(732,244,76,121,'#b5bcb1','#d3d7c7','BUREAU',3)}<path d="M800 267h26v70h-26m0-45h26m-26 22h26m-5-45v66" fill="none" stroke="#64756a" stroke-width="2"/>${tree(839,345,.8)}${tree(529,353,.7)}`)+
    scene(0,`<ellipse class="scene-ground" cx="204" cy="430" rx="77" ry="32" fill="#e1dfce"/><g transform="translate(172 378)"><path d="M0 0l20-13h62L62 0Z" fill="#d3cbb5"/><path d="M62 0l20-13v55L62 54Z" fill="#a3ad98"/><rect width="62" height="54" fill="#d8cfb8"/><path d="M12 54V20h38v34" fill="#375b4d"/><path d="M17 54V24h28v30" fill="#819b83"/><path d="M-8 12h78v9H-8Z" fill="#c8664d"/><text x="7" y="8" class="small-sign">BONJOUR</text><path d="M17 43h27m-27 5h27" stroke="#c2cbb2" stroke-width="2"/></g><g transform="translate(143 392)"><path d="M0 0v49" stroke="#486556" stroke-width="3"/><rect x="-11" y="-11" width="22" height="22" rx="4" fill="#486556"/><path d="M-6 4V-5l6 6 6-6v9" stroke="#fff4dc" fill="none" stroke-width="2"/></g>${tree(96,383,.8)}${person(227,435,'#c8664d',.9)}`)+
    `${tree(394,449,.8)}${tree(907,378)}${tree(965,418,.8)}${tree(97,260)}${tree(72,290,.8)}${tree(483,527,.8)}${tree(605,529,.6)}${tree(673,195,.7)}<g transform="translate(422 571)"><path d="M0 0h203l30 16H-30Z" fill="#d4d3c0"/><path d="M0-6h203M3-6v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18" stroke="#9daa96" stroke-width="2"/></g><g transform="translate(921 567)"><path d="M0 10h50l-9 12H12Z" fill="#bf7758"/><path d="M25 10v-36l-24 33h24" fill="#f8f4e4" stroke="#839b8a" stroke-width="1"/></g>`;
}

function renderStations() {
  $('#stations').innerHTML = stops.map((stop,index)=>{
    const name=escapeText(stop[language].name),width=Math.max(95,name.length*7.4+35);
    const state=`${visited.has(index)?' active':''}${visited.has(index)&&selected===index?' current':''}`;
    return `<g class="station${state}" role="button" tabindex="0" data-stop="${index}" aria-label="${name}" transform="translate(${stop.x} ${stop.y})"><g class="station-pixel-pulse" aria-hidden="true"><rect x="-8" y="-8" width="3" height="3"/><rect x="5" y="-8" width="3" height="3"/><rect x="-8" y="5" width="3" height="3"/><rect x="5" y="5" width="3" height="3"/></g><circle class="station-ring" r="10"/><circle r="3" fill="#c8664d"/><g class="station-copy"><rect class="label-bg" x="17" y="-13" width="${width}" height="27" rx="5"/><circle cx="31" cy="0" r="8" fill="#c8664d"/><text class="station-number" x="31" y="3" text-anchor="middle">${index+1}</text><text class="station-label" x="45" y="5">${name}</text></g></g>`;
  }).join('');
  $('#station-list').innerHTML=stops.map((stop,index)=>`<button class="stop-button${visited.has(index)?' visited':''}${visited.has(index)&&selected===index?' selected':''}" data-stop="${index}" aria-haspopup="dialog"><span class="stop-index">${visited.has(index)?'✓':String(index+1).padStart(2,'0')}</span><span><span class="stop-title">${escapeText(stop[language].name)}</span><span class="stop-sub">${escapeText(stop[language].sub)}</span></span></button>`).join('');
  $('#visited-count').textContent=visited.size;
}

function renderStory() {
  const stop=stops[selected][language];
  $('#story-tag').textContent=`${String(selected+1).padStart(2,'0')} / ${language==='en'?'PERSONAL NETWORK':'RÉSEAU PERSONNEL'}`;
  $('#story-content').innerHTML=`<div class="story-number" aria-hidden="true">${String(selected+1).padStart(2,'0')}</div><h2 class="story-title" id="story-title">${escapeText(stop.title)}</h2><p class="story-lead">${escapeText(stop.lead)}</p><div class="story-chips">${stop.chips.map(chip=>`<span>${escapeText(chip)}</span>`).join('')}</div>${stop.cards.map(([meta,title,body])=>`<article class="story-card"><span class="story-meta">${escapeText(meta)}</span><h3>${escapeText(title)}</h3><p>${escapeText(body)}</p></article>`).join('')}<div class="story-links"><a href="assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf" target="_blank" rel="noopener">${language==='en'?'Read my résumé':'Lire mon CV'} ↗</a><a href="mailto:liamhellman@gmail.com">${language==='en'?'Say hello':'Dire bonjour'} ↗</a><a href="https://www.linkedin.com/in/liam-hellman" target="_blank" rel="noopener">LinkedIn ↗</a></div>`;
  $('#next').textContent=translations[language][tourActive?'tourNext':'next'];
  $('#story').scrollTop=0;
}

function openStop(index) {
  selected=(index+stops.length)%stops.length;
  visited.add(selected);
  renderStations();
  renderStory();
  if(!$('#story').open) $('#story').showModal();
  updateControls();
  $('#announcement').textContent=`${language==='en'?'Arrived at':'Arrivée à'} ${stops[selected][language].name}`;
  $('#close-story').focus({preventScroll:true});
}

function translate() {
  document.documentElement.lang=language;
  document.title=language==='en'?'Liam Hellman — People, work & everything between':'Liam Hellman — L’humain, le travail et leurs liens';
  document.querySelectorAll('[data-i18n]').forEach(element=>{
    const key=element.dataset.i18n;
    if(key==='headline') element.innerHTML=translations[language][key];
    else element.textContent=translations[language][key];
  });
  $('#language').textContent=language==='en'?'FR':'EN';
  $('#language').setAttribute('aria-label',language==='en'?'Passer au français':'Switch to English');
  $('#cv-link').href=`assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf`;
  $('#close-story').setAttribute('aria-label',translations[language].close);
  $('#city-title').textContent=language==='en'?'Liam’s Montréal':'Le Montréal de Liam';
  $('#city-desc').textContent=language==='en'?'An illustrated city with six interactive metro stations, moving trains, and people. Use the station buttons below to explore each story.':'Une ville illustrée avec six stations de métro interactives, des trains et des passants. Utilisez les boutons des stations pour explorer chaque histoire.';
  $('#map-scroll').setAttribute('aria-label',language==='en'?'Interactive city map; scroll horizontally on small screens':'Carte interactive; défilement horizontal sur petit écran');
  $('#station-list').setAttribute('aria-label',language==='en'?'Portfolio stations':'Stations du portfolio');
  $('.header-links').setAttribute('aria-label',language==='en'?'Main navigation':'Navigation principale');
  $('.station-section').setAttribute('aria-label',language==='en'?'Explore the stations':'Explorer les stations');
  drawScenery();renderStations();updateControls();
  if($('#story').open) renderStory();
}

function updateControls() {
  $('#motion').textContent=translations[language][paused?'play':'pause'];
  $('#motion').setAttribute('aria-pressed',String(paused));
  document.body.classList.toggle('motion-paused',paused||document.hidden||$('#story').open);
  const night=document.body.classList.contains('night-mode');
  $('#theme-icon').textContent=night?'☀':'☾';
  $('.theme-label').textContent=translations[language][night?'day':'night'];
  $('#theme').setAttribute('aria-pressed',String(night));
  $('#theme').setAttribute('aria-label',language==='en'?`Switch to ${night?'day':'night'}`:`Passer en mode ${night?'jour':'nuit'}`);
  $('#tour').firstElementChild.textContent=translations[language][tourActive?'endTour':'tour'];
}

const route = $('#main-route');
const routeLength = route.getTotalLength();
// Use the same SVG path for rendering and travel: trains stay on their tracks.
const stationDistances = stops.map(stop=>{
  let best=0,min=Infinity;
  for(let d=0;d<=routeLength;d+=2){const p=route.getPointAtLength(d),distance=Math.hypot(p.x-stop.x,p.y-stop.y);if(distance<min){min=distance;best=d;}}
  return best;
});
function createTrain(pathId,color,speed,offset){
  const group=document.createElementNS(svgNS,'g');
  group.classList.add('pixel-train');
  const cars=[];
  for(let i=0;i<3;i++){
    const car=document.createElementNS(svgNS,'g');
    car.classList.add('pixel-train-car');
    car.innerHTML=`<path class="train-body" d="M-13-6H9v2h4V6H9v1h-22Z" fill="${color}"/><rect class="train-window" x="-9" y="-3" width="5" height="4"/><rect class="train-window" x="-2" y="-3" width="5" height="4"/><rect class="train-window" x="5" y="-3" width="4" height="4"/><rect class="train-glint train-glint-a" x="-8" y="-2" width="2" height="2"/><rect class="train-glint train-glint-b" x="-1" y="-2" width="2" height="2"/><rect class="train-door" x="5" y="2" width="4" height="4"/><rect class="train-light" x="10" y="-1" width="2" height="2"/><rect class="train-wheel" x="-9" y="6" width="4" height="2"/><rect class="train-wheel" x="4" y="6" width="4" height="2"/>`;
    group.append(car);cars.push(car);
  }
  $('#trains').append(group);
  const path=$(`#${pathId}`);
  return {path,group,length:path.getTotalLength(),cars,speed,position:offset,direction:1,color,renderElapsed:0,frame:false};
}
const trains=[createTrain('main-route','#994a36',37,125),createTrain('blue-route','#3c6481',44,540),createTrain('green-route','#456b54',29,210)];
const walkers=[];
const walkingPaths=['M245 436L321 384','M913 194L963 269','M345 292L411 284','M644 401L720 413','M111 170L151 190','M753 558L815 531','M500 101L553 106','M80 525L126 500'];
walkingPaths.forEach((d,index)=>{
  const path=document.createElementNS(svgNS,'path');path.setAttribute('d',d);
  const group=document.createElementNS(svgNS,'g');group.classList.add('pixel-walker');group.innerHTML=pixelPerson(-7,-22,index%2?'#658aaa':'#c87855',.7);$('#walkers').append(group);
  walkers.push({path,group,sprite:group.querySelector('use'),length:path.getTotalLength(),position:index*7,speed:5+index%3,renderElapsed:index*.01,frame:false});
});
let journey=null;
let lastTime=null;
const trainFrameDuration=1/12;
const walkerFrameDuration=1/8;
function positionTrain(train) {
  train.cars.forEach((car,index)=>{
    const d=Math.max(0,Math.min(train.length,train.position-index*29*train.direction));
    const p=train.path.getPointAtLength(d),p2=train.path.getPointAtLength(Math.min(train.length,d+1));
    const p0=train.path.getPointAtLength(Math.max(0,d-1));
    const angle=Math.atan2(p2.y-p0.y,p2.x-p0.x)*180/Math.PI+(train.direction<0?180:0);
    car.setAttribute('transform',`translate(${Math.round(p.x)} ${Math.round(p.y)}) rotate(${Math.round(angle)})`);
  });
  train.frame=!train.frame;
  train.group.classList.toggle('pixel-frame-b',train.frame);
}
function positionWalker(walker,advanceFrame=true) {
  const d=walker.position<walker.length?walker.position:walker.length*2-walker.position;
  const point=walker.path.getPointAtLength(d);
  walker.group.setAttribute('transform',`translate(${Math.round(point.x)} ${Math.round(point.y)})`);
  if(advanceFrame) walker.frame=!walker.frame;
  walker.sprite.setAttribute('href',walker.frame?'#pixel-person-b':'#pixel-person-a');
}
function animate(timestamp) {
  const dt=lastTime===null?0:Math.min((timestamp-lastTime)/1000,.05);lastTime=timestamp;
  if(!paused&&!document.hidden&&!$('#story').open){
    trains.forEach((train,index)=>{
      train.renderElapsed+=dt;
      if(index===0&&journey){
        const diff=journey.target-train.position;
        train.direction=diff>=0?1:-1;
        train.position+=Math.sign(diff)*Math.min(Math.abs(diff),dt*journey.speed);
        if(Math.abs(diff)<2){const destination=journey.index;train.position=journey.target;positionTrain(train);train.renderElapsed=0;journey=null;openStop(destination);}
      } else {
        train.position+=dt*train.speed*train.direction;
        if(train.position>train.length-2){train.position=train.length-2;train.direction=-1;}
        if(train.position<2){train.position=2;train.direction=1;}
      }
      if(train.renderElapsed>=trainFrameDuration){train.renderElapsed%=trainFrameDuration;positionTrain(train);}
    });
    walkers.forEach(walker=>{walker.position=(walker.position+dt*walker.speed)%(walker.length*2);walker.renderElapsed+=dt;if(walker.renderElapsed>=walkerFrameDuration){walker.renderElapsed%=walkerFrameDuration;positionWalker(walker);}});
  }
  requestAnimationFrame(animate);
}
function endTour() {tourActive=false;journey=null;clearTimeout(tourTimer);updateControls();}
function travelTo(index) {
  selected=(index+stops.length)%stops.length;
  if($('#story').open) $('#story').close();
  if(paused){openStop(selected);return;}
  const target=stationDistances[selected],distance=Math.abs(target-trains[0].position);
  journey={index:selected,target,speed:Math.max(150,distance/2.5)};
  const scroll=$('#map-scroll');
  const mapWidth=$('#city').getBoundingClientRect().width;
  scroll.scrollTo({left:Math.max(0,stops[selected].x/1100*mapWidth-scroll.clientWidth/2),behavior:reducedMotion.matches?'instant':'smooth'});
  $('#announcement').textContent=language==='en'?`Travelling to ${stops[selected].en.name}`:`En route vers ${stops[selected].fr.name}`;
}
document.addEventListener('click',event=>{const stop=event.target.closest('[data-stop]');if(stop){endTour();openStop(Number(stop.dataset.stop));}});
$('#city').addEventListener('keydown',event=>{const stop=event.target.closest('[data-stop]');if(stop&&(event.key==='Enter'||event.key===' ')){event.preventDefault();endTour();openStop(Number(stop.dataset.stop));}});
$('#language').addEventListener('click',()=>{language=language==='en'?'fr':'en';translate();});
$('#motion').addEventListener('click',()=>{paused=!paused;if(paused&&journey){const destination=journey.index;journey=null;openStop(destination);}updateControls();});
$('#theme').addEventListener('click',()=>{document.body.classList.toggle('night-mode');updateControls();});
$('#close-story').addEventListener('click',()=>{endTour();$('#story').close();});
$('#story').addEventListener('cancel',()=>endTour());
$('#story').addEventListener('click',event=>{if(event.target===$('#story')){const r=$('#story').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){endTour();$('#story').close();}}});
$('#story').addEventListener('close',()=>{updateControls();if(!journey){const button=$(`#station-list [data-stop="${selected}"]`);button?.focus({preventScroll:true});}});
$('#prev').addEventListener('click',()=>{if(tourActive)travelTo(selected-1);else openStop(selected-1);});
$('#next').addEventListener('click',()=>{if(tourActive&&selected===stops.length-1){endTour();$('#story').close();}else if(tourActive)travelTo(selected+1);else openStop(selected+1);});
$('#tour').addEventListener('click',()=>{if(tourActive){endTour();return;}tourActive=true;updateControls();travelTo(0);});
reducedMotion.addEventListener('change',event=>{paused=event.matches;if(paused&&journey){const destination=journey.index;journey=null;openStop(destination);}updateControls();});
document.addEventListener('visibilitychange',()=>{lastTime=null;updateControls();});
$('#year').textContent=new Date().getFullYear();
translate();
trains.forEach(positionTrain);
walkers.forEach(walker=>positionWalker(walker,false));
requestAnimationFrame(animate);
