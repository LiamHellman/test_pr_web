'use strict';

const $ = selector => document.querySelector(selector);
const svgNS = 'http://www.w3.org/2000/svg';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = 'en';
let activeStop = 0;
let lastFrame = null;

const copy = {
  en:{skip:'Skip to the map',role:'Industrial relations · Montréal',cv:'Résumé',contact:'Contact',eyebrow:'RÉSEAU PERSONNEL · PERSONAL NETWORK',name:'Liam Hellman',mapTitle:'People, work, and the routes between them.',hint:'Select a raised station to explore.',caption:'Inspired by Montréal’s original métro diagrams · Map not to scale',previous:'← Previous',next:'Next station →',close:'Close',mountRoyal:'MONT ROYAL',oldPort:'OLD MONTRÉAL'},
  fr:{skip:'Aller à la carte',role:'Relations industrielles · Montréal',cv:'CV',contact:'Contact',eyebrow:'RÉSEAU PERSONNEL · PERSONAL NETWORK',name:'Liam Hellman',mapTitle:'L’humain, le travail et les parcours qui les relient.',hint:'Choisissez une station surélevée.',caption:'Inspirée des premiers plans du métro de Montréal · Carte non à l’échelle',previous:'← Précédente',next:'Prochaine station →',close:'Fermer',mountRoyal:'MONT ROYAL',oldPort:'VIEUX-MONTRÉAL'}
};

