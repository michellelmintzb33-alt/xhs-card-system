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
    '--sec':sec,'--secA':rgba(sec,.3),'--secS':rgba(sec,.1),
    '--muted':muted,'--border':border,'--grid':grid,
    // Text accent colors (overridden by randomizeTextAccents)
    '--headline-color':fg,
    '--sub-color':muted,
    '--quote-color':accent,
  };
}

// Randomize text accent colors — called from gen() and explore mode
function randomizeTextAccents(target){
  const g=target||document.getElementById('G');
  if(!g) return;
  const accent=g.style.getPropertyValue('--accent');
  const sec=g.style.getPropertyValue('--sec');
  const fg=g.style.getPropertyValue('--fg');
  const muted=g.style.getPropertyValue('--muted');
  // Headline: 20% accent, 80% default fg
  g.style.setProperty('--headline-color',Math.random()<.2?accent:fg);
  // Subtitle: 60% secondary, 40% muted
  g.style.setProperty('--sub-color',Math.random()<.6?sec:muted);
  // Quote: always accent
  g.style.setProperty('--quote-color',accent);
  // Recolor deco stickers
  recolorDecos(g,accent,sec);
}

function recolorDecos(root,accent,sec){
  const decos=root.querySelectorAll('.card-deco svg');
  decos.forEach((svg,i)=>{
    const color=i%2===0?accent:sec;
    svg.querySelectorAll('[stroke]:not([stroke="none"])').forEach(el=>{
      const s=el.getAttribute('stroke');
      if(s&&s!=='none') el.setAttribute('stroke',color);
    });
    svg.querySelectorAll('[fill]:not([fill="none"])').forEach(el=>{
      const f=el.getAttribute('fill');
      if(f&&f!=='none'&&!f.startsWith('rgba')&&!f.startsWith('url')) el.setAttribute('fill',color);
    });
  });
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
  c12:{headline:'h2',subtitle:'.body12 p',kicker:'.label12',quote:'.bubble'},
  c13:{headline:'h2',subtitle:'.sub13',kicker:'.kicker13',series:'.foot13 .tag13'},
  c14:{headline:'h2'},
  c15:{headline:'h2',subtitle:'.sub15',kicker:'.kicker15',quote:'.quote15',series:'.page15'},
  c23:{headline:'h2',subtitle:'.cln-sub'},
  c24:{headline:'h2',subtitle:'.cln-sub'},
  c25:{headline:'h2',subtitle:'.cln-sub'},
  c26:{headline:'h2',subtitle:'.cln-sub'},
  c27:{headline:'h2',subtitle:'.c27-sub'},
  c28:{headline:'h2',subtitle:'.c28-sub'}
};

// ===== MODULE TOGGLE SYSTEM =====
const MODULE_DEFS = {
  subtitle: { inputId:'f-subtitle', label:'副文案' },
  quote:    { inputId:'f-quote',    label:'金句' },
  kicker:   { inputId:'f-kicker',   label:'标签' },
  author:   { inputId:'f-author',   label:'署名' },
  series:   { inputId:'f-series',   label:'期号' },
};
let _moduleToggles = { subtitle:true, quote:true, kicker:true, author:true, series:true };

function getAvailableModules(){
  const sel = getSelectedTpls();
  const pool = sel.length > 0 ? sel : Object.keys(CONTENT_MAP);
  const avail = new Set();
  pool.forEach(cls => {
    const map = CONTENT_MAP[cls];
    if (!map) return;
    Object.keys(MODULE_DEFS).forEach(k => { if (map[k]) avail.add(k); });
  });
  return avail;
}

