export const CANVAS={width:492,height:628,hinge:310};
// Keep old collections in their original half; v2 uses one shared coordinate space.
export function toCanvas(item){
 if(item.layoutVersion===2)return {...item};
 const scale=492/508;
 return {...item,layoutVersion:2,compartment:'canvas',x:item.x*scale,y:item.y*(282/278)+(item.compartment==='base'?330:0),w:item.w*scale,h:item.h*scale};
}
export function constrain(item, width, height) {
 const radians=item.angle*Math.PI/180;
 const c=Math.abs(Math.cos(radians)),s=Math.abs(Math.sin(radians));
 const ratio=Math.min(1,(width-20)/(c*item.w+s*item.h),(height-20)/(s*item.w+c*item.h));
 const w=item.w*ratio,h=item.h*ratio;
 const hx=(c*w+s*h)/2,hy=(s*w+c*h)/2;
 return {...item,w,h,x:Math.max(hx,Math.min(width-hx,item.x)),y:Math.max(hy,Math.min(height-hy,item.y))};
}
