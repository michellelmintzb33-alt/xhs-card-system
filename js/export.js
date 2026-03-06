// ===== EXPORT (html-to-image) =====
let htmlToImage=null;
async function loadHTI(){
  if(htmlToImage)return htmlToImage;
  htmlToImage=await import('https://esm.sh/html-to-image@1.11.13');
  return htmlToImage;
}

function injectExportBtns(){
  document.querySelectorAll('.card').forEach(card=>{
    if(card.querySelector('.export-btn'))return;
    const btn=document.createElement('button');
    btn.className='export-btn';
    btn.textContent='导出 PNG';
    btn.onclick=e=>{e.stopPropagation();exportCard(card,btn);};
    card.appendChild(btn);
  });
}

// Resolve CSS var() in SVG attributes + inline computed backgrounds for html-to-image
function resolveVarsForExport(card){
  const saved=[];
  const cardStyle=getComputedStyle(card);
  // 1) SVG attribute var() → computed value
  card.querySelectorAll('svg *').forEach(el=>{
    ['fill','stroke','stop-color','flood-color','lighting-color'].forEach(attr=>{
      const val=el.getAttribute(attr);
      if(val&&val.includes('var(')){
        saved.push({el,attr,orig:val,type:'svgAttr'});
        const m=val.match(/var\(\s*(--[^,)]+)/);
        if(m)el.setAttribute(attr,cardStyle.getPropertyValue(m[1]).trim()||val);
      }
    });
  });
  // 2) Inline computed background/color on card + all children that use CSS vars
  //    This fixes dotgrid, lined-paper, conic-gradient etc losing var() on export
  [card,...card.querySelectorAll('*')].forEach(el=>{
    const cs=getComputedStyle(el);
    const props=['background','background-image','background-color','color','border-color','border-top-color','border-bottom-color','border-left-color','border-right-color','outline-color'];
    props.forEach(prop=>{
      const cv=cs.getPropertyValue(prop);
      if(cv&&cv!=='none'&&cv!==''){
        // Only inline if the element's stylesheet value actually uses var()
        // We check by seeing if inline style differs from computed
        const inlineVal=el.style.getPropertyValue(prop);
        if(!inlineVal){
          saved.push({el,attr:prop,orig:inlineVal,type:'cssInline'});
          el.style.setProperty(prop,cv);
        }
      }
    });
  });
  return saved;
}
function restoreVarsAfterExport(saved){
  saved.forEach(({el,attr,orig,type})=>{
    if(type==='svgAttr')el.setAttribute(attr,orig);
    else{
      if(orig)el.style.setProperty(attr,orig);
      else el.style.removeProperty(attr);
    }
  });
}

async function exportCard(card,btn){
  const hti=await loadHTI();
  btn.classList.add('loading');btn.textContent='导出中…';
  // Temporarily hide edit outlines and export buttons
  const wasEdit=editMode;
  if(wasEdit)toggleEdit();
  card.querySelectorAll('.export-btn').forEach(b=>b.style.display='none');
  // Inline all CSS var() values for serialization
  const svgSaved=resolveVarsForExport(card);
  try{
    const expW=currentSize?.w||1080;
    const expH=currentSize?.h||1440;
    const previewH=Math.round(360*expH/expW);
    const pxRatio=expW/360;
    const dataUrl=await hti.toPng(card,{pixelRatio:pxRatio,width:360,height:previewH,cacheBust:true,
      filter:n=>!n.classList||!n.classList.contains('export-btn')});
    const link=document.createElement('a');
    const name=card.closest('.sblk')?.querySelector('.stag')?.textContent?.replace(/[^\w\u4e00-\u9fff]/g,'')||'poster';
    link.download=`poster-${name}.png`;
    link.href=dataUrl;
    link.click();
  }catch(err){
    alert('导出失败：'+err.message);
  }finally{
    restoreVarsAfterExport(svgSaved);
    card.querySelectorAll('.export-btn').forEach(b=>b.style.display='');
    btn.classList.remove('loading');btn.textContent='导出 PNG';
    if(wasEdit)toggleEdit();
  }
}
