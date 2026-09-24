// Contact form: route buttons preset the subject; inline validation; preview-only submit.
const form=document.querySelector('.ct-form');
if(form){
 const error=form.querySelector('.ct-error');
 document.querySelectorAll('.ct-route').forEach(route=>route.addEventListener('click',()=>{
  const pick=form.querySelector(`[name="subject"][value="${route.dataset.subject}"]`);if(pick)pick.checked=true;
  document.querySelector('#enquiry').scrollIntoView({behavior:'smooth',block:'start'});
  form.querySelector('[name="name"]').focus({preventScroll:true});
 }));
 // "Other" reveals a free-text subject, required only while visible
 const other=form.querySelector('.ct-other'),otherInput=other?.querySelector('input');
 form.addEventListener('change',event=>{if(event.target.name!=='subject'||!other)return;const on=event.target.value==='Other';other.hidden=!on;otherInput.required=on;if(on)otherInput.focus();else otherInput.value='';});
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const invalid=[...form.elements].filter(field=>field.required&&!field.checkValidity());
  form.querySelectorAll('.ct-field').forEach(field=>field.classList.toggle('is-invalid',[...field.querySelectorAll('input,select,textarea')].some(x=>invalid.includes(x))));
  error.hidden=!invalid.length;
  if(invalid.length){invalid[0].focus();return;}
  const toast=document.querySelector('#toast');
  if(toast){toast.textContent='Thank you. Client services will open with the store.';toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),2600)}
  form.reset();
  if(other){other.hidden=true;otherInput.required=false;}
 });
}
