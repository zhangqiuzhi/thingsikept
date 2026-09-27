// Replace this hook with a future background-removal service, without changing the UI.
export async function removeBackground(canvas){return canvas;}
export async function processImage(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('请选择 JPG、PNG 或 WEBP 图片。');
 if(file.size>15*1024*1024)throw new Error('这张照片太大了，请选择 15 MB 以内的图片。');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;
  await img.decode().catch(()=>{throw new Error('没能读懂这张照片，请换一张试试。');});
  const scale=Math.min(1,700/Math.max(img.naturalWidth,img.naturalHeight));
  let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let transparent=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]<240){transparent=true;break;}}
  // Trim empty transparent margins so the sticker is easy to grab and scale.
  if(transparent){
   let left=canvas.width,top=canvas.height,right=0,bottom=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>20){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
   if(right<left||bottom<top)throw new Error('这张图片是全透明的，请换一张。');
   const trimmed=document.createElement('canvas');trimmed.width=right-left+1;trimmed.height=bottom-top+1;trimmed.getContext('2d').drawImage(canvas,left,top,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);canvas=trimmed;
  }
  canvas=await removeBackground(canvas);
  return {src:canvas.toDataURL('image/webp',.82),ratio:canvas.width/canvas.height,transparent};
 }finally{URL.revokeObjectURL(url);}
}
