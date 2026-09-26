import {createBag} from '../05-campaign/cart.js';
import {footerMarkup} from './site-footer.js';
import {initFooterEffects} from './footer-effects.js';
import './site-footer.css';
import {initVasaExtras} from './vasa-extras.js';
import {catalog} from '../05-campaign/catalog.js';
export const bag=createBag(localStorage);
export const iconBag='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

export function shell(){
  let theme='light';
  try{theme=localStorage.getItem('vasa-theme')||'light'}catch{}
  document.documentElement.dataset.theme=theme==='dark'?'dark':'light';
  document.documentElement.style.colorScheme=document.documentElement.dataset.theme;
  const count=bag.items.reduce((sum,item)=>sum+item.quantity,0);
  const header=document.createElement('header');
  header.className='store-header';
  header.innerHTML=`<nav class="store-nav" aria-label="Primary"><button class="store-menu" type="button" aria-expanded="false" aria-controls="store-mobile-menu">Menu</button><a href="/our-story/">Our Story</a><a href="/collection/">Collection</a><a href="/gifting/">Gifts & Sets</a></nav><a class="store-logo" href="/" aria-label="VASA home"><img src="/media/campaign/logo-light.svg" alt="VASA Fragrance"></a><div class="store-actions"><a href="/contact/">Contact</a><button class="store-icon store-theme" type="button" aria-label="Switch colour theme" aria-pressed="${theme==='dark'}"><span aria-hidden="true">${theme==='dark'?'☀':'☾'}</span></button><a class="store-icon" href="/bag/" aria-label="Bag with ${count} items">${iconBag}${count?`<sup>${count}</sup>`:''}</a></div><nav class="store-mobile-panel" id="store-mobile-menu" aria-label="Mobile navigation" hidden><a href="/our-story/">Our Story</a><a href="/collection/">Collection</a><a href="/gifting/">Gifts & Sets</a><!-- <a href="/services/">Client Services</a> --><a href="/contact/">Contact</a></nav>`;
  document.body.prepend(header);
  const menuButton=header.querySelector('.store-menu');
  const menu=header.querySelector('.store-mobile-panel');
  menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu.hidden=open});
  menu?.addEventListener('click',event=>{if(event.target.closest('a')){menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}});
  const themeButton=header.querySelector('.store-theme');
  themeButton?.addEventListener('click',()=>{theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;themeButton.setAttribute('aria-pressed',String(theme==='dark'));themeButton.querySelector('span').textContent=theme==='dark'?'☀':'☾';try{localStorage.setItem('vasa-theme',theme)}catch{}});
  if(!document.querySelector('link[href="/fonts/fonts.css"]'))document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/fonts/fonts.css">');
  document.body.insertAdjacentHTML('beforeend',footerMarkup());
  initFooterEffects();
  initVasaExtras({catalog,addToBag:id=>{
    bag.add(id);
    const count=bag.items.reduce((sum,item)=>sum+item.quantity,0);
    const link=header.querySelector('.store-icon[href="/bag/"]');
    if(link){link.innerHTML=`${iconBag}<sup>${count}</sup>`;link.setAttribute('aria-label',`Bag with ${count} items`)}
  }});
}