const stops = [
  {id:'berri',x:680,y:480,line:'green',color:'#11815a',labelX:706,labelY:458,labelW:168,scene:'berri',en:{station:'Berri–UQAM',story:'START HERE',title:'The interchange.',lead:'I’m Liam Hellman, an industrial relations student at Université de Montréal with a computer science background.',cards:[['THE COMMON THREAD','People, work, and systems','My experience spans a corporate technology team, a busy Montréal bar, and live events. Each setting shaped my interest in how people collaborate and adapt at work.'],['MY DIRECTION','Industrial relations','I’m building a foundation in the relationships between workers, employers, and organizations, with technology as a second way of understanding workplace systems.']],chips:['Montréal','English & French','Industrial relations','Computer science']},fr:{station:'Berri–UQAM',story:'POINT DE DÉPART',title:'La correspondance.',lead:'Moi, c’est Liam Hellman. J’étudie en relations industrielles à l’Université de Montréal avec un parcours en informatique.',cards:[['LE FIL CONDUCTEUR','L’humain, le travail et les systèmes','Mon expérience passe par une équipe informatique, un bar montréalais animé et des événements. Chaque milieu a nourri mon intérêt pour la collaboration et l’adaptation au travail.'],['MA DIRECTION','Relations industrielles','Je construis une base sur les rapports entre travailleurs, employeurs et organisations, avec la technologie comme second regard sur les systèmes de travail.']],chips:['Montréal','Français et anglais','Relations industrielles','Informatique']}},
  {id:'udem',x:260,y:248,line:'blue',color:'#1677a8',labelX:141,labelY:281,labelW:205,scene:'udem',en:{station:'Université-de-Montréal',story:'EDUCATION',title:'Two fields, one perspective.',lead:'My studies connect an interest in people and organizations with a practical understanding of technology.',cards:[['2024 — ONGOING','Université de Montréal','Bachelor’s degree in progress with a major in industrial relations and a minor in computer science.'],['2021 — 2024','Collège de Maisonneuve','DEC in administration and mathematics, building a base in organizations and quantitative thinking.'],['2016 — 2021','Académie de Roberval','Robotics and English literature—an early mix of technical exploration, language, and ideas.']],chips:['Industrial relations','Computer science','Administration','Continuous learning']},fr:{station:'Université-de-Montréal',story:'FORMATION',title:'Deux domaines, un regard.',lead:'Mon parcours relie un intérêt pour les personnes et les organisations à une compréhension pratique de la technologie.',cards:[['2024 — EN COURS','Université de Montréal','Baccalauréat en cours avec une majeure en relations industrielles et une mineure en informatique.'],['2021 — 2024','Collège de Maisonneuve','DEC en administration et mathématiques, avec des bases en organisation et en raisonnement quantitatif.'],['2016 — 2021','Académie de Roberval','Robotique et littérature anglaise : une première rencontre entre technologie, langue et idées.']],chips:['Relations industrielles','Informatique','Administration','Apprentissage continu']}},
  {id:'rosemont',x:645,y:330,line:'orange',color:'#e86f32',labelX:674,labelY:307,labelW:133,scene:'rosemont',en:{station:'Rosemont',story:'EXPERIENCE',title:'Learning on the ground.',lead:'Different workplaces gave me different responsibilities and the same opportunity to work with people and solve practical problems.',cards:[['2024 — PRESENT · BAR ROSEMONT','Bartender','Customer service, bar management, and new recipes in a setting where coordination matters every shift.'],['2022 — 2023 · CROIX BLEUE CANASSURANCE','DevOps intern','Worked in an Agile team with DNS, Microsoft Azure, infrastructure as code, and programming tools.'],['2021 · XP-MTL','Event technician','Supported customers, artist schedules, artist management, and event coordination.']],chips:['Customer service','Coordination','Teamwork','Adaptability']},fr:{station:'Rosemont',story:'EXPÉRIENCE',title:'Apprendre sur le terrain.',lead:'Des milieux variés m’ont donné des responsabilités différentes et la même occasion de travailler avec les gens et de résoudre des problèmes concrets.',cards:[['2024 — PRÉSENT · BAR ROSEMONT','Barman','Service à la clientèle, gestion du bar et création de recettes dans un milieu où la coordination compte à chaque quart.'],['2022 — 2023 · CROIX BLEUE CANASSURANCE','Stagiaire DevOps','Travail en équipe Agile avec les DNS, Microsoft Azure, l’infrastructure en tant que code et des outils de programmation.'],['2021 · XP-MTL','Technicien événementiel','Soutien à la clientèle, aux horaires et à la gestion des artistes ainsi qu’à la coordination des événements.']],chips:['Service à la clientèle','Coordination','Travail d’équipe','Adaptabilité']}},
  {id:'square',x:535,y:660,line:'orange',color:'#e86f32',labelX:558,labelY:635,labelW:184,scene:'square',en:{station:'Square-Victoria–OACI',story:'PEOPLE & WORK',title:'The human side of work.',lead:'Industrial relations brings together the questions I want to explore: how we organize work and navigate different interests.',cards:[['AREA OF INTEREST','Labour and employee relations','Dialogue between workers and employers, collective representation, and the way organizations respond to competing needs.'],['AREA OF INTEREST','Recruitment and people experience','How organizations connect with candidates and how the experience of work develops from the first conversation onward.'],['AREA OF INTEREST','Organizations and technology','How digital tools can support HR work and how technological change affects people.']],chips:['Labour relations','Talent acquisition','Organizations','HR technology']},fr:{station:'Square-Victoria–OACI',story:'HUMAIN ET TRAVAIL',title:'Le côté humain du travail.',lead:'Les relations industrielles réunissent les questions que je souhaite explorer : comment organiser le travail et composer avec des intérêts différents.',cards:[['CHAMP D’INTÉRÊT','Relations du travail','Le dialogue entre travailleurs et employeurs, la représentation collective et la réponse des organisations à des besoins différents.'],['CHAMP D’INTÉRÊT','Recrutement et expérience employé','La relation avec les candidats et la façon dont l’expérience du travail se construit dès le premier échange.'],['CHAMP D’INTÉRÊT','Organisations et technologie','La contribution des outils numériques aux RH et les effets du changement technologique sur les personnes.']],chips:['Relations du travail','Acquisition de talents','Organisations','Technologie RH']}},
  {id:'pda',x:500,y:590,line:'green',color:'#11815a',labelX:371,labelY:550,labelW:151,scene:'pda',en:{station:'Place-des-Arts',story:'PROJECTS',title:'Ideas made tangible.',lead:'My technical projects are places to experiment and turn curiosity into something people can use.',cards:[['2025 · REACT / JAVASCRIPT / OPENAI','Factify.Tech','A web app and Chrome extension using LLMs to explore language-based bias and claims in selected text or video. AI assessments are exploratory, not a guarantee of accuracy.'],['2025 · PYTHON / OPENCV / DLIB','Roast-Me','A playful computer vision app that generates roasts or compliments from detected facial proportions, with AI voice-over.'],['TECHNICAL TOOLKIT','A second set of tools','Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform, and Microsoft Azure.']],chips:['Prototyping','Web applications','AI experiments','Cloud tools']},fr:{station:'Place-des-Arts',story:'PROJETS',title:'Des idées concrétisées.',lead:'Mes projets techniques sont des espaces d’expérimentation où la curiosité devient quelque chose d’utilisable.',cards:[['2025 · REACT / JAVASCRIPT / OPENAI','Factify.Tech','Une application web et une extension Chrome utilisant des LLM pour explorer les biais linguistiques et les affirmations dans du texte ou des vidéos. Les analyses par IA restent exploratoires.'],['2025 · PYTHON / OPENCV / DLIB','Roast-Me','Une application ludique de vision par ordinateur qui génère des critiques humoristiques ou des compliments, avec narration par IA.'],['OUTILS TECHNIQUES','Une deuxième boîte à outils','Python, Java, SQL, JavaScript, R, React, Flask, Git, Terraform et Microsoft Azure.']],chips:['Prototypage','Applications web','Expérimentation IA','Infonuagique']}},
  {id:'drapeau',x:900,y:640,line:'yellow',color:'#e4bf22',labelX:916,labelY:607,labelW:139,scene:'drapeau',en:{station:'Jean-Drapeau',story:'OFF THE CLOCK',title:'Beyond the résumé.',lead:'Outside work and university, I keep several routes open for curiosity, movement, and community.',cards:[['MOVE','Team sports and martial arts','Basketball, hockey, soccer, martial arts, and intramural basketball.'],['EXPLORE','Art, history, politics, and cooking','A mix of big ideas and hands-on creativity, including experiments in the kitchen.'],['CONNECT','Community and languages','UdeM AI and MealCare. Fluent in French and English, and learning Spanish and Japanese.']],chips:['Basketball','Cooking','Art & history','MealCare','Languages']},fr:{station:'Jean-Drapeau',story:'APRÈS LE TRAVAIL',title:'Au-delà du CV.',lead:'En dehors du travail et de l’université, je garde plusieurs voies ouvertes vers la curiosité, le mouvement et la communauté.',cards:[['BOUGER','Sports d’équipe et arts martiaux','Basketball, hockey, soccer, arts martiaux et basketball intra-muros.'],['EXPLORER','Art, histoire, politique et cuisine','Un mélange de grandes idées et de création concrète, notamment dans la cuisine.'],['ÉCHANGER','Communauté et langues','UdeM AI et MealCare. Français et anglais courants; espagnol et japonais en apprentissage.']],chips:['Basketball','Cuisine','Art et histoire','MealCare','Langues']}}
];

