const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values) {
  const errors = {};
  const name = String(values.name ?? '').trim();
  const email = String(values.email ?? '').trim();
  const category = String(values.category ?? '').trim();
  const message = String(values.message ?? '').trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < 2) errors.name = 'Please enter at least 2 characters.';

  if (!email) errors.email = 'Please enter your email address.';
  else if (!emailPattern.test(email)) errors.email = 'Please enter a valid email address.';

  if (!category) errors.category = 'Please choose a subject.';
  if (!message) errors.message = 'Please tell us how we can help.';
  else if (message.length < 12) errors.message = 'Please enter at least 12 characters.';
  if (!values.consent) errors.consent = 'Please confirm that VASA may use these details to respond.';

  return errors;
}
