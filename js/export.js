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

// ===== Scale all pixel values from preview → export proportions =====
// Reads computed styles from ORIGINAL card (at preview size),
// multiplies by scale factor, applies to CLONE (at export size).
// Skips SVG internals (they scale via viewBox).
function scaleForExport(origCard,cloneCard,scale){
  const origAll=[origCard,...origCard.querySelectorAll('*')];
  const cloneAll=[cloneCard,...cloneCard.querySelectorAll('*')];
  for(let i=0;i<origAll.length&&i<cloneAll.length;i++){
    const oe=origAll[i];
    // Skip SVG elements — they have their own coordinate system
    if(oe instanceof SVGElement) continue;
    const cs=getComputedStyle(oe);
    const cel=cloneAll[i];
    // Font-size
    const fs=parseFloat(cs.fontSize);
    if(fs) cel.style.fontSize=(fs*scale)+'px';
    // Letter-spacing
    if(cs.letterSpacing!=='normal'){const v=parseFloat(cs.letterSpacing);if(v)cel.style.letterSpacing=(v*scale)+'px';}
    // Line-height
    if(cs.lineHeight!=='normal'){const v=parseFloat(cs.lineHeight);if(v)cel.style.lineHeight=(v*scale)+'px';}
    // Gap
    if(cs.gap&&cs.gap!=='normal'&&cs.gap!=='0px'){
      cel.style.gap=cs.gap.replace(/(\d+\.?\d*)px/g,(_,n)=>(parseFloat(n)*scale)+'px');
    }
    // Padding
    ['paddingTop','paddingRight','paddingBottom','paddingLeft'].forEach(p=>{
      const v=parseFloat(cs[p]);if(v)cel.style[p]=(v*scale)+'px';
    });
    // Margin (skip auto)
    ['marginTop','marginRight','marginBottom','marginLeft'].forEach(p=>{
      if(cs[p]==='auto')return;
      const v=parseFloat(cs[p]);if(v)cel.style[p]=(v*scale)+'px';
    });
    // Border width
    ['borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth'].forEach(p=>{
      const v=parseFloat(cs[p]);if(v)cel.style[p]=(v*scale)+'px';
    });
    // Border radius
    if(cs.borderRadius&&cs.borderRadius!=='0px'){
      cel.style.borderRadius=cs.borderRadius.replace(/(\d+\.?\d*)px/g,(_,n)=>(parseFloat(n)*scale)+'px');
    }
    // Text decoration
    if(cs.textUnderlineOffset&&cs.textUnderlineOffset!=='auto'){const v=parseFloat(cs.textUnderlineOffset);if(v)cel.style.textUnderlineOffset=(v*scale)+'px';}
    if(cs.textDecorationThickness&&cs.textDecorationThickness!=='auto'&&cs.textDecorationThickness!=='from-font'){const v=parseFloat(cs.textDecorationThickness);if(v)cel.style.textDecorationThickness=(v*scale)+'px';}
    // Text shadow
    if(cs.textShadow&&cs.textShadow!=='none'){
      cel.style.textShadow=cs.textShadow.replace(/(-?\d+\.?\d*)px/g,(_,n)=>(parseFloat(n)*scale)+'px');
    }
    // Box shadow
    if(cs.boxShadow&&cs.boxShadow!=='none'){
      cel.style.boxShadow=cs.boxShadow.replace(/(-?\d+\.?\d*)px/g,(_,n)=>(parseFloat(n)*scale)+'px');
    }
  }
}

// ===== Inline CSS vars & colors for html-to-image =====
// After scaleForExport sets size/spacing, this resolves CSS variables
// that html-to-image can't compute (colors, backgrounds, SVG attributes).
function resolveVarsForExport(card){
  const cardStyle=getComputedStyle(card);
  // 1) SVG attribute var() → computed value
  card.querySelectorAll('svg *').forEach(el=>{
    ['fill','stroke','stop-color','flood-color','lighting-color'].forEach(attr=>{
      const val=el.getAttribute(attr);
      if(val&&val.includes('var(')){
        const m=val.match(/var\(\s*(--[^,)]+)/);
        if(m)el.setAttribute(attr,cardStyle.getPropertyValue(m[1]).trim()||val);
      }
    });
  });
  // 2) Inline color/visual props that use CSS vars (skip props already set by scaleForExport)
  const COLOR_PROPS=[
    'background','background-image','background-color',
    'color','border-color','border-top-color','border-bottom-color',
    'border-left-color','border-right-color','outline-color',
    'text-decoration-color','opacity'
  ];
  [card,...card.querySelectorAll('*')].forEach(el=>{
    const cs=getComputedStyle(el);
    COLOR_PROPS.forEach(prop=>{
      const cv=cs.getPropertyValue(prop);
      if(cv&&cv!=='none'&&cv!==''&&cv!=='normal'&&cv!=='auto'){
        if(!el.style.getPropertyValue(prop)){
          el.style.setProperty(prop,cv);
        }
      }
    });
  });
}

