import {productById} from './catalog.js';
const key='vasa:campaign:bag:v1';
export function normalizeBag(raw){
 if(!Array.isArray(raw))return [];
 const found=new Map();
 for(const item of raw){if(!item||!productById(item.id)||!Number.isInteger(item.quantity)||item.quantity<1)continue;found.set(item.id,{id:item.id,quantity:Math.min(9,(found.get(item.id)?.quantity||0)+item.quantity)});}
 return [...found.values()];
}
export function createBag(storage){
 let items=[];try{items=normalizeBag(JSON.parse(storage.getItem(key)||'[]'));}catch{}
 const listeners=new Set();
 function persist(){try{storage.setItem(key,JSON.stringify(items));}catch{}listeners.forEach(fn=>fn(items));}
 return {get items(){return items.map(x=>({...x}));},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},add(id){if(!productById(id))return;const i=items.find(x=>x.id===id);if(i)i.quantity=Math.min(9,i.quantity+1);else items.push({id,quantity:1});persist();},set(id,quantity){if(!Number.isInteger(quantity))return;items=items.map(i=>i.id===id?{...i,quantity:Math.min(9,quantity)}:i).filter(i=>i.quantity>0);persist();},remove(id){items=items.filter(i=>i.id!==id);persist();}};
}