const escapeText = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const current = stop => stop[language];

function renderMinorStations(){
  const dots=[[606,153,'orange'],[619,216,'orange'],[632,275,'orange'],[661,393,'orange'],[667,545,'orange'],[610,607,'orange'],[331,243,'blue'],[400,227,'blue'],[471,196,'blue'],[530,148,'blue'],[668,91,'blue'],[752,108,'blue'],[350,638,'green'],[408,622,'green'],[447,609,'green'],[590,548,'green'],[758,442,'green'],[835,421,'green'],[920,419,'green'],[747,519,'yellow'],[814,568,'yellow']];
  const labels=[[590,105,'Jean-Talon',true],[835,421,'Papineau'],[1010,430,'Frontenac'],[845,150,'Saint-Michel'],[955,681,'Longueuil']];
  const colors={orange:'#e86f32',blue:'#1677a8',green:'#11815a',yellow:'#e4bf22'};
  $('#minor-stations').innerHTML=dots.map(([x,y,line])=>`<circle class="minor-node" cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y}" r="2" fill="${colors[line]}"/>`).join('')+labels.map(([x,y,name,transfer])=>`${transfer?`<circle class="minor-transfer" cx="${x}" cy="${y}" r="11"/><circle cx="${x}" cy="${y}" r="4" fill="#e86f32"/>`:''}<text x="${x+12}" y="${y-10}" class="minor-label">${name}</text>`).join('');
}

