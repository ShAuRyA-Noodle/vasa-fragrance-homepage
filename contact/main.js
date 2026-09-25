import '../our-story/site.js';
import { validateContact } from './validation.js';

const form = document.querySelector('#contact-form');
const summary = document.querySelector('#error-summary');
const feedback = document.querySelector('#form-feedback');
const fields = ['name', 'email', 'category', 'message', 'consent'];

function valuesFrom(formElement) {
  const data = new FormData(formElement);
  return {
    name: data.get('name'),
    email: data.get('email'),
    category: data.get('category'),
    message: data.get('message'),
    consent: data.get('consent') === 'on',
  };
}

function showErrors(errors) {
  fields.forEach(name => {
    const input = form.elements[name];
    const message = document.querySelector(`#${name}-error`);
    if (message) message.textContent = errors[name] || '';
    input?.setAttribute('aria-invalid', String(Boolean(errors[name])));
  });
  const entries = Object.entries(errors);
  summary.hidden = entries.length === 0;
  summary.querySelector('ul').innerHTML = entries.map(([name, message]) => `<li><a href="#${name}">${message}</a></li>`).join('');
}

form?.addEventListener('submit', event => {
  event.preventDefault();
  feedback.textContent = '';
  feedback.classList.remove('is-success');
  const errors = validateContact(valuesFrom(form));
  showErrors(errors);
  if (Object.keys(errors).length) {
    summary.focus();
    return;
  }
  summary.hidden = true;
  feedback.textContent = 'Your enquiry is ready. Message delivery is not active in this pre-launch preview; client service contact details will be published at launch.';
  feedback.classList.add('is-success');
  feedback.focus();
});

const requestedSubject = new URLSearchParams(location.search).get('subject');
const category = document.querySelector('#category');
if (requestedSubject && category && [...category.options].some(option => option.value === requestedSubject)) category.value = requestedSubject;
