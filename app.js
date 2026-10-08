/* Presentazione wiki statica: nessuna libreria e nessun account richiesto ai lettori. */
(() => {
  "use strict";
  const data = CHRONICLES;
  const main = document.getElementById("main-content");
  const menu = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const shade = document.getElementById("mobile-shade");
  const backdrop = document.getElementById("search-backdrop");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  const sections = [
    {collection: "people", path: "personaggi", title: "Personaggi", icon: "♙", caption: "Volti, incontri e legami", plural: "personaggi"},
    {collection: "places", path: "luoghi", title: "Atlante", icon: "⌖", caption: "Luoghi visitati", plural: "luoghi"},
    {collection: "discoveries", path: "scoperte", title: "Scoperte e misteri", icon: "✧", caption: "Indizi e oggetti", plural: "scoperte"}
  ];
  function esc(value) {return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function page(inner) {return `<div class="content-wrap">${inner}</div>`;}
  function breadcrumb(...items) {return `<nav class="breadcrumb" aria-label="Percorso"><a href="#/">Cronache</a>${items.map(x => `<span aria-hidden="true">›</span>${x.href ? `<a href="${x.href}">${esc(x.label)}</a>` : `<span>${esc(x.label)}</span>`}`).join("")}</nav>`;}
  function title(kicker, heading, desc="") {return `<div class="eyebrow">${esc(kicker)}</div><h1 class="page-title">${esc(heading)}</h1>${desc?`<p class="page-subtitle">${esc(desc)}</p>`:""}`;}
  function linkFor(s, obj) {return `#/${s.path}/${obj.slug}`;}
  function getRelation(slug) {
    for (const s of sections) {const found=data[s.collection].find(x=>x.slug===slug);if(found)return {name:found.name,href:linkFor(s,found)};}
    return null;
  }
  function relations(row) {const links=(row.relations||[]).map(getRelation).filter(Boolean);return links.length ? `<h2 class="section-title rule-title">Voci collegate</h2><div class="related">${links.map(x=>`<a href="${x.href}">${esc(x.name)} ↗</a>`).join("")}</div>`:"";}
  function renderHome() {
    const count=data.chapters.filter(x=>x.published).length;
    return page(`<div class="hero"><img src="assets/forest.svg" alt="Illustrazione stilizzata di una foresta immersa nella nebbia"><div class="hero-content"><div class="hero-label">Atlante e memorie di viaggio</div><h1>Le Cronache<br>di Thespira</h1><p>Luoghi, personaggi e avvenimenti di una compagnia la cui storia è ancora in corso.</p></div></div>
      <div class="feature-grid">
        <section class="panel"><div class="note">Da dove tutto ebbe inizio</div><h2>Capitolo I · Manna e Lilith-Zetto</h2><p>Una rissa in locanda, un furto maldestro e un'antica foresta: il primo incontro della compagnia e una pagina destinata a restare un mistero.</p><a class="button-link" href="#/cronologia/manna">Leggi il capitolo <span>→</span></a></section>
        <section class="panel"><div class="note">Ultima situazione nota</div><h2 class="location-now">${esc(data.current.place)}</h2><p>${esc(data.current.subtitle)}</p><p class="subtle">${esc(data.current.next)}</p></section>
      </div>
      <h2 class="section-title rule-title">Esplora l'archivio</h2>
      <div class="tile-grid"><a class="topic-card" href="#/cronologia"><span class="topic-icon">☷</span><strong>Cronologia</strong><small>${data.chapters.length} archi narrativi · ${count} pubblicato</small></a>${sections.map(s=>`<a class="topic-card" href="#/${s.path}"><span class="topic-icon">${s.icon}</span><strong>${esc(s.title)}</strong><small>${esc(s.caption)}</small></a>`).join("")}</div>
      <p class="info-banner">Queste pagine raccolgono soltanto informazioni note alla compagnia. Le voci vengono pubblicate e aggiornate man mano che la cronaca prende forma, senza anticipare i segreti dell'avventura.</p>
      <div class="ornament" aria-hidden="true">✦ ⟡ ✦</div>`);
  }
  function renderTimeline() {
    return page(`${breadcrumb({label:"Cronologia"})}${title("Il viaggio", "Cronologia", "Gli eventi della compagnia, in ordine. I capitoli non ancora consultabili verranno aggiunti progressivamente.")}
      ${data.chapters.map(x=>`<article class="chapter-row"><div class="chapter-number">${esc(x.number)}</div><div class="chapter-text"><div class="region">${esc(x.region)}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div>${x.published?`<a class="button-link" href="#/cronologia/${x.slug}">Leggi →</a>`:`<span class="small-pill pill-soon">In redazione</span>`}</article>`).join("")}
      <p class="info-banner">La successione dei capitoli segue gli avvenimenti giocati, a partire da Manna. Il materiale preparatorio del DM non viene pubblicato.</p>`);
  }
  const ch1Sections = [
    {id:"la-rissa",title:"1. La rissa al Cervo Sonnacchioso", body:`<p>Le strade dei primi cinque membri della compagnia si incrociano a <a href="#/luoghi/manna">Manna</a>, presso il <a href="#/luoghi/cervo-sonnacchioso">Cervo Sonnacchioso</a>, la locanda di <a href="#/personaggi/wilhelm-codroipo">Wilhelm Codroipo</a>.</p><p>Akros raggiunge il villaggio come guida di un gruppo di viaggiatori che gli hanno promesso un compenso. Derrick, Baldur e Orgen vi arrivano separatamente, in cerca di un luogo dove trascorrere la notte. Tomato si esibisce con la propria <strong>baggopipa</strong> per guadagnarsi vitto e alloggio.</p><p>Quando i viaggiatori accompagnati da Akros si rifiutano di pagarlo, insultano la musica di Tomato e rivolgono offese transfobiche a Wilhelm, la situazione degenera. Baldur, fermo sostenitore dei diritti LGBTQ+, reagisce indignato; Derrick disapprova la prepotenza e i modi rozzi degli stranieri. Akros ha già un conto in sospeso, mentre Orgen non esita a scegliere una parte nella rissa.</p><p>I cinque affrontano e cacciano gli aggressori dalla locanda. Wilhelm, riconoscente, offre loro vitto e alloggio. È il primo episodio in cui i futuri compagni agiscono insieme.</p>`},
    {id:"brann",title:"2. L'incontro con Brann", body:`<p>La mattina seguente il kenku Brann Caradoc tenta un maldestro furto della baggopipa di Tomato e fugge nelle <a href="#/luoghi/foreste-nemorae">Foreste di Nemorae</a>.</p><p>Durante la fuga incontra un branco di lupi, dai quali viene salvato dagli altri cinque avventurieri. Per riconoscenza restituisce lo strumento e ritorna a Manna insieme ai propri soccorritori.</p><p><strong>La compagnia conta ora sei membri:</strong> Akros, Baldur Hawthorne, Brann Caradoc, Derrick Bombarrion, Orgen e Tomato Goldenfield.</p>`},
    {id:"margravio",title:"3. L'incarico del Margravio", body:`<p>Tornati a Manna, gli avventurieri incontrano il sedicente <a href="#/personaggi/margravio">Margravio</a>, un ometto pomposo che amministra il villaggio.</p><p>Chiede loro di fermare <a href="#/personaggi/lilith-zetto">Lilith-Zetto</a>, una Megera Verde responsabile di ripetuti rapimenti di bambini nelle foreste vicine. Una bambina è stata rapita di recente; nessuno dei piccoli scomparsi in precedenza è tornato.</p><p>Il gruppo accetta l'incarico e si inoltra nella foresta.</p>`},
    {id:"spaventapasseri",title:"4. Gli spaventapasseri e il vecchio", body:`<p>Durante la ricerca di Lilith-Zetto, la compagnia affronta cinque spaventapasseri animati. Gli avventurieri riescono a sconfiggerne tre, ma altri due stanno sopraggiungendo.</p><p>A questo punto appare uno <a href="#/personaggi/vecchio">sconosciuto dall'aspetto stanco</a>, che dissolve gli ultimi due spaventapasseri con estrema facilità, limitandosi a posare una mano sulle loro schiene.</p><p>Il vecchio fornisce indicazioni per trovare la megera e offre ospitalità nella propria <a href="#/luoghi/baracca">baracca</a>. Durante la notte, Brann trova e sottrae una <a href="#/scoperte/prima-pagina">pagina ricoperta di simboli incomprensibili</a>.</p>`},
    {id:"megera",title:"5. Lo scontro con Lilith-Zetto", body:`<p>La mattina successiva, seguendo le indicazioni ricevute, la compagnia raggiunge <a href="#/luoghi/antro-megera">l'antro della Megera Verde</a>.</p><p>Gli avventurieri affrontano Lilith-Zetto e riescono a sconfiggerla, ponendo fine alla minaccia per Manna. <strong>La bambina rapita, tuttavia, non può essere salvata.</strong></p>`},
    {id:"messaggio",title:"6. Il messaggio del vecchio", body:`<p>Sulla via del ritorno gli avventurieri raggiungono nuovamente la baracca, ma il suo proprietario è scomparso.</p><p>Il vecchio ha lasciato un messaggio per Brann: sa che il kenku ha sottratto la pagina, ma non ne chiede la restituzione. Desidera invece che Brann la conservi.</p><p>La compagnia torna a Manna portando con sé il documento, di cui nessuno conosce ancora l'origine o il significato.</p>`}
  ];
  function renderChapter(slug) {
    if(slug!=="manna")return renderNotFound();
    const sectionsHtml=ch1Sections.map(x=>`<section id="${x.id}"><h2>${x.title}</h2>${x.body}</section>`).join("");
    return page(`${breadcrumb({label:"Cronologia",href:"#/cronologia"},{label:"I · Manna e Lilith-Zetto"})}${title("Capitolo I · Nemorae","Manna e Lilith-Zetto")}
      <div class="meta-line"><span class="small-pill pill-ready">Capitolo pubblicato</span><span class="small-pill">Manna · Foreste di Nemorae</span></div>
      <div class="chapter-lead">La nascita della compagnia, la minaccia di una Megera Verde e il ritrovamento di una pagina indecifrabile.</div>
      <div class="article-layout"><article class="article-body">${sectionsHtml}
      <section class="summary-box" aria-label="Riepilogo del capitolo"><h3>Il capitolo in breve</h3><ul><li>La compagnia si forma a Manna, tra una rissa e un incontro con un branco di lupi.</li><li>Il Margravio incarica gli avventurieri di fermare Lilith-Zetto.</li><li>Il vecchio della foresta li aiuta e Brann sottrae una misteriosa pagina.</li><li>Lilith-Zetto viene sconfitta, ma la bambina rapita non può essere salvata.</li></ul></section>
      <h2 class="section-title rule-title">Da approfondire</h2><div class="related"><a href="#/scoperte/prima-pagina">La prima pagina ↗</a><a href="#/personaggi/vecchio">Il vecchio della foresta ↗</a><a href="#/personaggi/lilith-zetto">Lilith-Zetto ↗</a><a href="#/luoghi/manna">Manna ↗</a></div>
      </article><nav class="toc" aria-label="In questo capitolo"><strong>In questo capitolo</strong>${ch1Sections.map(x=>`<a href="#${x.id}" data-toc="${x.id}">${esc(x.title)}</a>`).join("")}</nav></div>
      <div class="ornament" aria-hidden="true">✦ ⟡ ✦</div>`);
  }
  function renderCollection(s) {
    const items=data[s.collection];
    return page(`${breadcrumb({label:s.title})}${title("L'enciclopedia",s.title,`${items.length} ${s.plural} già documentati. Le voci sono aggiornate soltanto con informazioni conosciute dalla compagnia.`)}
      <div class="card-grid">${items.map(x=>`<a class="entry-card" href="${linkFor(s,x)}"><div class="eyebrow">${esc(x.role||x.type)}</div><h3>${esc(x.name)}</h3><p>${esc(x.intro)}</p><div class="arrow">Apri la scheda →</div></a>`).join("")}</div>
      <p class="info-banner">Le illustrazioni definitive compariranno nelle singole schede: non verranno pubblicati i Character Pose Sheet utilizzati per definire il design dei personaggi.</p>`);
  }
  function renderEntry(s,slug) {
    const item=data[s.collection].find(x=>x.slug===slug);
    if(!item)return renderNotFound();
    const details=s.collection==="people"?[{label:"Ruolo",val:item.role},{label:"Incontrato a",val:item.where}]:s.collection==="places"?[{label:"Categoria",val:item.type},{label:"Regione",val:item.region}]:[{label:"Tipo",val:item.type},{label:"Stato",val:item.state}];
    const facts=item.facts.map(x=>`<li>${esc(x)}</li>`).join("");
    return page(`${breadcrumb({label:s.title,href:`#/${s.path}`},{label:item.name})}${title(s.title,item.name)}
      <div class="profile-top"><div class="profile-symbol" aria-label="Illustrazione non ancora disponibile"><span>${s.icon}</span><small>Ritratto da inserire</small></div><div class="profile-brief"><p>${esc(item.intro)}</p><dl>${details.map(x=>`<dt>${esc(x.label)}</dt><dd>${esc(x.val)}</dd>`).join("")}</dl></div></div>
      <h2 class="section-title rule-title">Cosa sa la compagnia</h2><ul class="fact-list">${facts}</ul>
      ${item.questions?`<h2 class="section-title rule-title">Domande aperte</h2><ul class="fact-list">${item.questions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
      ${relations(item)}<div class="ornament" aria-hidden="true">✦ ⟡ ✦</div>`);
  }
  function renderNotFound() {return page(`${title("Pagina non trovata","Questa voce non è disponibile","Il contenuto potrebbe essere ancora in preparazione.")}<a class="button-link" href="#/">Torna alla panoramica →</a>`);}
  function normalizedHash() {const raw=location.hash.slice(1)||"/";return raw.replace(/^\/+/,"/").split("?")[0].split("#")[0];}
  function navigate() {
    const route=normalizedHash();let html;
    if(route==="/")html=renderHome();
    else if(route==="/cronologia")html=renderTimeline();
    else if(route==="/cronologia/manna")html=renderChapter("manna");
    else {const seg=route.split("/").filter(Boolean);const section=sections.find(x=>x.path===seg[0]);html=section?(seg.length===1?renderCollection(section):seg.length===2?renderEntry(section,seg[1]):renderNotFound()):renderNotFound();}
    main.innerHTML=html;
    const navActive=route==="/"?"#/":route.startsWith("/cronologia/")?"#/cronologia/manna":"#/"+(route.split("/")[1]||"");
    document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x.getAttribute("href")===navActive));
    document.title=(route==="/"?"Cronache di Thespira":(main.querySelector("h1")?.textContent||"Cronache")+" — Cronache di Thespira");
    if (!route.includes("/cronologia/manna")) window.scrollTo(0,0);
    closeMenu();
  }
  function closeMenu(){sidebar.classList.remove("open");shade.hidden=true;menu.setAttribute("aria-expanded","false");}
  menu.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");shade.hidden=!open;menu.setAttribute("aria-expanded",String(open));});
  shade.addEventListener("click",closeMenu);
  function allSearchEntries() {return [
    {name:"Manna e Lilith-Zetto",type:"Capitolo",href:"#/cronologia/manna",description:data.chapters[0].description},
    ...sections.flatMap(s=>data[s.collection].map(x=>({name:x.name,type:s.title,href:linkFor(s,x),description:x.intro,extra:[...(x.facts||[]),...(x.questions||[])].join(" ")})))
  ];}
  function showSearch() {backdrop.hidden=false;searchInput.value="";showResults("");searchInput.focus();document.body.style.overflow="hidden";}
  function hideSearch() {backdrop.hidden=true;document.body.style.overflow="";document.getElementById("search-toggle").focus();}
  function showResults(query) {const term=query.trim().toLocaleLowerCase("it");const matches=allSearchEntries().filter(x=>!term||(x.name+" "+x.type+" "+x.description+" "+(x.extra||"")).toLocaleLowerCase("it").includes(term));
    searchResults.innerHTML=matches.length?matches.slice(0,20).map(x=>`<a class="search-result-link" href="${x.href}"><strong>${esc(x.name)}</strong><small>${esc(x.type)} · ${esc(x.description)}</small></a>`).join(""):`<p class="empty-note">Nessuna voce pubblicata corrisponde alla ricerca.</p>`;
  }
  document.getElementById("search-toggle").addEventListener("click",showSearch);
  document.getElementById("search-close").addEventListener("click",hideSearch);
  searchInput.addEventListener("input",()=>showResults(searchInput.value));
  searchResults.addEventListener("click",e=>{if(e.target.closest("a"))hideSearch();});
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)hideSearch();});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){if(!backdrop.hidden)hideSearch();else closeMenu();}
    else if(e.key==="/"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){e.preventDefault();if(backdrop.hidden)showSearch();}
  });
  // Hash-based route avoids server rewrites and works on GitHub project Pages.
  window.addEventListener("hashchange",()=>{navigate();window.scrollTo({top:0,behavior:"instant"});});
  // TOC uses a normal fragment inside the hash route: '#/cronologia/manna#la-rissa'.
  main.addEventListener("click",e=>{const el=e.target.closest("[data-toc]");if(el){e.preventDefault();const target=document.getElementById(el.dataset.toc);if(target)target.scrollIntoView({behavior:"smooth",block:"start"});}});
  navigate();
})();
