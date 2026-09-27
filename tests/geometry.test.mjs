import test from 'node:test';
import assert from 'node:assert/strict';
import { constrain } from '../src/geometry.js';
test('rotated objects remain entirely inside their compartment', () => {
 for (const angle of [-175,-90,-45,0,25,90,179]) {
  const item = constrain({x:-100,y:700,w:220,h:160,angle},500,260);
  const a=angle*Math.PI/180;
  const hw=(Math.abs(Math.cos(a))*item.w+Math.abs(Math.sin(a))*item.h)/2;
  const hh=(Math.abs(Math.sin(a))*item.w+Math.abs(Math.cos(a))*item.h)/2;
  assert.ok(item.x-hw >= -0.001 && item.x+hw <=500.001);
  assert.ok(item.y-hh >= -0.001 && item.y+hh <=260.001);
 }
});
test('oversized portrait keeps its aspect ratio when fitted',()=>{
 const item=constrain({x:250,y:130,w:400,h:1000,angle:30},500,260);
 assert.ok(Math.abs(item.w/item.h-0.4)<0.0001);
 assert.ok(item.h<300);
});
