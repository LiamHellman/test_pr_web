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
  en: { skip:'Skip to the city map', brandSub:'A personal network', resume:'Résumé ↗', contact:'Say hello ↗', location:'MONTRÉAL, QUÉBEC', headline:'People.<br>Work.<br><em>Possibilities.</em>', intro:'I’m Liam. An industrial relations student with a computer science background and a curiosity for what makes people and workplaces thrive.', tour:'Take the scenic route', endTour:'End the tour', introHint:'Or pick a station. Every stop has a story.', ticket:'ONE CURIOUS MIND', ticketSub:'People + technology', mapCaption:'A LITTLE CITY. A FEW BIG IDEAS.', pause:'Pause motion', play:'Resume motion', linePeople:'People & work', lineTech:'Technology', lineLife:'Everyday life', mapHint:'Click a stop to explore ↗', footer:'Built with curiosity. Rooted in Montréal.', previous:'← Previous stop', next:'Next stop →', close:'Close story', tourNext:'Continue the tour →' },
  fr: { skip:'Aller à la carte', brandSub:'Un réseau personnel', resume:'CV ↗', contact:'Dire bonjour ↗', location:'MONTRÉAL, QUÉBEC', headline:'Humain.<br>Travail.<br><em>Possibilités.</em>', intro:'Moi, c’est Liam. Étudiant en relations industrielles avec un parcours en informatique, je m’intéresse à ce qui permet aux personnes et aux milieux de travail de s’épanouir.', tour:'Prendre la route panoramique', endTour:'Terminer la visite', introHint:'Ou choisissez une station. Chaque arrêt a son histoire.', ticket:'UN ESPRIT CURIEUX', ticketSub:'Humain + technologie', mapCaption:'UNE PETITE VILLE. DE GRANDES IDÉES.', pause:'Arrêter l’animation', play:'Reprendre l’animation', linePeople:'Humain et travail', lineTech:'Technologie', lineLife:'Au quotidien', mapHint:'Explorez une station ↗', footer:'Créé avec curiosité. Ancré à Montréal.', previous:'← Station précédente', next:'Station suivante →', close:'Fermer', tourNext:'Continuer la visite →' }
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
function windows(width,height,floors) {
  if(!floors) return '';
  const columns=Math.max(2,Math.floor(width/24));
  const endX=width-29;
  const columnStep=columns===1?0:(endX-10)/(columns-1);
  const lastRow=Math.max(12,height-50);
  const rowStep=floors===1?0:(lastRow-12)/(floors-1);
  let result='';
  for(let row=0;row<floors;row++) for(let column=0;column<columns;column++) {
    const x=Number((10+column*columnStep).toFixed(1));
    const y=Number((12+row*rowStep).toFixed(1));
    result+=`<g class="building-window"><rect class="window-frame" x="${x}" y="${y}" width="14" height="18" rx="1"/><rect class="window" x="${x+2}" y="${y+2}" width="10" height="13"/><path class="window-mullion" d="M${x+7} ${y+2}v13M${x+2} ${y+8.5}h10"/><path class="window-sill" d="M${x-1} ${y+19}h16"/></g>`;
  }
  return result;
}
function masonry(width,height) {
  let result='';
  for(let y=9,row=0;y<height-6;y+=14,row++) {
    result+=`<path d="M3 ${y}H${width-3}"/>`;
    for(let x=row%2?15:27;x<width-8;x+=28) result+=`<path d="M${x} ${y-4}v4"/>`;
  }
  return result;
}
function buildingDetail(kind,width,height,roof) {
  if(kind==='atelier') return `<g class="rooftop-detail"><path class="solar-panel" d="M13-5l28-9h25l-28 9Z"/><path class="solar-grid" d="M24-9l25-8M34-12v7M48-16v7"/><rect class="roof-vent" x="${width-14}" y="-22" width="7" height="12"/><path class="roof-vent-cap" d="M${width-17}-22h13"/></g><path class="utility-line" d="M${width-7} 21v27m-4-13h8"/>`;
  if(kind==='university') return `<g class="university-detail"><path class="pediment" d="M24 6L${width/2}-17L${width-24} 6Z" fill="${roof}"/><path class="pediment-trim" d="M20 7h${width-40}M31 10v42m23-42v42m24-42v42m23-42v42"/><circle class="clock-face" cx="${width/2}" cy="-1" r="8"/><path class="clock-hands" d="M${width/2}-6v6l4 2"/><path class="building-steps" d="M18 ${height+2}h${width-28}M13 ${height+7}h${width-18}M8 ${height+12}h${width-8}"/></g>`;
  if(kind==='collective') return `<g class="collective-detail"><rect class="roof-planter" x="13" y="-10" width="30" height="8"/><path class="roof-greenery" d="M17-10q4-10 8 0q5-13 10 0q4-8 6 0"/><rect class="notice-board" x="9" y="${height-48}" width="28" height="17"/><path class="notice-paper" d="M13 ${height-44}h8v8h-8Zm11 0h9v4h-9Zm0 7h7"/><path class="entry-canopy" d="M${width-34} ${height-34}h29l5 6h-39Z"/></g>`;
  if(kind==='cafe') return `<g class="cafe-detail"><path class="chimney" d="M49-7v-22h12v22"/><path class="chimney-cap" d="M46-29h18"/><rect class="storefront-frame" x="8" y="${height-39}" width="${width-40}" height="31"/><rect class="window storefront-window" x="11" y="${height-36}" width="${width-46}" height="25"/><path class="storefront-mullion" d="M${(width-19)/2} ${height-36}v25"/><path class="awning" d="M4 ${height-43}h${width-8}l7 11H-3Z"/><path class="awning-stripes" d="M15 ${height-43}l-2 11m17-11v11m16-11l2 11m14-11l5 11"/></g>`;
  if(kind==='office') return `<g class="office-detail"><path class="floor-band" d="M4 37h${width-8}M4 66h${width-8}M4 94h${width-8}"/><g class="fire-escape"><path d="M${width-3} 25h20v72h-20m0-48h20m-20 24h20m-15-48v72m10-72v72M${width+1} 49l12 24m0-24L${width+1} 73"/><path d="M${width-6} 25h26m-26 24h26m-26 24h26"/></g><rect class="address-plaque" x="${width+2}" y="14" width="11" height="8"/><text class="address-number" x="${width+7.5}" y="20" text-anchor="middle">514</text></g>`;
  if(kind==='shop') return `<g class="shop-detail"><rect class="storefront-frame" x="8" y="21" width="${width-36}" height="${height-27}"/><rect class="window storefront-window" x="11" y="24" width="${width-42}" height="${height-33}"/><path class="storefront-mullion" d="M${(width-20)/2} 24v${height-33}"/><path class="awning" d="M3 17h${width-6}l7 10H-4Z"/><path class="awning-stripes" d="M14 17l-2 10m17-10v10m16-10l3 10m13-10l5 10"/><rect class="planter" x="4" y="${height-7}" width="12" height="6"/><path class="planter-leaves" d="M7 ${height-7}q1-10 4 0q4-8 4 0"/></g>`;
  return '';
}
function building(x,y,width,height,color,roof,name,floors=2,kind='standard') {
  const depth=16;
  const signY=kind==='shop'?4:kind==='cafe'?height-55:height-27;
  const signWidth=kind==='shop'?width-16:Math.max(30,width-40);
  return `<g class="building building--${kind}" transform="translate(${x} ${y})" filter="url(#shadow)"><ellipse class="building-shadow" cx="${(width+depth)/2}" cy="${height+5}" rx="${(width+26)/2}" ry="6"/><path class="building-side" d="M${width} 0l${depth}-12v${height}l-${depth} 12Z"/><path class="building-roof" d="M0 0l${depth}-12h${width}l-${depth} 12Z" fill="${roof}"/><rect class="building-front" width="${width}" height="${height}" fill="${color}"/><g class="masonry">${masonry(width,height)}</g>${windows(width,height,floors)}<path class="cornice" d="M1 5h${width-2}M1 ${height-5}h${width-2}"/><path class="downspout" d="M4 8v${height-13}h5"/><g class="building-entry"><rect class="door-frame" x="${width-27}" y="${height-29}" width="20" height="29"/><rect class="window door-glass" x="${width-24}" y="${height-25}" width="14" height="17"/><rect class="door-panel" x="${width-24}" y="${height-6}" width="14" height="4"/><rect class="door-handle" x="${width-12}" y="${height-14}" width="2" height="2"/><path class="door-step" d="M${width-30} ${height+2}h26"/></g><g class="building-sign"><rect x="7" y="${signY}" width="${signWidth}" height="12" rx="1"/><text x="12" y="${signY+9}" class="building-name">${escapeText(name)}</text></g>${buildingDetail(kind,width,height,roof)}</g>`;
}
function tree(x,y,scale=1) {return `<use href="#tree" x="${x}" y="${y}" width="${45*scale}" height="${65*scale}"/>`;}
function scenePerson(x,y,color='#c8664d',scale=1) {
  const phase=Math.abs(Math.round(x+y))%4;
  return `<g class="scene-person person-phase-${phase}" transform="translate(${x} ${y}) scale(${scale})" color="${color}"><use class="scene-person-frame scene-person-frame-a" href="#pixel-person-a" width="18" height="34"/><use class="scene-person-frame scene-person-frame-b" href="#pixel-person-b" width="18" height="34"/></g>`;
}
function pixelPerson(x,y,color='#c8664d',scale=1,frame='a') {return `<use href="#pixel-person-${frame}" x="${x}" y="${y}" width="${18*scale}" height="${34*scale}" color="${color}"/>`;}
function scene(index,markup) {return `<g class="scene-hotspot" role="button" tabindex="0" data-stop="${index}" aria-label="${escapeText(stops[index][language].name)}">${markup}</g>`;}

