import {createBag} from '../05-campaign/cart.js';
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
  header.innerHTML=`<nav class="store-nav" aria-label="Primary"><button class="store-menu" type="button" aria-expanded="false" aria-controls="store-mobile-menu">Menu</button><a href="/our-story/">Our Story</a><a href="/collection/">Collection</a><a href="/gifting/">Gifts & Sets</a></nav><a class="store-logo" href="/" aria-label="VASA home"><img src="/media/campaign/logo-light.svg" alt="VASA Fragrance"></a><div class="store-actions"><a href="/contact/">Contact</a><button class="store-icon store-theme" type="button" aria-label="Switch colour theme" aria-pressed="${theme==='dark'}"><span aria-hidden="true">${theme==='dark'?'☀':'☾'}</span></button><a class="store-icon" href="/bag/" aria-label="Bag with ${count} items">${iconBag}${count?`<sup>${count}</sup>`:''}</a></div><nav class="store-mobile-panel" id="store-mobile-menu" aria-label="Mobile navigation" hidden><a href="/our-story/">Our Story</a><a href="/collection/">Collection</a><a href="/gifting/">Gifts & Sets</a><a href="/services/">Client Services</a><a href="/contact/">Contact</a></nav>`;
  document.body.prepend(header);
  const menuButton=header.querySelector('.store-menu');
  const menu=header.querySelector('.store-mobile-panel');
  menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu.hidden=open});
  menu?.addEventListener('click',event=>{if(event.target.closest('a')){menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}});
  const themeButton=header.querySelector('.store-theme');
  themeButton?.addEventListener('click',()=>{theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;themeButton.setAttribute('aria-pressed',String(theme==='dark'));themeButton.querySelector('span').textContent=theme==='dark'?'☀':'☾';try{localStorage.setItem('vasa-theme',theme)}catch{}});
  const footer=document.createElement('footer');
  footer.className='store-footer';
  footer.innerHTML=`<div class="footer-grid"><div><img class="footer-logo" src="/media/campaign/logo-dark.svg" alt="VASA Fragrance"></div><div class="footer-col"><h2>Explore</h2><a href="/collection/">Collection</a><a href="/gifting/">Gifts & Sets</a><a href="/our-story/">Our Story</a></div><div class="footer-col"><h2>At your service</h2><a href="/contact/">Contact</a><a href="/services/">Services & FAQ</a><a href="/bag/">Your bag</a></div><div class="footer-col"><h2>Legal</h2><a href="/legal/#privacy">Privacy</a><a href="/legal/#terms">Terms</a><a href="/legal/#shipping">Shipping & returns</a></div></div><div class="footer-bottom"><span>SHOP IN: INDIA</span><span>© ${new Date().getFullYear()} VASA FRAGRANCE</span></div>`;
  document.body.append(footer);
}
