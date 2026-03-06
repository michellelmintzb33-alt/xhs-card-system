// ===== COLOR UTILITIES =====
const h2r=h=>{h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return{r:parseInt(h.substr(0,2),16),g:parseInt(h.substr(2,2),16),b:parseInt(h.substr(4,2),16)};};
const r2h=(r,g,b)=>'#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');
const lum=h=>{const{r,g,b}=h2r(h);return(.299*r+.587*g+.114*b)/255;};
const mix=(a,b,t)=>{const c=h2r(a),d=h2r(b);return r2h(c.r+(d.r-c.r)*t,c.g+(d.g-c.g)*t,c.b+(d.b-c.b)*t);};
const rgba=(h,a)=>{const{r,g,b}=h2r(h);return`rgba(${r},${g},${b},${a})`;};
const hsl2hex=(h,s,l)=>{s/=100;l/=100;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return'#'+f(0)+f(8)+f(4);};
const randInt=(a,b)=>Math.floor(a+Math.random()*(b-a+1));

// Derive: all cards use SAME bg, accent/sec clearly separated
function derive(bg,accent,sec,txt){
  sec=sec||accent;
  const dk=lum(bg)<.45;
  const fg=txt||(dk?'#f0f0f0':'#111111');
  const muted=dk?mix(bg,'#ffffff',.3):mix(bg,'#000000',.38);
  const border=dk?mix(bg,'#ffffff',.1):mix(bg,'#000000',.1);
  const grid=dk?rgba('#ffffff',.035):rgba('#000000',.06);
  return{
    '--bg':bg,'--fg':fg,
    '--accent':accent,'--accentA':rgba(accent,.3),'--accentS':rgba(accent,.12),
    '--sec':sec,'--secS':rgba(sec,.1),
    '--muted':muted,'--border':border,'--grid':grid,
  };
}

function applyV(v){
  const g=document.getElementById('G');
  Object.entries(v).forEach(([k,val])=>{g.style.setProperty(k,val);});
  // Donut: sec for filled, accent for remainder
  document.getElementById('donut').style.background=`conic-gradient(${v['--sec']} 0deg 300deg, ${v['--accent']} 300deg 360deg)`;
  // Image zone gradient (C7)
  const{r,g:gg,b}=h2r(v['--sec']);
  const izEl=document.getElementById('iz');
  izEl.style.background=`radial-gradient(ellipse at 60% 40%,rgba(${r},${gg},${b},.12) 0%,${v['--bg']} 70%)`;
  // Legend swatches
  document.getElementById('leg-bg').style.background=v['--bg'];
  document.getElementById('leg-accent').style.background=v['--accent'];
  document.getElementById('leg-sec').style.background=v['--sec'];
}

// ===== CONTENT MAP =====
const CONTENT_MAP={
  c1:{headline:'h2',subtitle:'.sub',kicker:'.top .tag',series:'.iss'},
  c2:{headline:'h2',subtitle:'.c2sub',kicker:'.sb span:not(.dot)',series:'.bt'},
  c3:{headline:'.hl2',subtitle:'.dk',kicker:'.kk',quote:'.ps',author:'.ps .by',series:'.mh .dt'},
  c4:{subtitle:'.cp',kicker:'.tg',series:'.ft span:last-child'},
  c5:{headline:'.hl3',subtitle:'.dk',kicker:'.kk',author:'.bs2 .au',series:'.vol'},
  c6:{headline:'.tt',subtitle:'.ins',kicker:'.tg',series:'.ft span:last-child'},
  c7:{headline:'.iz .ot .bg2',subtitle:'.bt3',kicker:'.iz .ot .sm',series:'.cr .lb2'},
  c8:{headline:'h2',subtitle:'.sub',kicker:'.tag8'},
  c9:{headline:'svg text[y="226"]'},
  c10:{headline:'h2'},
  c11:{headline:'h2',subtitle:'p:not([class])',kicker:'.tag11',series:'.note11'},
  c12:{headline:'h2',subtitle:'.body12 p',kicker:'.label12',quote:'.bubble'}
};

// --- Auto-split raw text into headline / subtitle / quote ---
function parseContent(text){
  if(!text.trim()) return {headline:'',subtitle:'',quote:''};
  const lines=text.split(/\n+/).map(l=>l.trim()).filter(Boolean);

  if(lines.length===1){
    const sents=lines[0].split(/(?<=[。！？!?；;])\s*/).filter(Boolean);
    if(sents.length>=3) return {headline:sents[0],subtitle:sents[1],quote:sents.slice(2).join('')};
    if(sents.length===2) return {headline:sents[0],subtitle:sents[1],quote:''};
    return {headline:lines[0],subtitle:'',quote:''};
  }
  if(lines.length===2) return {headline:lines[0],subtitle:lines[1],quote:''};
  return {headline:lines[0],subtitle:lines[1],quote:lines.slice(2).join('\n')};
}

