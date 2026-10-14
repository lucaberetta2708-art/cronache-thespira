/* Visualizzatore della cartografia di Thespira — atlante interattivo, fase I.
 * Segnaposti solo per toponimi leggibili sulla carta originale.
 * Nessuna posizione viene inventata per i luoghi non segnati.
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
  // non coordinate geografiche: solo elementi effettivamente stampati sulla mappa.
  const mapPoints = [
    {id:"lantrelle", name:"Lantrelle", x:660, y:694, kind:"localita", slug:"lantrelle"},
    {id:"obsydra", name:"Obsydra", x:951, y:372, kind:"localita", slug:"obsydra"},
    {id:"heliara", name:"Heliara", x:1001, y:803, kind:"localita", type:"Capitale di Aurelia", intro:"Capitale del Regno di Aurelia, verso la quale è diretta la compagnia."},
    {id:"pyrocladion", name:"Pyrocladion", x:565, y:291, kind:"localita", type:"Città-stato", intro:"Città-stato del Surturheim, già menzionata nel corso del viaggio."},
    {id:"talvaris", name:"Talvaris", x:401, y:1518, kind:"localita"},
    {id:"sargona", name:"Sargona", x:635, y:1634, kind:"localita"},
    {id:"ishkar", name:"Ishkar", x:1247, y:1295, kind:"localita"},
    {id:"nurashad", name:"Nurashad", x:1113, y:1850, kind:"localita"},
    {id:"nemorae", name:"Nemorae", x:452, y:537, kind:"regione", slug:"foreste-nemorae", type:"Grande regione forestale"},
    {id:"surturheim", name:"Surturheim", x:693, y:238, kind:"regione", type:"Regione montuosa settentrionale"},
    {id:"lirion", name:"Fiume Lirion", x:755, y:1162, kind:"acqua", slug:"lirion"}
  ];
  const encyclopedia = (typeof CHRONICLES !== "undefined" && Array.isArray(CHRONICLES.places)) ? CHRONICLES.places : [];
  const wikiBySlug = new Map(encyclopedia.map(entry => [entry.slug, entry]));
  const findWiki = place => place.slug ? wikiBySlug.get(place.slug) : null;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeFilter = "all", selected = null;

  // Il livello dei punti segue esattamente zoom e traslazione della carta;
  // le dimensioni delle icone restano costanti per leggibilità e accessibilità.
  const pinsLayer = document.createElement("div");
  pinsLayer.className = "map-pins-layer";
  pinsLayer.setAttribute("aria-label", "Località indicate sulla carta");
  viewport.appendChild(pinsLayer);
  const pinButtons = new Map();
  for (const place of mapPoints) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `map-pin map-pin-${place.kind}`;
    btn.style.left = `${place.x / 1536 * 100}%`;
    btn.style.top = `${place.y / 2048 * 100}%`;
    btn.dataset.pointId = place.id;
    btn.setAttribute("aria-label", `Apri la scheda cartografica: ${place.name}`);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<span aria-hidden="true">${place.kind === "acqua" ? "≈" : place.kind === "regione" ? "✦" : "◆"}</span><span class="map-pin-tooltip">${esc(place.name)}</span>`;
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
    <button type="button" data-filter="documented" aria-pressed="false">Con scheda</button>
    <button type="button" data-filter="localita" aria-pressed="false">Località</button>
    <button type="button" data-filter="regione" aria-pressed="false">Regioni</button>
    <button type="button" data-filter="acqua" aria-pressed="false">Acque</button></div>
    <output class="map-filter-count" aria-live="polite"></output>`;
  frame.insertBefore(filterbar, viewport);
  const shortlist = document.createElement("div");
  shortlist.className = "map-shortlist";
  shortlist.setAttribute("aria-label", "Seleziona un luogo sulla carta");
  frame.appendChild(shortlist);
  // Altri luoghi incontrati esistono nell'Atlante ma non sono nominati nella carta.
  const unmapped = ["manna", "brugheroccia", "roncenoir", "ebavurage"]
    .map(slug => wikiBySlug.get(slug)).filter(Boolean);
  const withoutCoordinates = document.createElement("div");
  withoutCoordinates.className = "map-unmapped";
  withoutCoordinates.innerHTML = `<strong>Luoghi non segnati sulla carta</strong><p>Questi luoghi sono già nelle Cronache, ma la loro posizione esatta non è indicata nell’illustrazione. Li lasciamo senza segnaposto finché non avremo una collocazione approvata.</p><div class="map-unmapped-links">${unmapped.map(p => `<a href="#/luoghi/${encodeURIComponent(p.slug)}">${esc(p.name)} ↗</a>`).join("")}</div>`;
  frame.insertAdjacentElement("afterend", withoutCoordinates);
  const help = root.querySelector(".map-help");
  if (help) help.innerHTML = '<strong>Come esplorarla:</strong> scegli un filtro o una località, poi tocca un segnaposto per leggerne le informazioni. Usa + e − o la rotella per lo zoom, trascina la carta oppure usa due dita sullo smartphone.';
  const banner = root.querySelector(".info-banner");
  if (banner) banner.innerHTML = '<strong>Una carta, soltanto informazioni note.</strong> I segnaposti si basano sui nomi presenti nella mappa originale. Per i luoghi già documentati puoi aprire direttamente la voce dell’Atlante; non sono indicate posizioni ancora incerte.';

  function visiblePlaces() {
    return mapPoints.filter(place => activeFilter === "all" ||
      (activeFilter === "documented" && !!findWiki(place)) || place.kind === activeFilter);
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
    const kindLabel = place.kind === "regione" ? "Regione" : place.kind === "acqua" ? "Corso d’acqua" : "Località";
    const description = wiki?.intro || place.intro || "Località riportata sulla carta di Thespira. Non sono ancora pubblicate altre informazioni nella wiki.";
    const type = wiki?.type || place.type || kindLabel;
    popover.innerHTML = `<button type="button" class="map-popover-close" aria-label="Chiudi dettagli">×</button>
      <div class="map-popover-eyebrow">${esc(type)}</div><h3>${esc(place.name)}</h3><p>${esc(description)}</p>
      ${wiki ? `<a class="map-popover-link" href="#/luoghi/${encodeURIComponent(wiki.slug)}">Apri la scheda nell’Atlante →</a>` : '<span class="map-popover-note">Nessuna scheda enciclopedica pubblicata</span>'}`;
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
  setFilter(window.matchMedia && window.matchMedia("(max-width: 640px)").matches ? "documented" : "all");
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
    pinsLayer.style.transform=img.style.transform;
    pinButtons.forEach(btn => {btn.style.transform = `translate(-50%, -100%) scale(${1/zoom})`;});
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
    pinsLayer.style.width=img.style.width;
    pinsLayer.style.height=img.style.height;
    pinsLayer.style.left=img.style.left;
    pinsLayer.style.top=img.style.top;
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
  on(img,"load",layout);
  const observer=new ResizeObserver(layout);observer.observe(viewport);
  layout();
  return ()=>{observer.disconnect();teardown.forEach(f=>f());document.body.classList.remove("map-fullscreen");};
}
