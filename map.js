/* Visualizzatore della cartografia di Thespira.
 * Nessun punto sensibile pubblicato: i segnaposti verranno aggiunti
 * solo quando il DM approverà posizioni e informazioni divulgabili.
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
