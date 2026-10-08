/* CRONACHE DI THESPIRA — CONTENUTI PUBBLICI
 * SOLO informazioni che la compagnia conosce. Mai inserire materiale del DM.
 * Per aggiungere un capitolo, pubblicarlo qui e aggiornare published: true.
 */
const CHRONICLES = {
  updated: "08 ottobre 2026",
  current: {
    place: "Ebavurage · Le Due Lanterne",
    subtitle: "A metà giornata, la compagnia esamina l'equipaggiamento della bottega. Nessun acquisto è ancora stato effettuato.",
    next: "Alina ha chiesto agli avventurieri di raggiungere la vecchia fattoria Bellier la notte seguente."
  },
  chapters: [
    {number:"I", slug:"manna", title:"Manna e Lilith-Zetto", region:"Nemorae", published:true, description:"La nascita della compagnia, i rapimenti nelle foreste e una pagina indecifrabile."},
    {number:"II", slug:"reietti", title:"La missione di Selese Arco", region:"Nemorae", published:false, description:"Il Settenario Aureo e l'accampamento dei reietti."},
    {number:"III", slug:"lantrelle", title:"Lantrelle", region:"Nemorae", published:false, description:"L'incontro con Cato Mirel e la missione verso Obsydra."},
    {number:"IV", slug:"brugheroccia", title:"Brugheroccia", region:"Surturheim", published:false, description:"Un'oscura presenza nelle miniere."},
    {number:"V", slug:"obsydra", title:"Obsydra e la Cava", region:"Surturheim", published:false, description:"La ricerca della pagina e il Vecchio Paladino Oscuro."},
    {number:"VI", slug:"paludi", title:"Le paludi di Nemorae", region:"Nemorae", published:false, description:"La via per Roncenoir e la gang di don Batraci."},
    {number:"VII", slug:"roncenoir", title:"Roncenoir", region:"Nemorae", published:false, description:"Giotis Pana, Lethraën e le Grandi Fauci."},
    {number:"VIII", slug:"gola", title:"La strada per Heliara", region:"Nemorae", published:false, description:"Il viaggio e l'incontro con Mercer Berus."},
    {number:"IX", slug:"ebavurage", title:"Ebavurage", region:"Nemorae", published:false, description:"Il borgo, il bestiame massacrato e i sospetti dei suoi abitanti."}
  ],
  people: [
    {slug:"wilhelm-codroipo", name:"Wilhelm Codroipo", role:"Locandiere", where:"Manna", intro:"Gestisce il Cervo Sonnacchioso, la locanda in cui cinque futuri compagni hanno incrociato le proprie strade.", facts:["Durante una serata al Cervo Sonnacchioso, un gruppo di avventori rivolge offese transfobiche a Wilhelm.","Akros, Baldur, Derrick, Orgen e Tomato intervengono nella rissa e allontanano gli aggressori.","Wilhelm ringrazia i cinque offrendo vitto e alloggio."], relations:["manna","cervo-sonnacchioso"]},
    {slug:"margravio", name:"Il Margravio di Manna", role:"Amministratore del villaggio", where:"Manna", intro:"Un ometto pomposo che si presenta come Margravio e si occupa dell'amministrazione di Manna.", facts:["Affida ai sei avventurieri il compito di fermare Lilith-Zetto.","Riferisce che una bambina è stata rapita e che altri bambini scomparsi non sono mai tornati."], relations:["manna"]},
    {slug:"vecchio", name:"Il vecchio della foresta", role:"Identità sconosciuta", where:"Foreste di Nemorae", intro:"Uno sconosciuto dall'aspetto stanco, incontrato durante la ricerca di Lilith-Zetto.", facts:["Dissolve due spaventapasseri animati semplicemente posando loro una mano sulla schiena.","Ospita la compagnia nella propria baracca e fornisce indicazioni per raggiungere la megera.","Dopo la scomparsa lascia a Brann un messaggio: sa del furto della pagina, ma vuole che il kenku la conservi."], relations:["baracca","prima-pagina"]},
    {slug:"lilith-zetto", name:"Lilith-Zetto", role:"Megera Verde · sconfitta", where:"Foreste di Nemorae", intro:"Una Megera Verde responsabile di ripetuti rapimenti di bambini nelle vicinanze di Manna.", facts:["Gli avventurieri la raggiungono nel suo antro dopo aver combattuto alcuni spaventapasseri animati.","La compagnia riesce a sconfiggerla.","La bambina rapita più di recente non può essere salvata."], relations:["antro-megera","manna"]}
  ],
  places: [
    {slug:"manna", name:"Manna", type:"Villaggio", region:"Nemorae", intro:"Insediamento nelle Foreste di Nemorae, dove si sono incontrati i sei membri della compagnia.", facts:["Ospita la locanda del Cervo Sonnacchioso.","È amministrata da un individuo che si presenta come Margravio di Manna.","I suoi abitanti hanno sofferto per i rapimenti compiuti da Lilith-Zetto."], relations:["cervo-sonnacchioso","foreste-nemorae"]},
    {slug:"cervo-sonnacchioso", name:"Il Cervo Sonnacchioso", type:"Locanda", region:"Manna", intro:"Locanda di Wilhelm Codroipo, teatro della rissa che ha riunito i primi cinque avventurieri.", facts:["Tomato vi suona la baggopipa per guadagnarsi vitto e alloggio.","Gli avventori che insultano Wilhelm e Tomato vengono messi alla porta.","Wilhelm offre vitto e alloggio ai cinque che sono intervenuti."], relations:["manna"]},
    {slug:"foreste-nemorae", name:"Foreste di Nemorae", type:"Regione boschiva", region:"Nemorae", intro:"Le vaste foreste attraversate dalla compagnia durante le prime avventure.", facts:["Brann incontra un branco di lupi dopo aver rubato la baggopipa di Tomato.","Gli avventurieri combattono gli spaventapasseri animati durante la ricerca di Lilith-Zetto.","La baracca di un vecchio misterioso e l'antro della megera si trovano al loro interno."], relations:["baracca","antro-megera"]},
    {slug:"baracca", name:"La baracca del vecchio", type:"Abitazione isolata", region:"Foreste di Nemorae", intro:"Rifugio dello sconosciuto che aiuta la compagnia contro gli spaventapasseri.", facts:["La compagnia vi trascorre una notte.","Brann vi trova e sottrae una pagina coperta di simboli incomprensibili.","Al ritorno, il vecchio non c'è più; rimane un messaggio destinato a Brann."], relations:["foreste-nemorae","prima-pagina"]},
    {slug:"antro-megera", name:"L'antro di Lilith-Zetto", type:"Nascondiglio", region:"Foreste di Nemorae", intro:"Il rifugio della Megera Verde, raggiunto dalla compagnia seguendo le indicazioni del vecchio.", facts:["Qui la compagnia affronta e sconfigge Lilith-Zetto.","La bambina rapita non può essere salvata."], relations:["foreste-nemorae"]}
  ],
  discoveries: [
    {slug:"prima-pagina", name:"La prima pagina", type:"Oggetto misterioso", state:"Origine sconosciuta", intro:"Una pagina ricoperta di segni incomprensibili, trovata da Brann nella baracca del vecchio.", facts:["Brann se ne impossessa durante la notte trascorsa nella baracca.","Il vecchio sa del furto e, nel messaggio lasciato prima di scomparire, chiede che sia Brann a conservarla.","Al termine della prima avventura nessuno della compagnia è in grado di interpretarne i simboli."], questions:["Chi ha scritto la pagina?","Che cosa significano i simboli?","Perché il vecchio ha deciso di lasciarla a Brann?"], relations:["baracca","vecchio"]}
  ]
};