function renderModuleToggles(){
  const wrap = document.getElementById('module-toggles');
  const section = document.getElementById('module-section');
  if (!wrap || !section) return;
  const avail = getAvailableModules();
  if (avail.size === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  wrap.innerHTML = '';
  Object.entries(MODULE_DEFS).forEach(([key, def]) => {
    if (!avail.has(key)) return;
    const on = _moduleToggles[key];
    const row = document.createElement('label');
    row.className = 'mod-toggle-row';
    row.innerHTML = `<span class="mod-toggle-label">${def.label}</span><div class="mod-toggle-track${on ? ' on' : ''}"><div class="mod-toggle-thumb"></div></div>`;
    const track = row.querySelector('.mod-toggle-track');
    track.addEventListener('click', () => {
      _moduleToggles[key] = !_moduleToggles[key];
      track.classList.toggle('on', _moduleToggles[key]);
      applyModuleVisibility();
    });
    wrap.appendChild(row);
  });
  applyModuleVisibility();
  updateDecoPanel();
}

function updateDecoPanel(){
  const panel=document.querySelector('.deco-group');
  if(!panel) return;
  const hasSelected=!!document.querySelector('.sblk.selected');
  panel.classList.toggle('visible',hasSelected);
}

function applyModuleVisibility(){
  // Apply to #G (normal mode) and .explore-grid (explore mode)
  const targets=[document.getElementById('G'),document.querySelector('.explore-grid')].filter(Boolean);
  Object.keys(MODULE_DEFS).forEach(key => {
    targets.forEach(t=>t.classList.toggle('mod-hide-' + key, !_moduleToggles[key]));
    const inp = document.getElementById(MODULE_DEFS[key].inputId);
    if (inp) inp.style.display = _moduleToggles[key] ? '' : 'none';
  });
}

function escH(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// --- Title position & size controls ---
function setTitlePos(val){
  const pct=val+'%';
  document.getElementById('G').style.setProperty('--title-top',pct);
  document.getElementById('titlePosVal').textContent=pct;
  const eg=document.querySelector('.explore-grid');
  if(eg) eg.querySelectorAll('.explore-item').forEach(it=>it.style.setProperty('--title-top',pct));
}
function setTitleSize(val){
  const scale=val/100;
  document.getElementById('G').style.setProperty('--title-scale',scale);
  document.getElementById('titleSizeVal').textContent=val+'%';
  const eg=document.querySelector('.explore-grid');
  if(eg) eg.querySelectorAll('.explore-item').forEach(it=>it.style.setProperty('--title-scale',scale));
}

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
const GROUP_A=['c1','c2','c3','c5','c7','c8','c12','c13','c15','c23','c24','c25','c26','c27','c28'];  // text templates
const GROUP_B=['c4','c6','c11'];                        // data templates (fixed info only)
// C9 = mindmap (receives nothing), C10 = checklist (headline only)

function propagateContent(){
  const parsed={
    headline:document.getElementById('f-headline').value,
    subtitle:document.getElementById('f-subtitle').value,
    quote:document.getElementById('f-quote').value
  };
  const fixed={
    kicker:document.getElementById('f-kicker').value,
    author:document.getElementById('f-author').value,
    series:document.getElementById('f-series').value
  };

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

  // C14 checklist — headline only
  const c14=document.querySelector('.card.c14');
  if(c14&&parsed.headline){
    applyField(c14,CONTENT_MAP.c14,'headline',parsed.headline,'c14');
  }

  // C9 mindmap: receives nothing

  // Re-apply keyword highlights after content propagation
  applyKeywordHighlights();
  applyModuleVisibility();
}

// --- Card filter (tag-based) ---
const TEXT_CARDS=['c1','c2','c3','c5','c7','c8','c12','c13','c15','c23','c24','c25','c26','c27','c28'];
const DATA_CARDS=['c4','c6','c9','c10','c11','c14'];
function filterCards(tag,btn){
  document.querySelectorAll('#filterTog .cbtn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.sblk').forEach(blk=>{
    if(tag==='all'){
      blk.classList.remove('filtered-out');
    }else if(tag==='selected'){
      blk.classList.toggle('filtered-out',!blk.classList.contains('selected'));
    }else{
      const tags=(blk.dataset.tags||'').split(',');
      blk.classList.toggle('filtered-out',!tags.includes(tag));
    }
  });
  renderModuleToggles();
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
function debouncedPropagate(){clearTimeout(_contentTimer);_contentTimer=setTimeout(()=>{propagateContent();if(typeof _exploreActive!=='undefined'&&_exploreActive)refreshExploreContent();},150);}

// ===== KEYWORD HIGHLIGHT SYSTEM =====
let _hlA={keywords:[],style:'wave'}; // accent 色
let _hlB={keywords:[],style:'wave'}; // secondary 色
let _hlTimer=null;
function debouncedHighlight(){clearTimeout(_hlTimer);_hlTimer=setTimeout(updateHighlightKeywords,200);}

function updateHighlightKeywords(){
  const rawA=(document.getElementById('f-hl-a')||{}).value||'';
  _hlA.keywords=rawA.split(/[,，\s]+/).map(s=>s.trim()).filter(Boolean);
  const rawB=(document.getElementById('f-hl-b')||{}).value||'';
  _hlB.keywords=rawB.split(/[,，\s]+/).map(s=>s.trim()).filter(Boolean);
  applyKeywordHighlights();
}

function setHlStyle(group,style){
  const hl=group==='b'?_hlB:_hlA;
  hl.style=style;
  document.querySelectorAll(`.hl-style-btn[data-group="${group}"]`).forEach(b=>
    b.classList.toggle('active',b.dataset.hl===style)
  );
  applyKeywordHighlights();
}

function stripHighlights(el){
  el.querySelectorAll('mark.kw-hl-a,mark.kw-hl-b').forEach(mark=>{
    const parent=mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent),mark);
  });
  el.normalize();
}

function applyGroupHighlights(el,keywords,classBase,style){
  if(!keywords.length) return;
  const escaped=keywords.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const patternStr=escaped.join('|');
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);
  const textNodes=[];
  let n;
  while(n=walker.nextNode()) textNodes.push(n);
  textNodes.forEach(tn=>{
    let current=tn;
    while(current&&current.nodeType===Node.TEXT_NODE){
      const regex=new RegExp(patternStr,'i');
      const m=regex.exec(current.textContent);
      if(!m) break;
      const before=current.textContent.slice(0,m.index);
      const matched=current.textContent.slice(m.index,m.index+m[0].length);
      const after=current.textContent.slice(m.index+m[0].length);
      const frag=document.createDocumentFragment();
      if(before) frag.appendChild(document.createTextNode(before));
      const mark=document.createElement('mark');
      mark.className=style==='marker'?classBase+' kw-marker':classBase;
      mark.textContent=matched;
      frag.appendChild(mark);
      const afterNode=after?document.createTextNode(after):null;
      if(afterNode) frag.appendChild(afterNode);
      current.parentNode.replaceChild(frag,current);
      current=afterNode;
    }
  });
}