function sceneMarkup(type){
  return {
    berri:`<g class="scene" transform="translate(707 377)"><ellipse cx="41" cy="81" rx="57" ry="13" fill="#786f5e" opacity=".22"/><path class="scene-top" d="M0 31 38 10l62 28-39 21Z"/><path class="scene-face" d="M0 31v42l61 29V59Z"/><path class="scene-side" d="M61 59l39-21v42l-39 22Z"/><path class="scene-dark" d="M14 51v30l31 15V65Z"/><path d="M19 58v13l20 10V68Z" fill="#b9d4ce"/><rect x="20" y="28" width="28" height="13" rx="2" fill="#173d31"/><text x="28" y="38" class="scene-sign">M</text></g>`,
    udem:`<g class="scene" transform="translate(195 151)"><ellipse cx="67" cy="78" rx="78" ry="15" fill="#786f5e" opacity=".22"/><path class="scene-top" d="M0 28 47 2l104 39-47 26Z"/><path class="scene-face" d="M0 28v48l104 41V67Z"/><path class="scene-side" d="M104 67l47-26v48l-47 28Z"/><path d="M18 45h66v11H18zm0 21h66v11H18zm0 21h66v11H18Z" fill="#49675c"/><path d="M95 73v34" stroke="#263f35" stroke-width="12"/><text x="18" y="24" class="scene-sign dark">UdeM</text></g>`,
    rosemont:`<g class="scene" transform="translate(673 227)"><ellipse cx="54" cy="100" rx="69" ry="14" fill="#786f5e" opacity=".22"/><path d="M0 22 38 0l92 30-39 23Z" fill="#d7b18d"/><path d="M0 22v79l91 34V53Z" fill="#b86f50"/><path d="M91 53l39-23v79l-39 26Z" fill="#8d806c"/><path d="M12 45h69M12 69h69M12 93h69" stroke="#e8b891" stroke-width="3"/><g fill="#b9d4ce" stroke="#6b6a5e"><rect x="17" y="34" width="14" height="17"/><rect x="42" y="43" width="14" height="17"/><rect x="67" y="52" width="14" height="17"/><rect x="17" y="65" width="14" height="17"/><rect x="42" y="74" width="14" height="17"/></g><path d="M55 112v-23h24v32Z" fill="#25443a"/><rect x="9" y="99" width="47" height="12" fill="#e8d8b8"/><text x="15" y="108" class="scene-sign dark">BAR ROSEMONT</text></g>`,
    square:`<g class="scene" transform="translate(556 552)"><ellipse cx="67" cy="91" rx="77" ry="14" fill="#786f5e" opacity=".22"/><path class="scene-top" d="M0 27 48 0l90 36-49 27Z"/><path d="M0 27v67l89 38V63Z" fill="#9d8a69"/><path class="scene-side" d="M89 63l49-27v67l-49 29Z"/><path d="M18 48h51v46H18Z" fill="#516a5e"/><path d="M25 55h14v12H25zm22 0h14v12H47zM25 75h14v12H25zm22 0h14v12H47Z" class="scene-window"/><path d="M78 112V79h23v43" fill="#233f35"/></g>`,
    pda:`<g class="scene" transform="translate(390 486)"><ellipse cx="65" cy="68" rx="76" ry="13" fill="#786f5e" opacity=".22"/><path d="M0 34 62 0l84 34-62 34Z" fill="#d7c49f"/><path d="M0 34v38l84 35V68Z" fill="#a99778"/><path d="M84 68l62-34v38l-62 35Z" fill="#75877b"/><path d="M32 39l28-16 42 17-29 16Z" fill="#213e34"/><path d="M39 59h40v30H39Z" fill="#c96e4c"/><path d="M44 65h30" stroke="#f0dfb9" stroke-width="3"/></g>`,
    drapeau:`<g class="scene" transform="translate(850 524)"><ellipse cx="52" cy="92" rx="66" ry="13" fill="#786f5e" opacity=".22"/><circle cx="52" cy="45" r="44" fill="#d8ddd0" stroke="#456c5d" stroke-width="2"/><g fill="none" stroke="#688e7e" stroke-width="1"><ellipse cx="52" cy="45" rx="40" ry="14"/><ellipse cx="52" cy="45" rx="40" ry="28"/><path d="M12 45h80M52 2v86M18 21l68 48M18 69l68-48"/></g><path d="M17 88h70l13 12H4Z" fill="#94876e"/></g>`
  }[type];
}

function renderScenes(){ $('#station-scenes').innerHTML=stops.map(stop=>sceneMarkup(stop.scene)).join(''); }

