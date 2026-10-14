/* Atlante interattivo di Thespira: percorso narrativo, insediamenti e territori.
 * Segnaposti HTML non scalati per mantenere forme e testi nitidi anche con lo zoom.
 * La carta originale rimane un JPG: i toponimi stampati nel disegno hanno risoluzione finita.
 */
function initThespiraMap(root) {
  "use strict";
  const frame = root.querySelector("#map-frame");
  const viewport = root.querySelector("#map-viewport");
  const img = root.querySelector("#map-image");
  const output = root.querySelector("#map-zoom");
  if (!frame || !viewport || !img || !output) return () => {};
  let zoom = 1, dx = 0, dy = 0, baseW = 0, baseH = 0;
  const active = new Map();
  let lastPinch = null;
  const MIN = 1, MAX = 6;
  const teardown = [];
  // Coordinate espresse in pixel sulla carta originale (1536 x 2048),
  // non coordinate geografiche: i quattro nuovi borghi hanno ubicazione orientativa approvata.
  const mapPoints = [
    {id:"manna", name:"Manna", x:400, y:695, kind:"localita", slug:"manna", approximate:true},
    {id:"lantrelle", name:"Lantrelle", x:660, y:694, kind:"localita", slug:"lantrelle"},
    {id:"brugheroccia", name:"Brugheroccia", x:796, y:410, kind:"localita", slug:"brugheroccia", approximate:true},
    {id:"obsydra", name:"Obsydra", x:951, y:372, kind:"localita", slug:"obsydra"},
    {id:"roncenoir", name:"Roncenoir", x:759, y:585, kind:"localita", slug:"roncenoir", approximate:true},
    {id:"ebavurage", name:"Ebavurage", x:810, y:671, kind:"localita", slug:"ebavurage", approximate:true},
    {id:"heliara", name:"Heliara", x:1001, y:803, kind:"localita", slug:"heliara", type:"Capitale di Aurelia", intro:"Capitale del Regno di Aurelia, verso la quale è diretta la compagnia."},
    {id:"pyrocladion", name:"Pyrocladion", x:565, y:291, kind:"localita", slug:"pyrocladion", type:"Città-stato", intro:"Città-stato del Surturheim, già menzionata nel corso del viaggio."},
    {id:"talvaris", name:"Talvaris", x:401, y:1518, kind:"localita", slug:"talvaris"},
    {id:"sargona", name:"Sargona", x:635, y:1634, kind:"localita", slug:"sargona"},
    {id:"ishkar", name:"Ishkar", x:1247, y:1295, kind:"localita", slug:"ishkar"},
    {id:"nurashad", name:"Nurashad", x:1113, y:1850, kind:"localita", slug:"nurashad"},
    {id:"nemorae", name:"Nemorae", x:452, y:537, kind:"regione", slug:"foreste-nemorae", type:"Regione forestale"},
    {id:"surturheim", name:"Surturheim", x:693, y:238, kind:"regione", slug:"surturheim", type:"Regione montuosa e vulcanica"},
    {id:"aurelia", name:"Regno di Aurelia", x:1065, y:680, kind:"regione", slug:"regno-aurelia"},
    {id:"velmora", name:"Repubblica di Velmora", x:490, y:1260, kind:"regione", slug:"repubblica-velmora"},
    {id:"ashamir", name:"Sultanato di Ashamir", x:995, y:1550, kind:"regione", slug:"sultanato-ashamir"},
    {id:"sevrath", name:"Deserto del Sevrath", x:840, y:1750, kind:"regione", slug:"deserto-sevrath", type:"Regione desertica"}
  ];
  // Percorso pubblico: ordine degli eventi giocati. Il tracciato collega i centri noti,
  // NON identifica sentieri, strade reali, distanze o coordinate di incontri intermedi.
  // La Gola (cap. VIII) non è cartografata: viene citata ma non inventata sulla carta.
  const journeyChapters = [
    {number:"I",slug:"manna",title:"Manna e Lilith-Zetto",where:"Manna",detail:"La compagnia si forma a Manna e si muove nei boschi circostanti. I singoli rifugi non sono localizzabili sulla carta.",anchor:"manna",focus:["manna"]},
    {number:"II",slug:"reietti",title:"L’ordine di Selese Arco",where:"Nemorae, a nord di Manna",detail:"La compagnia incontra Selese, Nero e i reietti. L’accampamento è itinerante e non dispone di una posizione cartografica certa.",focus:["manna"]},
    {number:"III",slug:"lantrelle",title:"Il rapporto di Lantrelle",where:"Lantrelle",detail:"Il gruppo raggiunge l’avamposto commerciale di Lantrelle e incontra Cato Mirel.",anchor:"lantrelle",focus:["manna","lantrelle"]},
    {number:"IV",slug:"brugheroccia",title:"Il Babau di Brugheroccia",where:"Brugheroccia",detail:"Spostamento verso il Surturheim e sosta a Brugheroccia, presso la valle del Lirion.",anchor:"brugheroccia",focus:["lantrelle","brugheroccia"]},
    {number:"V",slug:"obsydra",title:"Obsydra e il Vecchio Paladino Oscuro",where:"Obsydra",detail:"La compagnia raggiunge Obsydra. Le miniere e la Cava sono luoghi interni alla città, non punti autonomi della mappa continentale.",anchor:"obsydra",focus:["brugheroccia","obsydra"]},
    {number:"VI",slug:"paludi",title:"Le paludi di Nemorae",where:"Obsydra → Brugheroccia → Roncenoir",detail:"Ritorno a Brugheroccia, poi attraversamento dei canyon del Surturheim e delle paludi settentrionali di Nemorae fino a Roncenoir.",anchor:"roncenoir",focus:["obsydra","brugheroccia","roncenoir"]},
    {number:"VII",slug:"roncenoir",title:"Roncenoir e le Grandi Fauci",where:"Roncenoir",detail:"La compagnia soggiorna a Roncenoir. Le Acque Profonde, poco lontane, non hanno coordinate determinate sulla carta continentale.",anchor:"roncenoir",focus:["roncenoir"]},
    {number:"VIII",slug:"gola",title:"Il Magistro della Gola",where:"Da Roncenoir verso Ebavurage",detail:"Il viaggio prosegue nella foresta. La Gola in cui avviene lo scontro con Mercer Berus non è localizzata con precisione: non viene collocata sulla mappa.",focus:["roncenoir","ebavurage"]},
    {number:"IX",slug:"ebavurage",title:"Il mistero di Ebavurage",where:"Ebavurage · avventura in corso",detail:"La compagnia raggiunge Ebavurage. Il percorso disegnato dall’ultimo centro noto è orientativo; le indagini nel borgo sono ancora in corso.",anchor:"ebavurage",focus:["roncenoir","ebavurage"]}
  ];
  // I segmenti sono connettori schematici tra località confermate: nessuna via esatta è nota.
  // Il tratto finale viene completato nel capitolo IX; nel VIII non si attribuisce una posizione alla Gola.
  const journeyLegs = [
    {chapter:3,from:"manna",to:"lantrelle"},
    {chapter:4,from:"lantrelle",to:"brugheroccia"},
    {chapter:5,from:"brugheroccia",to:"obsydra"},
    {chapter:6,from:"obsydra",to:"brugheroccia",returning:true},
    {chapter:6,from:"brugheroccia",to:"roncenoir"},
    {chapter:9,from:"roncenoir",to:"ebavurage"}
  ];
  const pointById = new Map(mapPoints.map(p => [p.id,p]));
  let journeyChapter = journeyChapters.length, journeyScope = "through", journeyVisible = true;
  const encyclopedia = (typeof CHRONICLES !== "undefined" && Array.isArray(CHRONICLES.places)) ? CHRONICLES.places : [];
  const wikiBySlug = new Map(encyclopedia.map(entry => [entry.slug, entry]));
  const findWiki = place => place.slug ? wikiBySlug.get(place.slug) : null;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeFilter = "all", selected = null;

  // Il livello dei punti segue esattamente zoom e traslazione della carta;
  // le dimensioni delle icone restano costanti per leggibilità e accessibilità.
  const journeyLayer = document.createElementNS("http://www.w3.org/2000/svg","svg");
  journeyLayer.classList.add("map-journey-layer");
  journeyLayer.setAttribute("viewBox","0 0 1536 2048");
  journeyLayer.setAttribute("preserveAspectRatio","none");
  journeyLayer.setAttribute("aria-hidden","true");
  viewport.appendChild(journeyLayer);
  const pinsLayer = document.createElement("div");
  pinsLayer.className = "map-pins-layer";
  pinsLayer.setAttribute("aria-label", "Località indicate sulla carta");
  viewport.appendChild(pinsLayer);
  const pinButtons = new Map();
  for (const place of mapPoints) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `map-pin map-pin-${place.kind}${place.approximate ? " map-pin-approximate" : ""}`;
    btn.dataset.pointId = place.id;
    btn.setAttribute("aria-label", `Apri la scheda cartografica: ${place.name}`);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<span aria-hidden="true">${place.kind === "regione" ? "✦" : "◆"}</span><span class="map-pin-tooltip">${esc(place.name)}</span>`;
    pinsLayer.appendChild(btn);
    pinButtons.set(place.id, btn);
  }
  const popover = document.createElement("section");
  popover.className = "map-popover";
  popover.setAttribute("aria-label", "Dettagli del luogo selezionato");
  popover.hidden = true;
  viewport.appendChild(popover);
  const filterbar = document.createElement("div");
  filterbar.className = "map-filterbar";
  filterbar.innerHTML = `<span class="map-filter-label">Mostra</span><div class="map-filter-buttons" role="group" aria-label="Filtra segnaposti">
    <button type="button" data-filter="all" aria-pressed="true">Tutti</button>
    <button type="button" data-filter="localita" aria-pressed="false">Insediamenti</button>
    <button type="button" data-filter="regione" aria-pressed="false">Territori</button></div>
    <output class="map-filter-count" aria-live="polite"></output>`;
  frame.insertBefore(filterbar, viewport);
  const journeyPanel = document.createElement("section");
  journeyPanel.className = "map-journey-panel";
  journeyPanel.setAttribute("aria-label", "Percorso della compagnia attraverso i capitoli");
  journeyPanel.innerHTML = `<div class="map-journey-heading"><div><span class="map-journey-kicker">Il viaggio della compagnia</span><strong>La strada percorsa, capitolo dopo capitolo</strong></div><label class="map-journey-check"><input type="checkbox" data-journey-visible checked> Mostra itinerario</label></div>
    <div class="map-journey-navigation"><button type="button" data-journey-prev aria-label="Capitolo precedente">←</button><label>Capitolo <select data-journey-select aria-label="Seleziona il capitolo del viaggio">${journeyChapters.map((c,i)=>`<option value="${i+1}">${c.number} · ${esc(c.title)}</option>`).join("")}</select></label><button type="button" data-journey-next aria-label="Capitolo successivo">→</button></div>
    <div class="map-journey-bottom"><div class="map-journey-scope" role="group" aria-label="Estensione del percorso"><button type="button" data-journey-scope="through" aria-pressed="true">Dall’inizio</button><button type="button" data-journey-scope="chapter" aria-pressed="false">Solo il capitolo</button></div><a data-journey-link href="#/cronologia/ebavurage">Leggi il capitolo ↗</a></div>
    <div class="map-journey-description" aria-live="polite"><strong data-journey-where></strong><span data-journey-detail></span></div>
    <p class="map-journey-disclaimer">Tracciato orientativo tra insediamenti noti: non rappresenta le strade effettive né la posizione esatta degli incontri.</p>`;
  frame.insertBefore(journeyPanel, filterbar);
  const journeySelect = journeyPanel.querySelector("[data-journey-select]");
  const journeyPath = (leg) => {
    const a=pointById.get(leg.from), b=pointById.get(leg.to);
    const length=Math.hypot(b.x-a.x,b.y-a.y) || 1;
    const bend=Math.min(24,length*.12);
    const cx=(a.x+b.x)/2-(b.y-a.y)/length*bend;
    const cy=(a.y+b.y)/2+(b.x-a.x)/length*bend;
    return `M ${a.x} ${a.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
  };
  function renderJourney() {
    const chapter=journeyChapters[journeyChapter-1];
    journeySelect.value=String(journeyChapter);
    journeyPanel.querySelector("[data-journey-prev]").disabled=journeyChapter===1;
    journeyPanel.querySelector("[data-journey-next]").disabled=journeyChapter===journeyChapters.length;
    journeyPanel.querySelectorAll("[data-journey-scope]").forEach(btn => btn.setAttribute("aria-pressed",String(btn.dataset.journeyScope===journeyScope)));
    journeyPanel.querySelector("[data-journey-where]").textContent=`${chapter.number} · ${chapter.where}`;
    journeyPanel.querySelector("[data-journey-detail]").textContent=chapter.detail;
    journeyPanel.querySelector("[data-journey-link]").href=`#/cronologia/${chapter.slug}`;
    const legs=journeyLegs.filter(leg=>journeyScope==="through"?leg.chapter<=journeyChapter:leg.chapter===journeyChapter);
    if (journeyVisible) journeyLayer.removeAttribute("hidden"); else journeyLayer.setAttribute("hidden", "");
    const paths=legs.map(leg=>{
      const current=leg.chapter===journeyChapter;
      const d=journeyPath(leg);
      return `<path d="${d}" class="map-journey-outline" style="stroke-width:${(20/zoom).toFixed(2)}"/><path d="${d}" class="map-journey-line${current?' map-journey-line-current':''}" style="stroke-width:${(10/zoom).toFixed(2)};stroke-dasharray:${(17/zoom).toFixed(2)} ${(12/zoom).toFixed(2)}"/>`;
    });
    journeyLayer.innerHTML=paths.join("");
    const reached=new Set(legs.flatMap(leg=>[leg.from,leg.to]));
    const currentPoint=chapter.anchor;
    if (journeyScope==="through" && journeyChapter<=2) reached.add("manna");
    if (currentPoint) reached.add(currentPoint);
    pinButtons.forEach((pin,id)=>{
      pin.classList.toggle("map-pin-journey",journeyVisible && reached.has(id));
      pin.classList.toggle("map-pin-journey-current",journeyVisible && currentPoint===id);
    });
    journeyPanel.classList.toggle("is-route-hidden",!journeyVisible);
  }
  function focusJourney() {
    if(!baseW || !baseH || !journeyVisible)return;
    const chapter=journeyChapters[journeyChapter-1];
    const ids=journeyScope==="chapter"?chapter.focus:[...new Set(journeyChapters.slice(0,journeyChapter).flatMap(c=>c.focus))];
    const positions=ids.map(id=>pointById.get(id)).filter(Boolean);
    if(!positions.length)return;
    const xs=positions.map(p=>p.x),ys=positions.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const zoomX=(viewport.clientWidth-105)/(baseW*((maxX-minX+260)/1536));
    const zoomY=(viewport.clientHeight-95)/(baseH*((maxY-minY+320)/2048));
    zoom=clamp(Math.min(zoomX,zoomY),1.25,3.6);
    dx=-((minX+maxX)/2/1536-.5)*baseW*zoom;
    dy=-((minY+maxY)/2/2048-.5)*baseH*zoom;
    draw();
  }
  on(journeyPanel,"click",e=>{
    const prev=e.target.closest("[data-journey-prev]");
    const next=e.target.closest("[data-journey-next]");
    const scope=e.target.closest("[data-journey-scope]");
    if(prev && journeyChapter>1)journeyChapter--;
    else if(next && journeyChapter<journeyChapters.length)journeyChapter++;
    else if(scope)journeyScope=scope.dataset.journeyScope;
    else return;
    closePopover();renderJourney();focusJourney();
  });
  on(journeySelect,"change",e=>{journeyChapter=Number(e.target.value);closePopover();renderJourney();focusJourney();});
  on(journeyPanel.querySelector("[data-journey-visible]"),"change",e=>{journeyVisible=e.target.checked;renderJourney();if(journeyVisible)focusJourney();});
  const shortlist = document.createElement("div");
  shortlist.className = "map-shortlist";
  shortlist.setAttribute("aria-label", "Seleziona un luogo sulla carta");
  frame.appendChild(shortlist);
  const help = root.querySelector(".map-help");
  if (help) help.innerHTML = '<strong>Come esplorarla:</strong> scegli un filtro o una località, poi tocca un segnaposto per leggerne le informazioni. Usa + e − o la rotella per lo zoom, trascina la carta oppure usa due dita sullo smartphone.';
  const banner = root.querySelector(".info-banner");
  if (banner) banner.innerHTML = '<strong>Una carta, soltanto informazioni note.</strong> I quattro nuovi borghi hanno una collocazione orientativa approvata, distinta dalle città già nominate sulla carta. Tutte le schede mostrano soltanto conoscenze già pubbliche o eventi vissuti dalla compagnia.';

  function visiblePlaces() {
    return mapPoints.filter(place => activeFilter === "all" || place.kind === activeFilter);
  }
  function closePopover() {
    selected = null;
    popover.hidden = true;
    pinButtons.forEach(btn => btn.setAttribute("aria-pressed", "false"));
    shortlist.querySelectorAll("[data-focus-place]").forEach(btn => btn.setAttribute("aria-pressed", "false"));
  }
  function choose(place, center) {
    if (activeFilter !== "all" && !visiblePlaces().includes(place)) setFilter("all");
    selected = place.id;
    const wiki = findWiki(place);
    const kindLabel = place.kind === "regione" ? "Territorio" : "Insediamento";
    const description = wiki?.intro || place.intro || "Località riportata sulla carta di Thespira. Non sono ancora pubblicate altre informazioni nella wiki.";
    const type = wiki?.type || place.type || kindLabel;
    const locationNote = place.approximate ? `<p class="map-position-note">Posizione orientativa: concordata sulla base della geografia e del viaggio della compagnia.</p>` : "";
    popover.innerHTML = `<button type="button" class="map-popover-close" aria-label="Chiudi dettagli">×</button>
      <div class="map-popover-eyebrow">${esc(type)}</div><h3>${esc(place.name)}</h3><p>${esc(description)}</p>
      ${locationNote}${wiki ? `<a class="map-popover-link" href="#/luoghi/${encodeURIComponent(wiki.slug)}">Apri la scheda nell’Atlante →</a>` : '<span class="map-popover-note">Nessuna scheda enciclopedica pubblicata</span>'}`;
    popover.hidden = false;
    pinButtons.forEach((btn,id) => btn.setAttribute("aria-pressed", String(id === place.id)));
    shortlist.querySelectorAll("[data-focus-place]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.focusPlace === place.id)));
    if (center && baseW && baseH) {
      zoom = Math.max(zoom, 1.8);
      dx = -(place.x / 1536 - .5) * baseW * zoom;
      dy = -(place.y / 2048 - .5) * baseH * zoom;
      draw();
    }
  }
  function setFilter(filter) {
    activeFilter = filter;
    const visible = visiblePlaces();
    filterbar.querySelectorAll("[data-filter]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.filter === filter)));
    filterbar.querySelector("output").value = `${visible.length} punti`;
    pinButtons.forEach((btn,id) => { btn.hidden = !visible.some(p => p.id === id); });
    shortlist.innerHTML = `<span class="map-shortlist-title">Sulla carta</span>${visible.map(p => `<button type="button" data-focus-place="${p.id}" aria-pressed="${String(selected === p.id)}">${esc(p.name)}</button>`).join("")}`;
    if (selected && !visible.some(p => p.id === selected)) closePopover();
  }
  on(filterbar, "click", e => {
    const btn = e.target.closest("[data-filter]");
    if (btn) setFilter(btn.dataset.filter);
  });
  on(shortlist, "click", e => {
    const btn = e.target.closest("[data-focus-place]");
    if (btn) {
      const place = mapPoints.find(p => p.id === btn.dataset.focusPlace);
      if (place) choose(place,true);
    }
  });
  on(pinsLayer, "pointerdown", e => {
    if (e.target.closest(".map-pin")) e.stopPropagation();
  });
  on(pinsLayer, "click", e => {
    const btn = e.target.closest(".map-pin");
    if (!btn) return;
    e.stopPropagation();
    const place = mapPoints.find(p => p.id === btn.dataset.pointId);
    if (place) choose(place,false);
  });
  on(popover, "pointerdown", e => e.stopPropagation());
  on(popover, "click", e => {
    if (e.target.closest(".map-popover-close")) closePopover();
  });
  setFilter(window.matchMedia && window.matchMedia("(max-width: 640px)").matches ? "localita" : "all");
  function on(el,type,handler,opts) {el.addEventListener(type,handler,opts);teardown.push(()=>el.removeEventListener(type,handler,opts));}
  function clamp(value, low, high) {return Math.min(high,Math.max(low,value));}
  function constrain() {
    // Prevent panning into empty space while still allowing edge exploration.
    const maxX = Math.max(0,(baseW*zoom-viewport.clientWidth)/2);
    const maxY = Math.max(0,(baseH*zoom-viewport.clientHeight)/2);
    dx=clamp(dx,-maxX,maxX);dy=clamp(dy,-maxY,maxY);
  }
  function draw() {
    constrain();
    img.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;
    journeyLayer.style.transform=img.style.transform;
    // I segnaposti sono disegnati nello spazio dello schermo: rimangono nitidi.
    // Convertiamo le coordinate della carta in pixel del viewport ad ogni zoom/pan.
    const vw=viewport.clientWidth, vh=viewport.clientHeight;
    pinButtons.forEach((btn,id)=>{
      const place=pointById.get(id);
      btn.style.left=`${vw/2 + dx + (place.x/1536 - .5)*baseW*zoom}px`;
      btn.style.top=`${vh/2 + dy + (place.y/2048 - .5)*baseH*zoom}px`;
    });
    viewport.classList.toggle("map-labels-visible",zoom>=2.15);
    // Mantieni uno spessore leggibile per la linea al cambiare dello zoom.
    journeyLayer.querySelectorAll(".map-journey-outline").forEach(p=>p.style.strokeWidth=(20/zoom).toFixed(2));
    journeyLayer.querySelectorAll(".map-journey-line").forEach(p=>{p.style.strokeWidth=(10/zoom).toFixed(2);p.style.strokeDasharray=`${(17/zoom).toFixed(2)} ${(12/zoom).toFixed(2)}`;});
    output.textContent=`${Math.round(zoom*100)}%`;
  }
  function layout() {
    const w=img.naturalWidth || 1536;
    const h=img.naturalHeight || 2048;
    const fit=Math.min(viewport.clientWidth/w,viewport.clientHeight/h);
    baseW=w*fit;baseH=h*fit;
    img.style.width=`${baseW}px`;img.style.height=`${baseH}px`;
    img.style.left=`${(viewport.clientWidth-baseW)/2}px`;
    img.style.top=`${(viewport.clientHeight-baseH)/2}px`;
    for (const layer of [journeyLayer]) {
      layer.style.width=img.style.width;
      layer.style.height=img.style.height;
      layer.style.left=img.style.left;
      layer.style.top=img.style.top;
    }
    draw();
  }
  function zoomTo(value,x=viewport.clientWidth/2,y=viewport.clientHeight/2) {
    const next=clamp(value,MIN,MAX);
    const factor=next/zoom;
    // Keep the selected point (mouse position, or midpoint of fingers) stationary.
    dx=(x-viewport.clientWidth/2)-(x-viewport.clientWidth/2-dx)*factor;
    dy=(y-viewport.clientHeight/2)-(y-viewport.clientHeight/2-dy)*factor;
    zoom=next;draw();
  }
  function reset() {zoom=1;dx=0;dy=0;draw();}
  function point(e) {const r=viewport.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function fingerMetrics() {
    const [a,b]=Array.from(active.values());
    return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,dist:Math.hypot(a.x-b.x,a.y-b.y)};
  }
  on(viewport,"wheel",e=>{e.preventDefault();const p=point(e);zoomTo(zoom*(e.deltaY<0?1.17:1/1.17),p.x,p.y);},{passive:false});
  on(viewport,"dblclick",e=>{e.preventDefault();const p=point(e);zoomTo(zoom*1.55,p.x,p.y);});
  on(viewport,"pointerdown",e=>{
    if(e.pointerType==="mouse" && e.button!==0)return;
    e.preventDefault();viewport.setPointerCapture(e.pointerId);
    active.set(e.pointerId,point(e));
    lastPinch=active.size===2?fingerMetrics():null;
    viewport.classList.add("is-dragging");
  });
  on(viewport,"pointermove",e=>{
    if(!active.has(e.pointerId))return;
    const before=active.get(e.pointerId),now=point(e);active.set(e.pointerId,now);
    if(active.size===1){dx+=now.x-before.x;dy+=now.y-before.y;draw();}
    else if(active.size===2){
      const metrics=fingerMetrics();
      if(lastPinch){
        dx+=metrics.x-lastPinch.x;dy+=metrics.y-lastPinch.y;
        zoomTo(zoom*(metrics.dist/Math.max(1,lastPinch.dist)),metrics.x,metrics.y);
      }
      lastPinch=metrics;
    }
  });
  function pointerEnd(e){active.delete(e.pointerId);lastPinch=active.size===2?fingerMetrics():null;if(!active.size)viewport.classList.remove("is-dragging");}
  on(viewport,"pointerup",pointerEnd);on(viewport,"pointercancel",pointerEnd);on(viewport,"lostpointercapture",pointerEnd);
  on(viewport,"keydown",e=>{
    let handled=true;
    if(e.key==="+"||e.key==="=")zoomTo(zoom*1.25);
    else if(e.key==="-")zoomTo(zoom/1.25);
    else if(e.key==="ArrowLeft")dx+=75;
    else if(e.key==="ArrowRight")dx-=75;
    else if(e.key==="ArrowUp")dy+=75;
    else if(e.key==="ArrowDown")dy-=75;
    else if(e.key==="0")reset();
    else handled=false;
    if(handled){e.preventDefault();draw();}
  });
  let expanded=false;
  const expander=frame.querySelector('[data-map="expand"]');
  function setExpanded(next){expanded=next;frame.classList.toggle("map-expanded",next);document.body.classList.toggle("map-fullscreen",next);expander.setAttribute("aria-pressed",String(next));expander.textContent=next?"Riduci ⤢":"Espandi ⛶";layout();}
  on(frame,"click",e=>{const btn=e.target.closest("[data-map]");if(!btn)return;
    switch(btn.dataset.map){
      case "minus":zoomTo(zoom/1.3);break;
      case "plus":zoomTo(zoom*1.3);break;
      case "reset":reset();break;
      case "expand":setExpanded(!expanded);break;
    }
  });
  on(document,"keydown",e=>{if(e.key==="Escape"&&expanded){e.stopPropagation();setExpanded(false);}});
  on(img,"load",()=>{layout();if(!journeyInitialized){journeyInitialized=true;focusJourney();}});
  const observer=new ResizeObserver(layout);observer.observe(viewport);
  let journeyInitialized=false;
  renderJourney();
  layout();
  if(img.complete && img.naturalWidth>0){journeyInitialized=true;focusJourney();}
  return ()=>{observer.disconnect();teardown.forEach(f=>f());document.body.classList.remove("map-fullscreen");};
}