function applyKeywordHighlights(){
  const hasAny=_hlA.keywords.length||_hlB.keywords.length;
  Object.keys(CONTENT_MAP).forEach(cls=>{
    const cards=document.querySelectorAll(`.card.${cls}`);
    if(!cards.length) return;
    const map=CONTENT_MAP[cls];
    cards.forEach(card=>{
      Object.keys(map).forEach(field=>{
        const el=card.querySelector(map[field]);
        if(!el||el.tagName==='text') return;
        stripHighlights(el);
        if(!hasAny) return;
        applyGroupHighlights(el,_hlA.keywords,'kw-hl-a',_hlA.style);
        applyGroupHighlights(el,_hlB.keywords,'kw-hl-b',_hlB.style);
      });
    });
  });
}

// ===== DEFAULT CONTENT SNAPSHOT / CLEAR / RESTORE =====
let _defaultContent={};

function snapshotDefaults(){
  _defaultContent={};
  Object.keys(CONTENT_MAP).forEach(cls=>{
    const card=document.querySelector(`.card.${cls}`);
    if(!card) return;
    const map=CONTENT_MAP[cls];
    _defaultContent[cls]={};
    Object.keys(map).forEach(field=>{
      const el=card.querySelector(map[field]);
      if(!el) return;
      if(el.tagName==='text'){
        _defaultContent[cls][field]=el.textContent;
      }else{
        _defaultContent[cls][field]=el.innerHTML;
      }
    });
  });
}

