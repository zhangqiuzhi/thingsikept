const KEY='things-i-kept:v1';
export function loadCollection(){
 try {
  const saved=JSON.parse(localStorage.getItem(KEY)||'[]');
  if(!Array.isArray(saved))throw new Error('invalid');
  if(saved.some(i=>i?.compartment==='base'||i?.compartment==='lid')&&!localStorage.getItem(KEY+':pre-photo')){try{localStorage.setItem(KEY+':pre-photo',JSON.stringify(saved));}catch{/* Preserve existing data even if backup space is unavailable. */}}
  return {items:saved.filter(i=>i&&typeof i.id==='string'&&typeof i.name==='string'&&typeof i.story==='string'&&/^data:image\/(webp|png|jpeg);base64,/.test(i.src)&&['base','lid','canvas'].includes(i.compartment)&&['x','y','w','h','angle'].every(k=>Number.isFinite(i[k]))&&i.w>0&&i.h>0).slice(0,12),error:null};
 }catch{return {items:[],error:'之前的收藏暂时无法读取。请检查浏览器是否允许本地存储。'};}
}
export function saveCollection(items){
 try{localStorage.setItem(KEY,JSON.stringify(items));return null;}
 catch{return '浏览器存储空间不足，本次修改尚未保存。请减少图片或物件后重试。';}
}
