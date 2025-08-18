/***** DATA *****/
const NATIONAL_AVG = 32; // % CAN (at/above proficient)
const NAEP = {
  AL: 28.3, AK: 24.4, AZ: 31.4, AR: 29.7, CA: 31.0, CO: 37.6, CT: 34.6,
  DE: 25.3, DC: 26.5, FL: 39.0, GA: 31.5, HI: 35.2, ID: 31.9, IL: 33.3,
  IN: 32.9, IA: 33.0, KS: 30.5, KY: 31.1, LA: 28.3, ME: null, MD: 30.6,
  MA: 42.6, MI: 28.3, MN: 32.2, MS: 30.6, MO: 30.3, MT: 33.7, NE: 34.0,
  NV: 26.9, NH: 37.0, NJ: 38.0, NM: 21.0, NY: 29.6, NC: 32.3, ND: 31.0,
  OH: 34.5, OK: 24.0, OR: 28.0, PA: 34.0, RI: 33.8, SC: 32.5, SD: 32.4,
  TN: 30.2, TX: 29.9, UT: 36.8, VT: 33.6, VA: 31.8, WA: 33.7, WV: 22.3,
  WI: 32.6, WY: 38.3,
};
const STATE_NAMES = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",
  ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",
  MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",
  NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",
  PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",
  TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",
  WI:"Wisconsin",WY:"Wyoming"
};
const K12_SPENDING = [
  ["Alabama",13461],["Alaska",21996],["Arizona",10090],["Arkansas",13258],["California",18020],
  ["Colorado",16410],["Connecticut",25023],["Delaware",18203],["District of Columbia",18272],
  ["Florida",12415],["Georgia",14660],["Hawaii",19719],["Idaho",9387],["Illinois",21829],
  ["Indiana",14162],["Iowa",16021],["Kansas",16594],["Kentucky",15337],["Louisiana",13760],
  ["Maine",19310],["Maryland",19818],["Massachusetts",24359],["Michigan",16208],["Minnesota",18057],
  ["Mississippi",12394],["Missouri",14703],["Montana",15500],["Nebraska",16643],["Nevada",12229],
  ["New Hampshire",21898],["New Jersey",26558],["New Mexico",14687],["New York",33437],
  ["North Carolina",12352],["North Dakota",18486],["Ohio",16687],["Oklahoma",11349],["Oregon",19376],
  ["Pennsylvania",21441],["Rhode Island",21051],["South Carolina",14884],["South Dakota",13636],
  ["Tennessee",12431],["Texas",14257],["Utah",9977],["Vermont",26974],["Virginia",16445],
  ["Washington",20748],["West Virginia",15356],["Wisconsin",16744],["Wyoming",20159],
].sort((a,b)=>b[1]-a[1]);

/***** UTILS *****/
const COLORS = ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"];
const PROF_THRESHOLDS = [25,30,32,35,40];
const CANT_THRESHOLDS = [60,65,68,70,75];
const SPEND_THRESHOLDS = [12000,15000,18000,21000,24000,30000];

function thresholdScale(domain, range){
  return (x)=>{
    if (x==null || isNaN(+x)) return "#e5e7eb";
    for (let i=0;i<domain.length;i++) if (+x < domain[i]) return range[i];
    return range[range.length-1];
  };
}
const profColor = thresholdScale(PROF_THRESHOLDS, [...COLORS].reverse());
const cantColor = thresholdScale(CANT_THRESHOLDS, COLORS);
const spendColor = thresholdScale(SPEND_THRESHOLDS, COLORS);

/***** HEADER: highlight “can’t read” on load *****/
(function highlightCantRead(){
  const h2 = document.querySelector(".hero__title");
  if (!h2) return;
  const txt = h2.textContent;
  const target = /can't read/i;
  if (!target.test(txt)) return;
  h2.innerHTML = txt.replace(target, (m)=>`<span class="hl">${m}<span class="sweep" aria-hidden="true"></span></span>`);
  // trigger sweep after a tick
  requestAnimationFrame(()=> document.documentElement.classList.add("animate-hl"));
})();

