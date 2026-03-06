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
