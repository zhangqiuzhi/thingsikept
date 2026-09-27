import test from 'node:test';
import assert from 'node:assert/strict';
import {toCanvas,constrain,CANVAS} from '../src/geometry.js';
test('legacy lid and base memories migrate to the same continuous canvas without losing content',()=>{
 const old={id:'memory',name:'kept',story:'hello',src:'data:image/png;base64,abc',x:254,y:139,w:100,h:160,angle:12,compartment:'lid'};
 const upper=toCanvas(old),lower=toCanvas({...old,compartment:'base'});
 assert.equal(upper.name,old.name);assert.equal(upper.src,old.src);assert.ok(upper.y<300&&lower.y>300);assert.equal(upper.x,lower.x);assert.equal(upper.angle,old.angle);assert.deepEqual(toCanvas(lower),lower);assert.equal(old.compartment,'lid');
});
test('a sticker can straddle the hinge without snapping or resizing',()=>{
 const item={x:CANVAS.width/2,y:CANVAS.hinge,w:150,h:180,angle:10};
 const result=constrain(item,CANVAS.width,CANVAS.height);assert.equal(result.y,item.y);assert.equal(result.h,item.h);assert.equal(result.w,item.w);
});