const basketballPlayers=[
  {x:38,y:16,scale:.72,color:'#608bab'},
  {x:82,y:31,scale:.72,color:'#c8664d'}
];
const basketballBall={x:62,y:43,size:7,rise:14};

function drawScenery() {
  const courtPlayers=basketballPlayers.map(player=>scenePerson(player.x,player.y,player.color,player.scale)).join('');
  const leisureScene=scene(5,`<ellipse class="scene-ground" cx="201" cy="116" rx="113" ry="53" fill="#d4dfc5"/>${tree(83,42,1.1)}${tree(310,40)}${tree(115,14,.7)}<g class="basketball-court" transform="translate(170 77) rotate(-12)"><rect width="116" height="64" rx="4" fill="#c7ac8a"/><rect x="3" y="3" width="110" height="58" rx="2" fill="none"/><path d="M58 3v58M3 32h110M3 17h15v30H3m110-30H98v30h15"/><circle cx="58" cy="32" r="12" fill="none"/><path d="M8 25V10h15M108 39v15H93"/><circle cx="8" cy="32" r="3" fill="none"/><circle cx="108" cy="32" r="3" fill="none"/>${courtPlayers}<rect class="ball-shadow" x="${basketballBall.x-2}" y="${basketballBall.y+7}" width="11" height="3"/><g class="basketball-ball-anchor" transform="translate(${basketballBall.x} ${basketballBall.y})"><g class="pixel-ball basketball-ball"><rect width="${basketballBall.size}" height="${basketballBall.size}" rx="1"/><path d="M3.5 0v7M0 3.5h7"/></g></g></g><g class="park-bench" transform="translate(127 135)"><path d="M0 0h28M3-5h22M3 0v12m22-12v12"/><path d="M1 4h26"/></g>${scenePerson(115,121,'#c8664d',.8)}`);
  const projectsScene=scene(4,`<ellipse class="scene-ground" cx="568" cy="73" rx="83" ry="36" fill="#e3dfce"/>${building(490,10,83,65,'#afc0b0','#d7ddca','ATELIER',1,'atelier')}<g class="maker-bench" transform="translate(600 43)"><path d="M0 21h34M4 21v15m26-15v15"/><rect x="7" y="7" width="20" height="14" rx="1"/><path d="M10 10h14v8H10Zm-5 11h24"/><circle cx="31" cy="31" r="2"/></g>${tree(642,9,.8)}${scenePerson(580,64,'#608bab',.8)}`);
  const learningScene=scene(3,`<ellipse class="scene-ground" cx="873" cy="170" rx="110" ry="42" fill="#dedfce"/>${building(774,83,132,88,'#d5c4a3','#e7dfc7','UNIVERSITÉ',2,'university')}${tree(947,109)}${scenePerson(839,179,'#608bab',.8)}${scenePerson(868,180,'#c8664d',.8)}<g class="bike-rack" transform="translate(913 177)"><path d="M0 8q0-12 8-12t8 12m6 0q0-12 8-12t8 12"/><path d="M-3 8h44"/></g>`);
  const peopleScene=scene(1,`<ellipse class="scene-ground" cx="378" cy="280" rx="110" ry="36" fill="#dfe0d0"/>${building(287,192,117,85,'#c98f72','#e4c5a6','COLLECTIF',2,'collective')}<g class="community-table" transform="translate(315 270)"><ellipse cx="30" cy="8" rx="24" ry="7"/><path d="M30 14v13M10 27h40"/><circle cx="5" cy="17" r="4"/><circle cx="55" cy="17" r="4"/></g>${tree(442,225,.9)}${scenePerson(334,280,'#608bab',.8)}<g class="notice-stand" transform="translate(415 249)"><rect width="23" height="19" rx="1"/><path d="M5 5h13M5 10h9M5 15h11M5 19v13m13-13v13"/></g>`);
  const experienceScene=scene(2,`<ellipse class="scene-ground" cx="701" cy="369" rx="161" ry="53" fill="#e0decd"/>${building(557,272,84,94,'#c8896d','#ddbea0','CAFÉ',2,'cafe')}<g class="pixel-smoke" aria-hidden="true"><rect x="609" y="242" width="5" height="5"/><rect x="603" y="231" width="4" height="4"/><rect x="610" y="220" width="5" height="5"/></g><g class="cafe-patio" transform="translate(658 385)"><ellipse cx="19" cy="8" rx="13" ry="6"/><path d="M19 14v15M7 29h24M2 8h-10m48 0h-10"/></g>${scenePerson(644,387,'#608bab',.72)}${scenePerson(692,389,'#c8664d',.72)}${building(732,244,76,121,'#b5bcb1','#d3d7c7','BUREAU',3,'office')}${tree(839,345,.8)}${tree(529,353,.7)}`);
  const startScene=scene(0,`<ellipse class="scene-ground" cx="204" cy="430" rx="77" ry="32" fill="#e1dfce"/>${building(172,378,72,58,'#d8cfb8','#d3cbb5','BONJOUR',0,'shop')}<g class="metro-sign" transform="translate(143 392)"><path d="M0 0v49"/><rect x="-11" y="-11" width="22" height="22" rx="3"/><path d="M-6 4V-5l6 6 6-6v9"/></g>${tree(96,383,.8)}${scenePerson(226,435,'#c8664d',.86)}<g class="newspaper-box" transform="translate(258 420)"><rect width="15" height="21" rx="1"/><path d="M3 4h9v7H3Zm1 11h7m-7 3h8"/></g>`);
  const cityDetails=`${tree(394,449,.8)}${tree(907,378)}${tree(965,418,.8)}${tree(97,260)}${tree(72,290,.8)}${tree(483,527,.8)}${tree(605,529,.6)}${tree(673,195,.7)}<g class="bridge" transform="translate(422 571)"><path d="M0 0h203l30 16H-30Z"/><path d="M0-6h203M3-6v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18m25-18v18"/></g><g class="sailboat" transform="translate(921 567)"><path d="M0 10h50l-9 12H12Z"/><path d="M25 10v-36l-24 33h24"/></g>`;
  $('#scenery').innerHTML=leisureScene+projectsScene+learningScene+peopleScene+experienceScene+startScene+cityDetails;
}

