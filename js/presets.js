// Save system
function loadS(){try{const r=window._sp;if(r)saved=r;}catch(e){}renderC();}
function persistS(){window._sp=saved;}
function openSave(){const m=document.getElementById('modal');const prev=document.getElementById('mprev');const cols=[gS('bg'),gS('accent')];if(cc>=3)cols.push(gS('sec'));if(cc>=4)cols.push(gS('text'));prev.innerHTML=cols.map(c=>`<div class="psw" style="background:${c}"></div>`).join('');document.getElementById('sname').value='';m.classList.add('show');setTimeout(()=>document.getElementById('sname').focus(),100);}
function closeM(){document.getElementById('modal').classList.remove('show');}
function doSave(){const name=document.getElementById('sname').value.trim()||('配色'+(saved.length+1));saved.push({name,bg:gS('bg'),accent:gS('accent'),sec:cc>=3?gS('sec'):null,text:cc>=4?gS('text'):null});persistS();renderC();closeM();}
document.getElementById('sname').addEventListener('keydown',e=>{if(e.code==='Enter'){e.preventDefault();doSave();}});
function delS(i,e){e.stopPropagation();saved.splice(i,1);persistS();if(rStyle===`s-${i}`)setSt('any');renderC();}
function appS(i){const p=saved[i];if(!p)return;sS('bg',p.bg);sS('accent',p.accent);if(p.sec)sS('sec',p.sec);if(p.text)sS('text',p.text);setSt(`s-${i}`);refresh();}
function renderC(){const c=document.getElementById('chips');c.innerHTML=`<button class="chip ${rStyle==='any'?'active':''}" onclick="setSt('any')" data-st="any">随意</button>`;saved.forEach((p,i)=>{const a=rStyle===`s-${i}`;const ch=document.createElement('button');ch.className=`chip ${a?'active':''}`;ch.setAttribute('data-st',`s-${i}`);ch.onclick=()=>appS(i);ch.innerHTML=`<div class="cdot" style="background:linear-gradient(135deg,${p.bg} 33%,${p.accent} 33% 66%,${p.sec||p.accent} 66%)"></div>${p.name}<span class="del" onclick="delS(${i},event)">✕</span>`;c.appendChild(ch);});}

// ===== SERIES SYSTEM =====
const SERIES_KEY='xhs-series';
let seriesList=[];

function loadSeriesList(){
  try{
    const raw=localStorage.getItem(SERIES_KEY);
    if(raw)seriesList=JSON.parse(raw);
  }catch(e){}
  renderSeriesList();
}

function persistSeries(){
  localStorage.setItem(SERIES_KEY,JSON.stringify(seriesList));
}

function openSaveSeries(){
  const m=document.getElementById('seriesModal');
  const prev=document.getElementById('smPrev');
  const cols=[gS('bg'),gS('accent')];
  if(cc>=3)cols.push(gS('sec'));
  if(cc>=4)cols.push(gS('text'));
  prev.innerHTML=cols.map(c=>`<div class="psw" style="background:${c}"></div>`).join('');
  const sel=getSelectedTpls();
  document.getElementById('smCount').textContent=`已选 ${sel.length} 个模板`+(sel.length===0?' (将保存全部)':'');
  document.getElementById('seriesName').value='';
  m.classList.add('show');
  setTimeout(()=>document.getElementById('seriesName').focus(),100);
}

function closeSeriesModal(){
  document.getElementById('seriesModal').classList.remove('show');
}

function doSaveSeries(){
  const sel=getSelectedTpls();
  const allTpls=Array.from(document.querySelectorAll('.sblk[data-tpl]')).map(b=>b.dataset.tpl);
  const templates=sel.length>0?sel:allTpls;
  const name=document.getElementById('seriesName').value.trim()||('系列'+(seriesList.length+1));
  const series={
    name,
    templates,
    colors:{bg:gS('bg'),accent:gS('accent'),sec:cc>=3?gS('sec'):null,text:cc>=4?gS('text'):null},
    colorCount:cc,
    ratio:currentRatio,
    content:{
      main:document.getElementById('f-main').value,
      kicker:document.getElementById('f-kicker').value,
      series:document.getElementById('f-series').value,
      author:document.getElementById('f-author').value,
      data:document.getElementById('f-data').value,
      list:document.getElementById('f-list').value
    }
  };
  seriesList.push(series);
  persistSeries();
  renderSeriesList();
  closeSeriesModal();
}

function loadSeries(idx){
  const s=seriesList[idx];
  if(!s)return;
  // Restore colors
  if(s.colorCount)setCount(s.colorCount);
  sS('bg',s.colors.bg);
  sS('accent',s.colors.accent);
  if(s.colors.sec)sS('sec',s.colors.sec);
  if(s.colors.text)sS('text',s.colors.text);
  refresh();
  // Restore ratio
  if(s.ratio)setRatio(s.ratio);
  // Restore content
  if(s.content){
    if(s.content.main!=null)document.getElementById('f-main').value=s.content.main;
    if(s.content.kicker!=null)document.getElementById('f-kicker').value=s.content.kicker;
    if(s.content.series!=null)document.getElementById('f-series').value=s.content.series;
    if(s.content.author!=null)document.getElementById('f-author').value=s.content.author;
    if(s.content.data!=null)document.getElementById('f-data').value=s.content.data;
    if(s.content.list!=null)document.getElementById('f-list').value=s.content.list;
    propagateContent();
  }
  // Restore template selection + hide unselected
  setSelectedTpls(s.templates);
  document.querySelectorAll('.sblk').forEach(blk=>{
    const tpl=blk.dataset.tpl;
    blk.classList.toggle('filtered-out',!s.templates.includes(tpl));
  });
  // Activate "已选" filter button
  document.querySelectorAll('#filterTog .cbtn').forEach(b=>b.classList.remove('active'));
  const selBtn=document.querySelector('#filterTog .cbtn:last-child');
  if(selBtn)selBtn.classList.add('active');
}

function deleteSeries(idx,e){
  if(e)e.stopPropagation();
  seriesList.splice(idx,1);
  persistSeries();
  renderSeriesList();
}

function renderSeriesList(){
  const el=document.getElementById('seriesList');
  if(!el)return;
  if(!seriesList.length){
    el.innerHTML='<div class="series-empty">暂无保存的系列</div>';
    return;
  }
  el.innerHTML=seriesList.map((s,i)=>{
    const dots=[s.colors.bg,s.colors.accent,s.colors.sec].filter(Boolean)
      .map(c=>`<span class="series-dot" style="background:${c}"></span>`).join('');
    return `<div class="series-item" onclick="loadSeries(${i})">
      <div class="series-info"><div class="series-name">${s.name}</div><div class="series-dots">${dots}<span class="series-tpl-count">${s.templates.length}张</span></div></div>
      <button class="series-del" onclick="deleteSeries(${i},event)">\u2715</button>
    </div>`;
  }).join('');
}

function exportSeries(){
  if(!seriesList.length){return;}
  const blob=new Blob([JSON.stringify(seriesList,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='xhs-series.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importSeries(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const data=JSON.parse(ev.target.result);
      if(Array.isArray(data)){
        seriesList=seriesList.concat(data);
        persistSeries();
        renderSeriesList();
      }
    }catch(err){}
  };
  reader.readAsText(file);
  e.target.value='';
}

// Enter key on series name input
document.getElementById('seriesName').addEventListener('keydown',e=>{if(e.code==='Enter'){e.preventDefault();doSaveSeries();}});