function renderStations(){
  $('#stations').innerHTML=stops.map((stop,index)=>{
    const data=current(stop);
    return `<g class="station line-${stop.line}${index===activeStop&&$('#story').open?' active':''}" role="button" tabindex="0" data-stop="${index}" aria-label="${escapeText(data.station)} — ${escapeText(data.story)}">
      <circle class="hit" cx="${stop.x}" cy="${stop.y}" r="31"/><ellipse class="pedestal" cx="${stop.x}" cy="${stop.y+9}" rx="19" ry="9"/><circle class="pulse" cx="${stop.x}" cy="${stop.y-2}" r="19"/><circle class="outer" cx="${stop.x}" cy="${stop.y-6}" r="17"/><circle class="inner" cx="${stop.x}" cy="${stop.y-6}" r="8"/>
      <rect class="label-shadow" x="${stop.labelX+3}" y="${stop.labelY+5}" width="${stop.labelW}" height="39" rx="3"/><rect class="label" x="${stop.labelX}" y="${stop.labelY}" width="${stop.labelW}" height="39" rx="3"/>
      <text class="station-name" x="${stop.labelX+12}" y="${stop.labelY+17}">${escapeText(data.station)}</text><text class="station-story" x="${stop.labelX+12}" y="${stop.labelY+30}">${escapeText(data.story)}</text>
    </g>`;
  }).join('');
}

function renderStory(){
  const stop=stops[activeStop], data=current(stop);
  $('#story-line').innerHTML=`<i class="line-dot line-${stop.line}"></i>${escapeText(data.station.toUpperCase())} · ${escapeText(data.story)}`;
  $('#story-content').innerHTML=`<p class="story-number">${String(activeStop+1).padStart(2,'0')} / 06</p><h2 class="story-title" id="story-title">${escapeText(data.title)}</h2><p class="story-lead">${escapeText(data.lead)}</p><div class="chips">${data.chips.map(chip=>`<span>${escapeText(chip)}</span>`).join('')}</div>${data.cards.map(([meta,title,body])=>`<article class="story-card"><small>${escapeText(meta)}</small><h3>${escapeText(title)}</h3><p>${escapeText(body)}</p></article>`).join('')}<div class="story-links"><a href="assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf" target="_blank" rel="noopener">${language==='en'?'RÉSUMÉ':'CV'} ↗</a><a href="mailto:liamhellman@gmail.com">CONTACT ↗</a><a href="https://www.linkedin.com/in/liam-hellman" target="_blank" rel="noopener">LINKEDIN ↗</a></div>`;
}

function openStop(index){
  activeStop=(index+stops.length)%stops.length;
  renderStory();
  if(!$('#story').open) $('#story').showModal();
  renderStations();
  document.querySelectorAll('.scene').forEach((scene,i)=>scene.classList.toggle('lift',i===activeStop));
  $('#announcement').textContent=`${language==='en'?'Arrived at':'Arrivée à'} ${current(stops[activeStop]).station}`;
  $('#close-story').focus({preventScroll:true});
}

function translate(){
  document.documentElement.lang=language;
  document.title=language==='en'?'Liam Hellman — A Montréal network':'Liam Hellman — Un réseau montréalais';
  document.querySelectorAll('[data-i18n]').forEach(element=>element.textContent=copy[language][element.dataset.i18n]);
  document.querySelectorAll('[data-i18n-svg]').forEach(element=>element.textContent=copy[language][element.dataset.i18nSvg]);
  $('#language').textContent=language==='en'?'FR':'EN';
  $('#language').setAttribute('aria-label',language==='en'?'Passer au français':'Switch to English');
  $('#close-story').setAttribute('aria-label',copy[language].close);
  $('#cv-link').href=`assets/Liam-Hellman-CV-${language.toUpperCase()}.pdf`;
  $('.actions').setAttribute('aria-label',language==='en'?'Main navigation':'Navigation principale');
  $('#map-viewport').setAttribute('aria-label',language==='en'?'Interactive Montréal portfolio map; scroll horizontally on small screens':'Carte interactive du portfolio montréalais; défilement horizontal sur petit écran');
  $('#svg-title').textContent=language==='en'?'Liam Hellman’s Montréal network':'Le réseau montréalais de Liam Hellman';
  $('#svg-desc').textContent=language==='en'?'An old Montréal metro inspired map with six interactive stations connected by the green, orange, blue, and yellow lines.':'Une carte inspirée des anciens plans du métro de Montréal avec six stations interactives sur les lignes verte, orange, bleue et jaune.';
  renderStations();if($('#story').open)renderStory();
}