// ===== Auto-shrink overflowing headline text =====
function autoShrinkText(clone){
  const headings=clone.querySelectorAll('h2,.hl2,.hl3,.bg2,.title16,.title18,.wall-title');
  headings.forEach(el=>{
    if(el.style.display==='none'||!el.textContent.trim()) return;
    let tries=0;
    // Shrink if card content overflows vertically
    while(tries<8&&clone.scrollHeight>clone.clientHeight+4){
      const cur=parseFloat(el.style.fontSize);
      if(!cur||cur<12) break;
      el.style.fontSize=(cur*0.9)+'px';
      const lh=parseFloat(el.style.lineHeight);
      if(lh) el.style.lineHeight=(lh*0.9)+'px';
      tries++;
    }
    // Also shrink if the heading itself overflows horizontally
    let tries2=0;
    while(tries2<6&&el.scrollWidth>el.clientWidth+4){
      const cur=parseFloat(el.style.fontSize);
      if(!cur||cur<12) break;
      el.style.fontSize=(cur*0.92)+'px';
      tries2++;
    }
  });
}

async function exportSelected(){
  const cards=document.querySelectorAll('.sblk.selected:not(.filtered-out):not(.removed) .card');
  if(!cards.length)return;
  const btn=document.getElementById('batchExportBtn');
  if(btn){btn.classList.add('loading');btn.textContent='导出中…';}
  for(const card of cards){
    await exportCard(card);
    await new Promise(r=>setTimeout(r,300));
  }
  if(btn){btn.classList.remove('loading');updateBatchBtn();}
}

// ===== Core: clone → actual-size container → scale proportionally → capture 1:1 =====
async function exportCard(card,btn){
  const hti=await loadHTI();
  if(btn){btn.classList.add('loading');btn.textContent='导出中…';}
  const wasEdit=typeof editMode!=='undefined'&&editMode;
  if(wasEdit)toggleEdit();

  let container=null;
  try{
    const expW=currentSize?.w||1080;
    const expH=currentSize?.h||1440;
    const cardRect=card.getBoundingClientRect();
    const scale=expW/cardRect.width;

    // --- 1. Hidden container at EXPORT dimensions ---
    container=document.createElement('div');
    container.style.cssText=`position:fixed;left:-9999px;top:0;width:${expW}px;height:${expH}px;overflow:hidden;z-index:-9999;pointer-events:none;`;
    document.body.appendChild(container);

    // --- 2. Clone card at EXPORT dimensions ---
    const clone=card.cloneNode(true);
    clone.style.width=expW+'px';
    clone.style.height=expH+'px';
    clone.style.aspectRatio='auto';
    clone.style.borderRadius='0';
    clone.style.transform='none';
    clone.style.transition='none';
    clone.style.boxShadow='none';
    // Use visible overflow so decorations/signatures aren't clipped;
    // html-to-image respects width/height params for final crop.
    clone.style.overflow='visible';

    // --- 3. Copy CSS custom properties from #G / .explore-item ---
    const varSource=card.closest('.explore-item')||document.getElementById('G');
    if(varSource){
      for(let i=0;i<varSource.style.length;i++){
        const prop=varSource.style[i];
        if(prop.startsWith('--'))
          clone.style.setProperty(prop,varSource.style.getPropertyValue(prop));
      }
    }
    // Also copy card-level inline CSS vars (--card-scale etc.)
    for(let i=0;i<card.style.length;i++){
      const prop=card.style[i];
      if(prop.startsWith('--'))
        clone.style.setProperty(prop,card.style.getPropertyValue(prop));
    }

    // --- 4. Insert into DOM (keep all elements for correct index alignment) ---
    container.appendChild(clone);

    // --- 5. Sync visibility (mod-hide-* rules depend on #G ancestor) ---
    const origEls=card.querySelectorAll('*');
    const cloneEls=clone.querySelectorAll('*');
    for(let i=0;i<origEls.length&&i<cloneEls.length;i++){
      if(getComputedStyle(origEls[i]).display==='none')
        cloneEls[i].style.display='none';
    }

    // --- 6. Scale all pixel values from preview → export size ---
    scaleForExport(card,clone,scale);

    // --- 7. Remove UI-only elements (AFTER scaling to preserve index alignment) ---
    clone.querySelectorAll('.export-btn,.deco-del').forEach(el=>el.remove());

    // --- 8. Inline CSS vars & colors for html-to-image ---
    resolveVarsForExport(clone);

    // --- 9. Wait for fonts & layout ---
    await document.fonts.ready;
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

    // --- 10. Auto-shrink overflowing headline text ---
    autoShrinkText(clone);
    // One more reflow after shrinking
    await new Promise(r=>requestAnimationFrame(r));

    // --- 11. Capture at 1:1 (actual export dimensions) ---
    const dataUrl=await hti.toPng(clone,{
      pixelRatio:1,
      width:expW,
      height:expH,
      cacheBust:true,
      filter:n=>!n.classList||(!n.classList.contains('export-btn')&&!n.classList.contains('deco-del'))
    });

    // --- 12. Download ---
    const link=document.createElement('a');
    const name=card.closest('.sblk')?.querySelector('.stag')?.textContent?.replace(/[^\w\u4e00-\u9fff]/g,'')||'poster';
    link.download='poster-'+name+'.png';
    link.href=dataUrl;
    link.click();
  }catch(err){
    alert('导出失败：'+err.message);
  }finally{
    if(container)container.remove();
    if(btn){btn.classList.remove('loading');btn.textContent='导出 PNG';}
    if(wasEdit)toggleEdit();
  }
}
