import {constrain} from './geometry.js';
export function attachInteractions(element,item,{select,change,commit,remove,getWell}){
 const paint=()=>{element.style.width=item.w+'px';element.style.height=item.h+'px';element.style.transform=`translate(${item.x-item.w/2}px,${item.y-item.h/2}px) rotate(${item.angle}deg)`;};
 paint();
 element.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  const action=event.target.dataset.action;
  if(action==='delete')return;
  event.preventDefault();event.stopPropagation();select(item.id);
  element.setPointerCapture(event.pointerId);
  const original={...item},start={x:event.clientX,y:event.clientY};
  const rect=element.getBoundingClientRect(),center={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
  const initialDistance=Math.hypot(start.x-center.x,start.y-center.y);
  const initialAngle=Math.atan2(start.y-center.y,start.x-center.x);
  let moved=false;
  const move=e=>{
   if(e.pointerId!==event.pointerId)return;
   moved ||= Math.hypot(e.clientX-start.x,e.clientY-start.y)>3;
   let well=getWell(item.compartment),r=well.getBoundingClientRect(),scale=r.width/well.offsetWidth;
   let next={...original,compartment:item.compartment};
   if(action==='resize'){
    const factor=Math.max(.25,Math.min(3,Math.hypot(e.clientX-center.x,e.clientY-center.y)/Math.max(initialDistance,1)));
    const minFactor=45/Math.max(original.w,original.h);
    next.w=original.w*Math.max(factor,minFactor);next.h=original.h*Math.max(factor,minFactor);
   }else if(action==='rotate'){
    next.angle=original.angle+(Math.atan2(e.clientY-center.y,e.clientX-center.x)-initialAngle)*180/Math.PI;
   }else{
    const grabOffsetX=(start.x-center.x)/scale,grabOffsetY=(start.y-center.y)/scale;
    next.x=(e.clientX-r.left)/scale-grabOffsetX;next.y=(e.clientY-r.top)/scale-grabOffsetY;
   }
   next=constrain(next,well.clientWidth,well.clientHeight);
   Object.assign(item,next);
   if(element.parentElement!==well){well.append(element);element.setPointerCapture(e.pointerId);}
   paint();change(item);
  };
  const end=e=>{
   if(e.pointerId!==event.pointerId)return;
   element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);
   if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
   if(moved)element.dataset.dragged='true';
   commit(item);
  };
  element.addEventListener('pointermove',move);element.addEventListener('pointerup',end);element.addEventListener('pointercancel',end);
 });
 element.addEventListener('click',e=>{e.stopPropagation();if(e.target.dataset.action==='delete'){remove(item.id);return;}if(element.dataset.dragged){delete element.dataset.dragged;return;}select(item.id);});
 element.addEventListener('keydown',e=>{
  if(e.target!==element)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();select(item.id);return;}
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(item.id);return;}
  const step=e.shiftKey?10:2;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();select(item.id);
   if(e.altKey)item.angle+=e.key==='ArrowLeft'?-5:5;
   else if(e.key==='ArrowLeft')item.x-=step;else if(e.key==='ArrowRight')item.x+=step;else if(e.key==='ArrowUp')item.y-=step;else item.y+=step;
  }else if(e.key==='+'||e.key==='='||e.key==='-'){
   e.preventDefault();select(item.id);const factor=e.key==='-'?.95:1.05;item.w*=factor;item.h*=factor;
  }else return;
  const well=getWell(item.compartment);Object.assign(item,constrain(item,well.clientWidth,well.clientHeight));paint();change(item);commit(item);
 });
 return paint;
}
