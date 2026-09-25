import test from 'node:test';
import assert from 'node:assert/strict';
import {RippleEmitter} from './ripple-field.js';

test('pointer trail emits only after moving the requested spacing', () => {
  const emitter = new RippleEmitter({spacing: 15});
  assert.deepEqual(emitter.move(100, 100, 1), {x: 100, y: 100, time: 1, strength: 1});
  assert.equal(emitter.move(110, 108, 1.1), null);
  assert.deepEqual(emitter.move(116, 100, 1.2), {x: 116, y: 100, time: 1.2, strength: 1});
});

test('click always emits a stronger ripple at its location', () => {
  const emitter = new RippleEmitter({spacing: 15, clickStrength: 2});
  emitter.move(100, 100, 1);
  assert.deepEqual(emitter.click(100, 100, 1.01), {x: 100, y: 100, time: 1.01, strength: 2});
  assert.equal(emitter.move(103, 103, 1.02), null);
});

test('reset allows a new pointer entry to emit immediately', () => {
  const emitter = new RippleEmitter();
  emitter.move(20, 20, 1);
  emitter.reset();
  assert.deepEqual(emitter.move(20, 20, 2), {x: 20, y: 20, time: 2, strength: 1});
});