/***** NATIONAL DONUT (slower) *****/
(function initPie(){
  const can = Math.max(0, Math.min(100, NATIONAL_AVG));
  const cant = 100 - can;
  const svg = document.getElementById("donut");
  if (!svg) return;

  // update chips (these will be moved under pictogram; not duplicated)
  const canEl = document.getElementById("canVal");   if (canEl)  canEl.textContent = can + "%";
  const cantEl = document.getElementById("cantVal"); if (cantEl) cantEl.textContent = cant + "%";

  const css = getComputedStyle(document.documentElement);
  const ACCENT = (css.getPropertyValue("--accent") || "#a50f15").trim();
  const NEUTRAL = (css.getPropertyValue("--ok") || "#9ca3af").trim();

  const NS = "http://www.w3.org/2000/svg";
  const make = (n,a)=>{ const el=document.createElementNS(NS,n); for(const k in a) el.setAttribute(k,a[k]); return el; };

  const W=160,H=160,cx=80,cy=80,r=56,th=18;
  svg.innerHTML = "";
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  svg.appendChild(make("title",{})).textContent = "Grade 4 reading (national)";
  svg.appendChild(make("desc",{})).textContent = `${cant}% can't read at grade level; ${can}% can.`;

  svg.appendChild(make("circle",{cx,cy,r,fill:"none","stroke-width":th,stroke:"#0f1115"}));

  const C = 2*Math.PI*r;
  const cantLen = (cant/100)*C;

  const canArc = make("circle",{cx,cy,r,fill:"none","stroke-width":th,"stroke-linecap":"butt",transform:`rotate(-90 ${cx} ${cy})`});
  canArc.style.stroke = NEUTRAL; canArc.style.opacity = "0.35";
  canArc.setAttribute("stroke-dasharray", `${C}`);
  canArc.setAttribute("stroke-dashoffset", "0");
  svg.appendChild(canArc);

  const cantArc = make("circle",{cx,cy,r,fill:"none","stroke-width":th,"stroke-linecap":"butt",transform:`rotate(-90 ${cx} ${cy})`});
  cantArc.style.stroke = ACCENT;
  cantArc.setAttribute("stroke-dasharray", `${C}`);
  cantArc.setAttribute("stroke-dashoffset", `${C}`);
  svg.appendChild(cantArc);

  const big = make("text",{x:cx,y:cy+6,"text-anchor":"middle","font-size":"38","font-weight":"800",fill:"#fff"}); big.textContent="0%";
  const sub = make("text",{x:cx,y:cy+28,"text-anchor":"middle","font-size":"16",fill:"#d1d5db","letter-spacing":"0.06em"}); sub.textContent="CAN'T READ";
  svg.appendChild(big); svg.appendChild(sub);

  function animate(){
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce){ cantArc.setAttribute("stroke-dashoffset", String(C - cantLen)); big.textContent = cant + "%"; return; }
    const dur = 4000; // slower
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    function tick(now){
      const t = Math.min(1, (now - start)/dur);
      const p = ease(t);
      cantArc.setAttribute("stroke-dashoffset", String(C - cantLen * p));
      big.textContent = Math.round(cant * p) + "%";
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(([e],obs)=>{ if(e && e.isIntersecting){ animate(); obs.disconnect(); } }, {threshold:0.4});
  io.observe(svg);
})();

/***** HUMAN PICTOGRAM — Option C (stick figure) + slower stagger + legend under pic only *****/
(function initHumanPictogram(){
  const grid  = document.querySelector(".panel--dark .nx-grid");
  const left  = document.querySelector(".panel--dark .nx-grid .nx-copy");
  if (!grid || !left) return;

  // Remove any previous legend-bottom (hot reload safety)
  document.querySelectorAll(".legend-bottom").forEach(n=>n.remove());

  // capture & remove any stray legends within grid
  left.querySelectorAll(".key-bullets, .chips").forEach(n=>n.remove());

  const can = Math.max(0, Math.min(100, NATIONAL_AVG));
  const cant = 100 - can;
  const cantCount = Math.round(cant);

  const css = getComputedStyle(document.documentElement);
  const ACCENT  = (css.getPropertyValue("--accent") || "#a50f15").trim();
  const NEUTRAL = (css.getPropertyValue("--ok")     || "#9ca3af").trim();

  // Build pictogram container (clear left)
  left.innerHTML = "";
  const wrap = document.createElement("div"); wrap.className="pico-wrap";
  const pic = document.createElement("div");
  pic.className="pictogram-human"; pic.id="pictogramHuman";
  pic.setAttribute("role","img");
  pic.setAttribute("aria-label", `${cant}% can't read at grade level; ${can}% can.`);

  // Stick figure SVG
  function makeHumanSVG(isCant, i){
    const svgNS = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(svgNS,"svg");
    s.setAttribute("viewBox","0 0 100 100"); s.setAttribute("aria-hidden","true");
    s.classList.add("human"); s.style.color = NEUTRAL; s.style.setProperty("--i", i);

    const gHead = document.createElementNS(svgNS,"g"); gHead.setAttribute("fill","currentColor");
    const head = document.createElementNS(svgNS,"circle"); head.setAttribute("cx","50"); head.setAttribute("cy","18"); head.setAttribute("r","10");
    gHead.appendChild(head);

    const gStroke = document.createElementNS(svgNS,"g");
    gStroke.setAttribute("fill","none"); gStroke.setAttribute("stroke","currentColor");
    gStroke.setAttribute("stroke-width","8"); gStroke.setAttribute("stroke-linecap","round"); gStroke.setAttribute("stroke-linejoin","round");
    const spine = document.createElementNS(svgNS,"path"); spine.setAttribute("d","M50 30 V62");
    const armL  = document.createElementNS(svgNS,"path"); armL.setAttribute("d","M50 40 L30 50");
    const armR  = document.createElementNS(svgNS,"path"); armR.setAttribute("d","M50 40 L70 50");
    const legL  = document.createElementNS(svgNS,"path"); legL.setAttribute("d","M50 62 L35 88");
    const legR  = document.createElementNS(svgNS,"path"); legR.setAttribute("d","M50 62 L65 88");
    gStroke.appendChild(spine); gStroke.appendChild(armL); gStroke.appendChild(armR); gStroke.appendChild(legL); gStroke.appendChild(legR);

    s.appendChild(gHead); s.appendChild(gStroke);
    if (isCant) s.classList.add("is-cant");
    return s;
  }

  for (let i=0;i<100;i++) pic.appendChild(makeHumanSVG(i < cantCount, i));
  wrap.appendChild(pic); left.appendChild(wrap);

  // Legend directly UNDER pictogram (left column only)
  const legendHost = document.createElement("div"); legendHost.className="legend-bottom";
  const ul = document.createElement("ul");
  ul.className="key-bullets";
  ul.innerHTML = '<li><span class="key key--cant"></span><strong>CAN\'T</strong> read at grade level</li>'+
                 '<li><span class="key key--can"></span><strong>CAN</strong> read at grade level</li>';
  legendHost.appendChild(ul);
  left.appendChild(legendHost);

  // Animate on scroll (slower stagger)
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cells = pic.querySelectorAll(".human");
  function runAnim(){
    cells.forEach((cell, j)=>{
      const delay = j * 40; // slower stagger
      if (reduce){
        cell.style.animation = "none";
        cell.style.color = cell.classList.contains("is-cant") ? ACCENT : NEUTRAL;
        return;
      }
      if (cell.classList.contains("is-cant")){
        cell.classList.add("pop");
        cell.style.animationDelay = delay + "ms";
        setTimeout(()=>{ cell.style.color = ACCENT; }, Math.max(0, delay - 60));
      }else{
        cell.classList.add("fade");
        cell.style.animationDelay = delay + "ms";
        cell.style.color = NEUTRAL;
      }
    });
  }
  const io = new IntersectionObserver(([e],obs)=>{ if(e && e.isIntersecting){ runAnim(); obs.disconnect(); } }, {threshold:0.3});
  io.observe(pic);
})();

/***** GEOGRAPHIC MAP *****/
(function wireGeoMap(){
  const container = document.getElementById("mapContainer");
  const tooltip = document.getElementById("tooltip");
  const holder = document.getElementById("map");
  if (!container || !tooltip || !holder) return;

  fetch("image/us-map.svg")
    .then(r => r.text())
    .then(svgText => {
      holder.innerHTML = svgText;
      const svg = holder.querySelector("svg");
      if (!svg) return;
      svg.id = "usMap";
      svg.removeAttribute("width");
      svg.removeAttribute("height");

      svg.querySelectorAll("[data-id]").forEach(path => {
        const abbr = path.getAttribute("data-id");
        const val = NAEP[abbr];
        if (val == null) path.classList.add("no-data");
        else path.style.fill = profColor(val);

        path.addEventListener("mouseenter", e => showTip(e, abbr, val));
        path.addEventListener("mousemove", moveTip);
        path.addEventListener("mouseleave", () => { tooltip.hidden = true; });
      });
    });

  function showTip(e, abbr, val){
    const name = STATE_NAMES[abbr] || abbr;
    tooltip.innerHTML = `<div class="tip-title"><strong>${name} (${abbr})</strong></div>` +
      `<div>${val==null?'N/A':'Only '+val.toFixed(1)+'%'} can read at grade level</div>`;
    tooltip.hidden = false;
    moveTip(e);
  }
  function moveTip(e){
    const rect = container.getBoundingClientRect();
    const x = Math.max(12, Math.min(e.clientX - rect.left + 12, rect.width - 10));
    const y = Math.max(12, Math.min(e.clientY - rect.top - 14, rect.height - 12));
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }
})();

/***** LINE SCRUBBER (shared) *****/
function makeTopLineScrubber(topRatio = 0.7, travelRatio = 0.5) {
  let ticking = false;
  const tracked = new Set();
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  function check() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const lineY = vh * topRatio;
    const travelPx = Math.max(1, vh * travelRatio);
    tracked.forEach(item => {
      const { el, onUpdate } = item;
      const r = el.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < vh;
      if (!onScreen) return;
      const progress = clamp01((lineY - r.top) / travelPx);
      if (progress !== item._last) { item._last = progress; onUpdate && onUpdate(progress); }
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  requestAnimationFrame(check);

  return { observe(el, { onUpdate } = {}) { tracked.add({ el, onUpdate, _last: -1 }); requestAnimationFrame(onScroll); } };
}

/***** CAN'T list (scrub + count-up) *****/
(function buildCantList(){
  const list = document.getElementById("cantList");
  const btn = document.getElementById("toggleCant");
  if (!list || !btn) return;

  const items = Object.entries(NAEP)
    .filter(([,v])=>typeof v === "number")
    .map(([abbr,prof])=>({abbr, cant:+(100-prof).toFixed(1)}))
    .sort((a,b)=>b.cant-a.cant)
    .map((d,i)=>({...d, rank:i+1}));

  let showAll = false;
  render();
  btn.addEventListener("click", ()=>{ showAll = !showAll; render(); });

  function render(){
    const visible = showAll ? items : items.slice(0,5);
    list.innerHTML = "";

    const scrub = makeTopLineScrubber(0.8, 0.35);

    visible.forEach(d=>{
      const li = document.createElement("li");
      li.className = "row";
      li.dataset.pct = Math.max(0, Math.min(100, d.cant));
      li.innerHTML = `
        <div class="rank">#${d.rank}</div>
        <div class="abbr">${d.abbr}</div>
        <div class="bar-wrap">
          <div class="bar" style="width:0%"></div>
          <div class="badge" style="left:0%">0.0%</div>
        </div>
      `;
      list.appendChild(li);

      const barFill = li.querySelector(".bar");
      const badge = li.querySelector(".badge");
      const pct = +li.dataset.pct;
      barFill.style.transition = "none";
      barFill.style.background = cantColor(pct);

      scrub.observe(li, {
        onUpdate: (p) => {
          const w = Math.max(0, Math.min(pct, pct * p)); // 0 → pct
          barFill.style.width = w + "%";
          badge.style.left = Math.min(98, Math.max(6, w)) + "%";
          badge.textContent = w.toFixed(1) + "%";
        }
      });
    });

    btn.textContent = showAll ? "View Less" : "View More";
  }
})();

/***** Spending (full-width wipe + big number) *****/
(function buildSpending(){
  const ul = document.getElementById("spendList");
  const btn = document.getElementById("toggleSpend");
  if (!ul || !btn) return;

  const rows = K12_SPENDING.map(([state,amount],i)=>({ state, amount, rank:i+1, color: spendColor(amount)}));

  let showAll = false;
  render();
  btn.addEventListener("click", ()=>{ showAll = !showAll; render(); });

  function render(){
    const visible = showAll ? rows : rows.slice(0,5);
    ul.innerHTML = "";

    // Spacer + fact
    const TRIGGER = 0.8, TRAVEL = 0.4;
    let spacer = document.getElementById("spendSpacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "spendSpacer";
      Object.assign(spacer.style, {
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(to bottom,#000 0%,#0a0a0a 60%,#111 100%)",
        color:"#fff", textAlign:"center", padding:"32px 16px",
        borderTop:"1px solid rgba(255,255,255,0.06)"
      });
      spacer.innerHTML = `
        <div style="max-width:960px;">
          <div style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin-bottom:10px;">
            Annual K–12 Education Spending (U.S.)
          </div>
          <div style="font-weight:800;line-height:1;letter-spacing:-.02em;">
            <span id="eduBigNumber" style="font-size:clamp(40px,7vw,96px);color:#a50f15;"></span>
          </div>
        </div>`;
      ul.parentNode.insertBefore(spacer, ul.nextSibling);
    }
    function sizeSpacer(){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      spacer.style.height = Math.ceil(vh * TRAVEL) + "px";
    }
    sizeSpacer();
    window.addEventListener("resize", sizeSpacer, { passive:true });

    (function attachCountUp(){
      const target = 857_200_000_000;
      const el = spacer.querySelector("#eduBigNumber");
      if (!el) return;
      let started = false;
      const ease = t => 1 - Math.pow(1 - t, 3);
      function animate(){
        const duration = 3000;
        const start = performance.now();
        function tick(now){
          const t = Math.min(1, (now - start)/duration);
          const val = Math.round(target * ease(t));
          el.textContent = "$" + val.toLocaleString("en-US");
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      const io = new IntersectionObserver(([e],obs)=>{
        if (e.isIntersecting && !started){ started = true; animate(); obs.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(spacer);
    })();

    const scrub = makeTopLineScrubber(TRIGGER, TRAVEL);

    visible.forEach(r=>{
      const li = document.createElement("li"); li.className="spend-row";
      const base = document.createElement("div"); base.className="base";

      const wipe = document.createElement("div"); wipe.className="wipe";
      wipe.style.background = r.color;
      wipe.style.transition = "none";
      wipe.style.left = "0"; wipe.style.right = "0"; wipe.style.top = "0"; wipe.style.bottom = "0";
      wipe.style.position = "absolute";
      wipe.style.transformOrigin = "left";
      wipe.style.transform = "scaleX(0)";

      const inner = document.createElement("div"); inner.className="inner";
      inner.innerHTML = `<div><span class="spend-rank">#${r.rank}</span><span class="spend-state">${r.state}</span></div>
                         <div class="spend-amt">${r.amount.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})}</div>`;

      li.appendChild(base); li.appendChild(wipe); li.appendChild(inner);
      ul.appendChild(li);

      scrub.observe(li, { onUpdate: (p) => { wipe.style.transform = `scaleX(${p})`; } });
    });

    btn.textContent = showAll ? "View Less" : "View More";
  }
})();

/***** BOOKS THEY CAN'T READ — auto-scrolling carousel (PLACED BETWEEN MAP & STATES LIST) *****/
(function buildBooksCarousel(){
  // Find the map panel (Grade 4 Reading by State) and insert AFTER it
  const mapPanel = document.getElementById("mapContainer")?.closest(".panel");
  if (!mapPanel) return;

  const section = document.createElement("section");
  section.className = "panel books-panel";
  section.innerHTML = `
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">BOOKS</div>
        <h3 class="section-title">Books They Can’t Read</h3>
      </div>
      <div class="books-rail" aria-label="Scrolling list of popular books">
        <div class="books-track" id="booksTrack"></div>
      </div>
    </div>
    <div class="section-separator"></div>
  `;
  mapPanel.parentNode.insertBefore(section, mapPanel.nextSibling);

  // Placeholder catalog (title + author); cover art fetched via Open Library
  const books = [
    ["Charlotte’s Web","E. B. White"],["The Boxcar Children","Gertrude Chandler Warner"],
    ["Sarah, Plain and Tall","Patricia MacLachlan"],["Little House in the Big Woods","Laura Ingalls Wilder"],
    ["Pippi Longstocking","Astrid Lindgren"],["Mr. Popper’s Penguins","Richard Atwater"],
    ["Stuart Little","E. B. White"],["The Secret Garden","Frances Hodgson Burnett"],
    ["Because of Winn-Dixie","Kate DiCamillo"],["The Tale of Despereaux","Kate DiCamillo"],
    ["Charlie and the Chocolate Factory","Roald Dahl"],["Matilda","Roald Dahl"],
    ["The Wind in the Willows","Kenneth Grahame"]
  ];

  const track = section.querySelector("#booksTrack");
  const rail = section.querySelector(".books-rail");

  const coverCache = new Map();
  async function fetchCoverURL(title, author){
    const key = `${title}|${author}`;
    if (coverCache.has(key)) return coverCache.get(key);
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`;
    try{
      const res = await fetch(url);
      if (res.ok){
        const data = await res.json();
        const id = data?.docs?.[0]?.cover_i;
        if (id) coverCache.set(key, `https://covers.openlibrary.org/b/id/${id}-M.jpg`);
        else coverCache.set(key, null);
      } else {
        coverCache.set(key, null);
      }
    }catch(e){
      coverCache.set(key, null);
    }
    return coverCache.get(key);
  }

  function card([title, author]){
    const el = document.createElement("div");
    el.className = "book-card";
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.textContent = title.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
    const meta = document.createElement("div");
    meta.className = "book-meta";
    meta.innerHTML = `<div class="t">${title}</div><div class="by">by ${author}</div>`;
    el.appendChild(cover); el.appendChild(meta);
    fetchCoverURL(title, author).then(src=>{
      if (src){
        cover.innerHTML = `<img src="${src}" alt="Cover of ${title} by ${author}">`;
      }
    });
    return el;
  }

  // Build two copies for seamless marquee
  const all = [...books, ...books];
  all.forEach(b => track.appendChild(card(b)));

  // Continuous scroll
  let half = 0;
  function setWidth(){ half = track.scrollWidth / 2; }
  setWidth();
  window.addEventListener("resize", setWidth, { passive:true });

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let paused = false;
  rail.addEventListener("mouseenter", ()=> paused = true);
  rail.addEventListener("mouseleave", ()=> paused = false);

  if (!reduce){
    let x = 0;
    const speed = 0.8; // px per frame
    function animate(){
      if (!paused){
        x -= speed;
        if (-x >= half) x += half;
        track.style.transform = `translateX(${x}px)`;
      }
      requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  }
})();

/*** Literacy Stories (Split Scroll) ***/
(function(){
  const wrap = document.getElementById('literacy-stories');
  if(!wrap) return;

  const portrait = document.getElementById('stories-portrait');

  // Parallax on the portrait
  document.addEventListener('scroll', () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    portrait && portrait.style.setProperty('--stories-parallax', y);
  }, { passive: true });

  // Dots navigation
  const dots = wrap.querySelectorAll('.stories-dot');
  dots.forEach(d => d.addEventListener('click', () => {
    const target = document.querySelector(d.dataset.target);
    target && target.scrollIntoView({ behavior:'smooth', block:'start' });
  }));

  // Observe cards for in-view + autoplay/pause + portrait swap
  const cards = wrap.querySelectorAll('.stories-card');
  const videos = wrap.querySelectorAll('.stories-card video');
  videos.forEach(v => {
    const media = v.closest('.stories-media');
    const btn = media && media.querySelector('.stories-play');
    if (btn) {
      btn.addEventListener('click', () => { v.play(); });
    }
    v.addEventListener('play', () => {
      videos.forEach(o => { if (o !== v) o.pause(); });
      media && media.classList.add('playing');
    });
    v.addEventListener('pause', () => {
      media && media.classList.remove('playing');
    });
  });
  let lastBG = '';
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) {
        e.target.classList.add('in-view');

        // Update selected dot
        const id = '#' + e.target.id;
        dots.forEach(dot => {
          (dot.dataset.target === id) ? dot.setAttribute('aria-current','true')
                                      : dot.removeAttribute('aria-current');
        });

        // Crossfade portrait when you have images later
        const url = e.target.getAttribute('data-bg') || '';
        if (portrait && url && url !== lastBG) {
          portrait.style.backgroundImage = `url('${url}')`;
          lastBG = url;
        }

        if (v) {
          try {
            v.muted = false;
            v.play();
          } catch(_){ }
        }
      } else {
        e.target.classList.remove('in-view');
        if (v) { try { v.pause(); } catch(_){} }
      }
    });
  }, { threshold: 0.6 });
  cards.forEach(c => io.observe(c));

  // Init portrait from first card (optional)
  const firstBG = cards[0]?.getAttribute('data-bg');
  if (portrait && firstBG) {
    portrait.style.backgroundImage = `url('${firstBG}')`;
    lastBG = firstBG;
  }
})();