function renderStations() {
  $('#stations').innerHTML = stops.map((stop,index)=>{
    const name=escapeText(stop[language].name),width=Math.max(95,name.length*7.4+35);
    const labelX=index===1?-width-17:17;
    const state=`${visited.has(index)?' active':''}${visited.has(index)&&selected===index?' current':''}`;
    return `<g class="station${state}" role="button" tabindex="0" data-stop="${index}" aria-label="${name}" transform="translate(${stop.x} ${stop.y})"><g class="station-pixel-pulse" aria-hidden="true"><rect x="-8" y="-8" width="3" height="3"/><rect x="5" y="-8" width="3" height="3"/><rect x="-8" y="5" width="3" height="3"/><rect x="5" y="5" width="3" height="3"/></g><circle class="station-ring" r="10"/><circle r="3" fill="#c8664d"/><g class="station-copy"><rect class="label-bg" x="${labelX}" y="-13" width="${width}" height="27" rx="5"/><circle cx="${labelX+14}" cy="0" r="8" fill="#c8664d"/><text class="station-number" x="${labelX+14}" y="3" text-anchor="middle">${index+1}</text><text class="station-label" x="${labelX+28}" y="5">${name}</text></g></g>`;
  }).join('');
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
  $('#city-desc').textContent=language==='en'?'An illustrated city with six interactive metro stations, moving trains, and people. Select any station to explore its story.':'Une ville illustrée avec six stations de métro interactives, des trains et des passants. Sélectionnez une station pour explorer son histoire.';
  $('#map-scroll').setAttribute('aria-label',language==='en'?'Interactive city map; scroll horizontally on small screens':'Carte interactive; défilement horizontal sur petit écran');
  $('.header-links').setAttribute('aria-label',language==='en'?'Main navigation':'Navigation principale');
  drawScenery();renderStations();updateControls();
  if($('#story').open) renderStory();
}

function updateControls() {
  $('#motion').textContent=translations[language][paused?'play':'pause'];
  $('#motion').setAttribute('aria-pressed',String(paused));
  document.body.classList.toggle('motion-paused',paused||document.hidden||$('#story').open);
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
const walkingPaths=['M272 455L326 417','M924 244L970 286','M455 300L510 320','M606 427L674 433','M90 210L143 235','M753 558L815 531','M678 174L734 186','M80 525L126 500'];
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
$('#close-story').addEventListener('click',()=>{endTour();$('#story').close();});
$('#story').addEventListener('cancel',()=>endTour());
$('#story').addEventListener('click',event=>{if(event.target===$('#story')){const r=$('#story').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){endTour();$('#story').close();}}});
$('#story').addEventListener('close',()=>{updateControls();if(!journey){const station=$(`#stations [data-stop="${selected}"]`);station?.focus({preventScroll:true});}});
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
