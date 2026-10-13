/* CPS approvati, nell'ordine della prima apparizione nella campagna.
   Morien e altri CPS non pubblicabili sono esclusi dalla galleria. */
window.THESPIRA_ARTBOOK = [
  {slug:'wilhelm-codroipo', name:'Wilhelm Codroipo', src:'assets/artbook/wilhelm-codroipo.png', chapter:'I', chapterTitle:'Manna e Lilith-Zetto'},
  {slug:'selese-arco', name:'Magistra Selese Arco', src:'assets/artbook/selese-arco.png', chapter:'II', chapterTitle:'L’ordine di Selese Arco'},
  {slug:'nero', name:'Nero', src:'assets/artbook/nero.png', chapter:'II', chapterTitle:'L’ordine di Selese Arco'},
  {slug:'cato-mirel', name:'Magistro Cato Mirel', src:'assets/artbook/cato-mirel.png', chapter:'III', chapterTitle:'Il rapporto di Lantrelle'},
  {slug:'mira-voss', name:'Mira Voss', src:'assets/artbook/mira-voss.png', chapter:'V', chapterTitle:'Obsydra e il Vecchio Paladino Oscuro'},
  {slug:'sefra-tre-dita', name:'Sefra Tre-Dita', src:'assets/artbook/sefra-tre-dita.png', chapter:'V', chapterTitle:'Obsydra e il Vecchio Paladino Oscuro'},
  {slug:'paladino-oscuro', name:'Vecchio Paladino Oscuro', src:'assets/artbook/paladino-oscuro.png', chapter:'V', chapterTitle:'Obsydra e il Vecchio Paladino Oscuro'},
  {slug:'don-batraci', name:'don Batraci', src:'assets/artbook/don-batraci.png', chapter:'VI', chapterTitle:'Le paludi di Nemorae'},
  {slug:'giotis-pana', name:'Giotis Pana', src:'assets/artbook/giotis-pana.png', chapter:'VII', chapterTitle:'Roncenoir e le Grandi Fauci'},
  {slug:'lethraen', name:'Lethraën', src:'assets/artbook/lethraen.png', chapter:'VII', chapterTitle:'Roncenoir e le Grandi Fauci'},
  {slug:'mercer-berus', name:'Magistro Mercer Berus', src:'assets/artbook/mercer-berus.png', chapter:'VIII', chapterTitle:'Il Magistro della Gola'},
  {slug:'roland-veyrac', name:'Roland Veyrac', src:'assets/artbook/roland-veyrac.png', chapter:'IX', chapterTitle:'Il mistero di Ebavurage'},
  {slug:'armand-corbet', name:'Armand Corbet', src:'assets/artbook/armand-corbet.png', chapter:'IX', chapterTitle:'Il mistero di Ebavurage'},
  {slug:'alina-veyrac', name:'Alina Veyrac', src:'assets/artbook/alina-veyrac.png', chapter:'IX', chapterTitle:'Il mistero di Ebavurage'}
];
window.renderThespiraArtbook = function () {
  return `<div class="content-wrap"><nav class="breadcrumb" aria-label="Percorso"><a href="#/">Cronache</a><span aria-hidden="true">›</span><span>Artbook</span></nav><div class="eyebrow">CPS Thespira</div><h1 class="page-title">Artbook</h1><p class="page-subtitle">Character Pose Sheets · In ordine di prima apparizione nella campagna</p><section id="artbook-gallery" aria-label="Galleria delle tavole"></section></div>`;
};
window.initThespiraArtbook = function (main) {
  const host = main.querySelector('#artbook-gallery');
  const allowed = new Set(['selese-arco','cato-mirel','mercer-berus','don-batraci','giotis-pana','lethraen','paladino-oscuro','sefra-tre-dita','alina-veyrac','armand-corbet','roland-veyrac','mira-voss','wilhelm-codroipo','nero']);
  const rows = window.THESPIRA_ARTBOOK.filter(r => allowed.has(r.slug) && /^assets\/artbook\/[a-z0-9-]+\.(png|jpg|webp)$/.test(r.src));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if (!rows.length) { host.innerHTML = '<p class="info-banner">Le tavole saranno disponibili prossimamente.</p>'; return; }
  let current = 0;
  // L'indice mantiene l'ordine cronologico ma rende visibili i capitoli.
  const byChapter = [];
  for (const r of rows) {
    let group = byChapter[byChapter.length - 1];
    if (!group || group.chapter !== r.chapter) {
      group = {chapter:r.chapter, title:r.chapterTitle, entries:[]};
      byChapter.push(group);
    }
    group.entries.push({name:r.name, index:rows.indexOf(r)});
  }
  const options = byChapter.map(g => `<optgroup label="Capitolo ${esc(g.chapter)} · ${esc(g.title)}">${g.entries.map(r => `<option value="${r.index}">${esc(r.name)}</option>`).join('')}</optgroup>`).join('');
  host.innerHTML = `<div class="ab-controls"><button type="button" data-prev aria-label="Tavola precedente">←</button><span data-count role="status" aria-live="polite"></span><button type="button" data-next aria-label="Tavola successiva">→</button><label>Tavola <select data-select>${options}</select></label></div><figure class="ab-stage" tabindex="0" aria-label="Tavola: usa le frecce per scorrere"><img data-image alt=""><figcaption data-caption></figcaption></figure><div class="ab-controls"><a data-person class="button-link">Scheda del personaggio →</a><button type="button" data-zoom>Zoom / schermo intero</button><a data-original target="_blank" rel="noopener">Apri originale ↗</a></div><p data-error role="status" hidden>Impossibile caricare la tavola.</p><dialog class="ab-dialog" aria-label="Tavola ingrandita"><div class="ab-controls"><button type="button" data-close>Chiudi</button><label>Zoom <input data-scale type="range" min="100" max="300" step="25" value="100"></label><button type="button" data-full>Schermo intero</button></div><div class="ab-scroll"><img data-large alt=""></div></dialog>`;
  const find = s => host.querySelector(s), img = find('[data-image]'), dialog = find('dialog'), large = find('[data-large]');
  function show(index) {
    current = (index + rows.length) % rows.length;
    const r = rows[current];
    find('[data-error]').hidden = true;
    img.src = r.src; img.alt = `Character Pose Sheet di ${r.name}`;
    find('[data-caption]').textContent = `${r.name} · Capitolo ${r.chapter} — ${r.chapterTitle}`;
    find('[data-count]').textContent = `${current + 1} / ${rows.length}`;
    find('[data-select]').value = String(current);
    find('[data-person]').href = `#/personaggi/${r.slug}`;
    find('[data-original]').href = r.src;
    find('[data-prev]').disabled = find('[data-next]').disabled = rows.length === 1;
  }
  img.onerror = () => { find('[data-error]').hidden = false; };
  find('[data-prev]').onclick = () => show(current-1);
  find('[data-next]').onclick = () => show(current+1);
  find('[data-select]').onchange = e => show(Number(e.target.value));
  find('.ab-stage').onkeydown = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(current+(e.key === 'ArrowRight'?1:-1)); } };
  let start;
  find('.ab-stage').addEventListener('touchstart', e => { start = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY}:null; }, {passive:true});
  find('.ab-stage').addEventListener('touchend', e => { if (!start) return; const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y; if (Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) show(current+(dx<0?1:-1)); start=null; }, {passive:true});
  find('[data-zoom]').onclick = () => { large.src=rows[current].src; large.alt=img.alt; large.style.width='100%'; find('[data-scale]').value='100'; dialog.showModal(); };
  find('[data-scale]').oninput = e => { large.style.width=`${e.target.value}%`; };
  find('[data-close]').onclick = () => dialog.close();
  find('[data-full]').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (dialog.requestFullscreen) await dialog.requestFullscreen(); } catch {} };
  dialog.addEventListener('close', () => { if (document.fullscreenElement === dialog) document.exitFullscreen().catch(()=>{}); });
  show(0);
};