function createTrain(pathId,color,position,speed){
  const path=$(`#${pathId}`),group=document.createElementNS(svgNS,'g');
  group.innerHTML=`<ellipse class="train-shadow" cx="0" cy="8" rx="21" ry="6"/><g><rect class="train-car" x="-20" y="-8" width="40" height="16" rx="4" fill="${color}"/><rect class="train-window" x="-14" y="-5" width="8" height="6" rx="1"/><rect class="train-window" x="-3" y="-5" width="8" height="6" rx="1"/><path d="M10-6v12" stroke="#f3e8cf" stroke-width="2"/><circle cx="-11" cy="8" r="2" fill="#1c2823"/><circle cx="11" cy="8" r="2" fill="#1c2823"/></g>`;
  $('#trains').append(group);return{path,group,length:path.getTotalLength(),position,speed,direction:1};
}

function positionAlong(item){
  const point=item.path.getPointAtLength(item.position),before=item.path.getPointAtLength(Math.max(0,item.position-1)),after=item.path.getPointAtLength(Math.min(item.length,item.position+1));
  const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
  item.group.setAttribute('transform',`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
}

function createWalker(pathData,color,position,speed){
  const path=document.createElementNS(svgNS,'path');path.setAttribute('d',pathData);
  const group=document.createElementNS(svgNS,'g');group.classList.add('walker');group.innerHTML=`<use href="#person" x="-8" y="-30" width="16" height="31" color="${color}"/>`;$('#walkers').append(group);
  return{path,group,length:path.getTotalLength(),position,speed,direction:1};
}

renderMinorStations();renderScenes();renderStations();translate();
const trains=[createTrain('orange-route','#d05d27',80,25),createTrain('blue-route','#11658f',290,30),createTrain('green-route','#0b6d4b',450,27),createTrain('yellow-route','#c6a41c',55,22)];
const walkers=[createWalker('M708 438L761 414','#b95f42',0,5),createWalker('M595 349L626 375','#1d6d70',12,4),createWalker('M472 616L516 635','#b95f42',5,4.5)];
trains.forEach(positionAlong);walkers.forEach(positionAlong);

function animate(time){
  const delta=lastFrame===null?0:Math.min((time-lastFrame)/1000,.05);lastFrame=time;
  if(!prefersReducedMotion.matches&&!document.hidden){
    [...trains,...walkers].forEach(item=>{item.position+=delta*item.speed*item.direction;if(item.position>item.length){item.position=item.length;item.direction=-1}if(item.position<0){item.position=0;item.direction=1}positionAlong(item)});
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

document.addEventListener('click',event=>{const station=event.target.closest('[data-stop]');if(station)openStop(Number(station.dataset.stop));});
$('#map').addEventListener('keydown',event=>{const station=event.target.closest('[data-stop]');if(station&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openStop(Number(station.dataset.stop));}});
$('#language').addEventListener('click',()=>{language=language==='en'?'fr':'en';translate();});
$('#close-story').addEventListener('click',()=>$('#story').close());
$('#story').addEventListener('close',()=>{document.querySelectorAll('.scene').forEach(scene=>scene.classList.remove('lift'));renderStations();$(`[data-stop="${activeStop}"]`)?.focus({preventScroll:true});});
$('#story').addEventListener('click',event=>{if(event.target===$('#story'))$('#story').close();});
$('#previous').addEventListener('click',()=>openStop(activeStop-1));
$('#next').addEventListener('click',()=>openStop(activeStop+1));
document.addEventListener('visibilitychange',()=>{lastFrame=null;});

window.addEventListener('load',()=>{
  if(!window.matchMedia('(max-width: 760px)').matches)return;
  requestAnimationFrame(()=>{
    const viewport=$('#map-viewport');
    const scale=$('#map').getBoundingClientRect().width/1200;
    viewport.scrollLeft=Math.max(0,680*scale-viewport.clientWidth*.52);
  });
},{once:true});
