import assert from 'node:assert/strict';
import { validateContact } from './validation.js';

const empty = validateContact({ name: '', email: '', category: '', message: '', consent: false });
assert.equal(empty.name, 'Please enter your name.');
assert.equal(empty.email, 'Please enter your email address.');
assert.equal(empty.category, 'Please choose a subject.');
assert.equal(empty.message, 'Please tell us how we can help.');
assert.equal(empty.consent, 'Please confirm that VASA may use these details to respond.');

const invalid = validateContact({
  name: 'A',
  email: 'not-an-email',
  category: 'Fragrance guidance',
  message: 'short',
  consent: true,
});
assert.equal(invalid.name, 'Please enter at least 2 characters.');
assert.equal(invalid.email, 'Please enter a valid email address.');
assert.equal(invalid.message, 'Please enter at least 12 characters.');

const valid = validateContact({
  name: 'Anika Rao',
  email: 'anika@example.com',
  category: 'Fragrance guidance',
  message: 'I would like help choosing a fragrance.',
  consent: true,
});
assert.deepEqual(valid, {});

console.log('Contact validation tests passed');