function updatePreview(parsed){
  const el=document.getElementById('parsePreview');
  if(!el) return;
  if(!parsed.headline&&!parsed.subtitle&&!parsed.quote){el.innerHTML='';return;}
  const parts=[];
  if(parsed.headline) parts.push('<span class="parse-label">标题:</span> <span>"'+escH(parsed.headline)+'"</span>');
  if(parsed.subtitle) parts.push('<span class="parse-label">副标:</span> <span>"'+escH(parsed.subtitle)+'"</span>');
  if(parsed.quote) parts.push('<span class="parse-label">金句:</span> <span>"'+escH(parsed.quote.replace(/\n/g,' '))+'"</span>');
  el.innerHTML=parts.join('<br>');
}
function escH(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// --- Unified field writer with special-case handling ---
function applyField(card,map,field,value,cls){
  if(!value||!map[field]) return;
  const el=card.querySelector(map[field]);
  if(!el) return;
  // SVG text
  if(el.tagName==='text'){el.textContent=value;return;}
  // C8 h2: preserve wave-ul SVG child
  if(cls==='c8'&&field==='headline'){
    const svg=el.querySelector('svg.wave-ul');
    el.innerHTML=value.replace(/\n/g,'<br>');
    if(svg)el.appendChild(svg);
    return;
  }
  // C3 quote (.ps): preserve .qm and .by children
  if(cls==='c3'&&field==='quote'){
    const qm=el.querySelector('.qm');
    const by=el.querySelector('.by');
    el.innerHTML='';
    if(qm)el.appendChild(qm);
    el.appendChild(document.createTextNode(value));
    return;
  }
  // C3 author (.ps .by): just set text
  if(cls==='c3'&&field==='author'){
    el.textContent=value;
    return;
  }
  // C2 headline: highlight end portion — Chinese punctuation split, fallback to last ~4 chars
  if(cls==='c2'&&field==='headline'){
    const text=value.replace(/\n/g,'<br>');
    // Try splitting at last Chinese punctuation
    const puncMatch=text.match(/^(.*[。！？!?，、])(.+)$/s);
    if(puncMatch){
      el.innerHTML=puncMatch[1]+'<span class="hl">'+puncMatch[2]+'</span>';
      return;
    }
    // Try splitting at last space (English fallback)
    const spaceMatch=text.match(/^(.+\s)(\S+)$/s);
    if(spaceMatch){
      el.innerHTML=spaceMatch[1]+'<span class="hl">'+spaceMatch[2]+'</span>';
      return;
    }
    // No punctuation, no space: highlight last ~4 chars of last line
    const lines=text.split('<br>');
    const last=lines[lines.length-1];
    if(last.length>4){
      lines[lines.length-1]=last.slice(0,-4)+'<span class="hl">'+last.slice(-4)+'</span>';
    }else{
      lines[lines.length-1]='<span class="hl">'+last+'</span>';
    }
    el.innerHTML=lines.join('<br>');
    return;
  }
  // Default
  el.innerHTML=value.replace(/\n/g,'<br>');
}

// --- Content distribution by template group ---
const GROUP_A=['c1','c2','c3','c5','c7','c8','c12'];  // text templates
const GROUP_B=['c4','c6','c11'];                        // data templates (fixed info only)
// C9 = mindmap (receives nothing), C10 = checklist (headline only)

function propagateContent(){
  const raw=document.getElementById('f-main').value;
  const parsed=parseContent(raw);
  const fixed={
    kicker:document.getElementById('f-kicker').value,
    author:document.getElementById('f-author').value,
    series:document.getElementById('f-series').value
  };

  updatePreview(parsed);

  const hasContent=!!parsed.headline;

  // A group: text templates — receive parsed + fixed
  GROUP_A.forEach(cls=>{
    const card=document.querySelector(`.card.${cls}`);
    if(!card) return;
    const map=CONTENT_MAP[cls];
    applyField(card,map,'headline',parsed.headline,cls);
    applyField(card,map,'subtitle',parsed.subtitle,cls);
    applyField(card,map,'quote',parsed.quote,cls);
    applyField(card,map,'author',fixed.author,cls);
    applyField(card,map,'kicker',fixed.kicker,cls);
    applyField(card,map,'series',fixed.series,cls);
    // Ghost: toggle has-content + apply current ghost mode
    card.classList.toggle('has-content',hasContent);
    card.classList.remove('ghost-hide','ghost-show');
    if(hasContent&&ghostMode==='hide') card.classList.add('ghost-hide');
    else if(hasContent&&ghostMode==='show') card.classList.add('ghost-show');
  });

  // B group: data templates — only fixed (kicker + series)
  GROUP_B.forEach(cls=>{
    const card=document.querySelector(`.card.${cls}`);
    if(!card) return;
    const map=CONTENT_MAP[cls];
    applyField(card,map,'kicker',fixed.kicker,cls);
    applyField(card,map,'series',fixed.series,cls);
  });

  // C group: C10 checklist — headline only
  const c10=document.querySelector('.card.c10');
  if(c10&&parsed.headline){
    applyField(c10,CONTENT_MAP.c10,'headline',parsed.headline,'c10');
  }

  // C9 mindmap: receives nothing
}

// --- Card filter (tag-based) ---
const TEXT_CARDS=['c1','c2','c3','c5','c7','c8','c12'];
const DATA_CARDS=['c4','c6','c9','c10','c11'];
function filterCards(tag,btn){
  document.querySelectorAll('#filterTog .cbtn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.sblk').forEach(blk=>{
    if(tag==='all'){
      blk.classList.remove('filtered-out');
    }else{
      const tags=(blk.dataset.tags||'').split(',');
      blk.classList.toggle('filtered-out',!tags.includes(tag));
    }
  });
}

// --- Ghost system ---
let ghostMode='blur';
function setGhost(mode,btn){
  ghostMode=mode;
  document.querySelectorAll('#ghostTog .cbtn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.card.has-content').forEach(card=>{
    card.classList.remove('ghost-hide','ghost-show');
    if(mode==='hide') card.classList.add('ghost-hide');
    else if(mode==='show') card.classList.add('ghost-show');
  });
}

let _contentTimer=null;
function debouncedPropagate(){clearTimeout(_contentTimer);_contentTimer=setTimeout(propagateContent,150);}
