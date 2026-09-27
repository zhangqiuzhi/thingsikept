import {processImage} from './images.js';
import {loadCollection,saveCollection} from './storage.js';
import {attachInteractions} from './interactions.js';
import {constrain,toCanvas} from './geometry.js';
const $=s=>document.querySelector(s);
const scene=$('#scene'),dialog=$('#upload-dialog'),note=$('#memory-note');
const loaded=loadCollection();let items=loaded.items.map(toCanvas),opened=false,selected=null,pending=null,uploadVersion=0,toastTimer,saveTimer;
const colors=['var(--pink)','var(--blue)','var(--yellow)','var(--mint)'];
const getWell=()=>$('#tin-canvas');
function toast(message,undo){clearTimeout(toastTimer);const el=$('#toast');el.replaceChildren(document.createTextNode(message));el.hidden=false;if(undo){const button=document.createElement('button');button.textContent='撤销';button.onclick=()=>{undo();el.hidden=true;};el.append(button);}toastTimer=setTimeout(()=>el.hidden=true,undo?8000:5000);}
function save(){
 const error=saveCollection(items),status=$('#save-state');clearTimeout(saveTimer);
 if(error){status.classList.remove('visible');status.textContent='';toast(error);return;}
 status.textContent='saved locally ✓';status.classList.add('visible');
 saveTimer=setTimeout(()=>{status.classList.remove('visible');},1600);
}
function setScale(){document.documentElement.style.setProperty('--scale',Math.min(1,(innerWidth-36)/550,(Math.max(innerHeight,760)-160)/690));}
setScale();addEventListener('resize',setScale);
function setInsideActive(active){$('.open-tin-surface').inert=!active;$('#open-box').inert=active;}
setInsideActive(false);
function openBox(){if(opened)return;opened=true;setInsideActive(true);scene.classList.add('open');$('.opened-tools').hidden=false;$('#open-box').tabIndex=-1;setTimeout(()=>{if(opened&&!items.length)$('.empty-note .add-trigger').focus({preventScroll:true});},1050);}
function deselect(){selected=null;note.hidden=true;document.querySelectorAll('.sticker.selected').forEach(e=>e.classList.remove('selected'));}
function update(){scene.classList.toggle('populated',items.length>0);$('.empty-note').hidden=items.length>0;$('#count').textContent=items.length?`${items.length} / 12`:'';document.querySelectorAll('.add-trigger').forEach(b=>b.disabled=items.length>=12);items.forEach((item,index)=>{const el=document.getElementById(item.id);if(el){el.style.zIndex=index+1;el.querySelector('.number').textContent=String(indexOfNumber(item));}});}
function indexOfNumber(item){return item.number||items.indexOf(item)+1;}
function showNote(item){note.replaceChildren();const n=document.createElement('span');n.className='note-number';n.textContent=String(indexOfNumber(item));const title=document.createElement('h2');title.textContent=item.name;const date=document.createElement('span');date.className='note-year';date.textContent=`${item.year||new Date().getFullYear()} —`;const body=document.createElement('p');body.textContent=item.story||'有些东西，留下来就很好。';const hint=document.createElement('span');hint.className='note-tip';hint.textContent='挪一挪，放到你喜欢的位置。';note.append(n,title,date,body,hint);note.hidden=false;}
function select(id){deselect();const index=items.findIndex(i=>i.id===id);if(index<0)return;const [item]=items.splice(index,1);items.push(item);selected=id;document.getElementById(id)?.classList.add('selected');update();showNote(item);save();}
function remove(id){const index=items.findIndex(i=>i.id===id);if(index<0)return;const [item]=items.splice(index,1);document.getElementById(id)?.remove();deselect();update();save();toast('已从盒子里拿出。',()=>{if(items.length>=12){toast('盒子已经满了。');return;}items.splice(Math.min(index,items.length),0,item);renderItem(item);update();save();});}
function renderItem(item,arriving=false){
 const well=getWell(item.compartment);Object.assign(item,constrain(item,well.clientWidth,well.clientHeight));
 const el=document.createElement('div');el.id=item.id;el.className=`sticker ${item.transparent?'cutout':'photo'}${arriving?' arriving':''}`;el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label',`${item.name}。回车查看，方向键移动，Alt 加方向键旋转，加减键缩放，Delete 删除。`);el.style.setProperty('--tag',colors[(indexOfNumber(item)-1)%colors.length]);
 const art=document.createElement('div');art.className='sticker-art';const img=document.createElement('img');img.src=item.src;img.alt=item.name;img.draggable=false;art.append(img);el.append(art);
 const badge=document.createElement('span');badge.className='number';badge.textContent=indexOfNumber(item);el.append(badge);
 for(const [action,icon,label] of [['delete','×','拿出这件物品'],['resize','↘','拖动缩放'],['rotate','↻','拖动旋转']]){const b=document.createElement('button');b.type='button';b.className=`item-control ${action}-handle`;b.dataset.action=action;b.textContent=icon;b.setAttribute('aria-label',label);el.append(b);}
 well.append(el);attachInteractions(el,item,{select,remove,getWell,change:()=>{note.hidden=true;},commit:()=>save()});
}
function openUpload(){if(items.length>=12){toast('这个小盒子最多收好 12 件物品。');return;}deselect();pending=null;uploadVersion++;$('#upload-form').reset();$('#upload-preview').hidden=true;$('#upload-prompt').hidden=false;$('#upload-error').textContent='';$('#submit-item').disabled=false;dialog.showModal();}
function closeUpload(){uploadVersion++;dialog.close();}
document.addEventListener('click',e=>{if(!opened){openBox();return;}if(!e.target.closest('.sticker,.memory-note,dialog,.add-trigger'))deselect();});
$('#open-box').addEventListener('click',openBox);
$('#close-box').addEventListener('click',e=>{e.stopPropagation();deselect();opened=false;setInsideActive(false);scene.classList.remove('open');$('.opened-tools').hidden=true;$('#open-box').tabIndex=0;$('#open-box').focus({preventScroll:true});});
document.querySelectorAll('.add-trigger').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();openUpload();}));
$('.dialog-close').addEventListener('click',closeUpload);
dialog.addEventListener('click',e=>{e.stopPropagation();if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeUpload();}});
dialog.addEventListener('cancel',()=>{uploadVersion++;});
$('#file-input').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;const version=++uploadVersion;pending=null;$('#submit-item').disabled=true;$('#upload-error').textContent='正在整理照片…';
 try{const result=await processImage(file);if(version!==uploadVersion)return;pending=result;$('#upload-preview').src=pending.src;$('#upload-preview').hidden=false;$('#upload-prompt').hidden=true;$('#upload-error').textContent='';$('#item-name').focus();}
 catch(error){if(version===uploadVersion){$('#upload-error').textContent=error.message;$('#upload-preview').hidden=true;$('#upload-prompt').hidden=false;}}
 finally{if(version===uploadVersion)$('#submit-item').disabled=false;}
});
$('#upload-form').addEventListener('submit',e=>{
 e.preventDefault();if(!pending){$('#upload-error').textContent='请先选一张照片。';return;}const name=$('#item-name').value.trim();if(!name){$('#upload-error').textContent='给这件物品起个名字吧。';return;}if(items.length>=12)return;
 const longest=145+Math.random()*40;const w=pending.ratio>=1?longest:longest*pending.ratio;const h=w/pending.ratio;
 const used=items.map(i=>i.number);let number=1;while(used.includes(number))number++;
 const item={id:'kept-'+crypto.randomUUID(),...pending,name,story:$('#item-story').value.trim(),year:new Date().getFullYear(),number,layoutVersion:2,compartment:'canvas',x:145+Math.random()*200,y:430+Math.random()*75,w,h,angle:Math.random()*20-10};
 items.push(item);renderItem(item,true);update();save();closeUpload();select(item.id);document.getElementById(item.id).focus({preventScroll:true});
});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open)deselect();});
items.forEach(i=>renderItem(i));update();if(loaded.error)toast(loaded.error);
