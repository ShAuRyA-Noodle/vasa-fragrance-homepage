// Contact form: route buttons preset the subject; inline validation; preview-only submit.
const form=document.querySelector('.ct-form');
if(form){
 const subject=form.querySelector('[name="subject"]'),error=form.querySelector('.ct-error');
 document.querySelectorAll('.ct-route').forEach(route=>route.addEventListener('click',()=>{
  subject.value=route.dataset.subject;
  document.querySelector('#enquiry').scrollIntoView({behavior:'smooth',block:'start'});
  form.querySelector('[name="name"]').focus({preventScroll:true});
 }));
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const invalid=[...form.elements].filter(field=>field.required&&!field.checkValidity());
  form.querySelectorAll('.ct-field').forEach(field=>field.classList.toggle('is-invalid',invalid.includes(field.querySelector('input,select,textarea'))));
  error.hidden=!invalid.length;
  if(invalid.length){invalid[0].focus();return;}
  const toast=document.querySelector('#toast');
  if(toast){toast.textContent='Thank you. Client services will open with the store.';toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),2600)}
  form.reset();
 });
}