function clearTemplateContent(){
  Object.keys(CONTENT_MAP).forEach(cls=>{
    const card=document.querySelector(`.card.${cls}`);
    if(!card) return;
    const map=CONTENT_MAP[cls];
    Object.keys(map).forEach(field=>{
      const el=card.querySelector(map[field]);
      if(!el) return;
      if(el.tagName==='text'){
        el.textContent='';
        return;
      }
      // C8 headline: preserve wave-ul SVG
      if(cls==='c8'&&field==='headline'){
        const svg=el.querySelector('svg.wave-ul');
        el.innerHTML='';
        if(svg) el.appendChild(svg);
        return;
      }
      // C3 quote (.ps): preserve .qm and .by
      if(cls==='c3'&&field==='quote'){
        const qm=el.querySelector('.qm');
        const by=el.querySelector('.by');
        el.innerHTML='';
        if(qm) el.appendChild(qm);
        if(by) el.appendChild(by);
        return;
      }
      el.innerHTML='';
    });
  });
}

function restoreDefaults(){
  Object.keys(CONTENT_MAP).forEach(cls=>{
    const card=document.querySelector(`.card.${cls}`);
    if(!card) return;
    const map=CONTENT_MAP[cls];
    const snap=_defaultContent[cls];
    if(!snap) return;
    Object.keys(map).forEach(field=>{
      const el=card.querySelector(map[field]);
      if(!el||snap[field]===undefined) return;
      if(el.tagName==='text'){
        el.textContent=snap[field];
      }else{
        el.innerHTML=snap[field];
      }
    });
    card.classList.remove('has-content','ghost-hide','ghost-show');
  });
  // Clear all left panel inputs
  ['f-headline','f-subtitle','f-quote','f-kicker','f-author','f-series','f-hl-a','f-hl-b'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  _hlA={keywords:[],style:'wave'};
  _hlB={keywords:[],style:'wave'};
  setHlStyle('a','wave');
  setHlStyle('b','wave');
  // Reset module toggles
  Object.keys(_moduleToggles).forEach(k=>{ _moduleToggles[k]=true; });
  renderModuleToggles();
  // Reset title sliders
  const posSlider=document.getElementById('f-title-pos');
  if(posSlider){posSlider.value=35;setTitlePos(35);}
  const sizeSlider=document.getElementById('f-title-size');
  if(sizeSlider){sizeSlider.value=100;setTitleSize(100);}
}

// ===== SELECT & DELETE UI =====
function injectSelectUI(){
  document.querySelectorAll('.sblk').forEach(blk=>{
    const stag=blk.querySelector('.stag');
    if(!stag)return;
    // Delete button
    const del=document.createElement('button');
    del.className='tpl-del';
    del.textContent='\u2715';
    del.addEventListener('click',function(e){
      e.stopPropagation();
      blk.classList.add('removed');
    });
    stag.appendChild(del);
  });
}

function restoreRemoved(){
  document.querySelectorAll('.sblk.removed').forEach(blk=>blk.classList.remove('removed'));
}

function getSelectedTpls(){
  return Array.from(document.querySelectorAll('.sblk.selected')).map(b=>b.dataset.tpl).filter(Boolean);
}

function setSelectedTpls(ids){
  document.querySelectorAll('.sblk').forEach(blk=>{
    const tpl=blk.dataset.tpl;
    const chk=blk.querySelector('.tpl-check input');
    if(ids.includes(tpl)){
      blk.classList.add('selected');
      if(chk)chk.checked=true;
    }else{
      blk.classList.remove('selected');
      if(chk)chk.checked=false;
    }
  });
  renderModuleToggles();
  if(typeof updateBatchBtn==='function')updateBatchBtn();
}

function clearSelections(){
  document.querySelectorAll('.sblk').forEach(blk=>{
    blk.classList.remove('selected','removed');
    const chk=blk.querySelector('.tpl-check input');
    if(chk)chk.checked=false;
  });
  renderModuleToggles();
  if(typeof updateBatchBtn==='function')updateBatchBtn();
}
