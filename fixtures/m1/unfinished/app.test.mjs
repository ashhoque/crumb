import assert from 'node:assert/strict';
import test from 'node:test';
import { totalOutstanding } from './app.mjs';

test('existing total excludes paid invoices', () => {
  assert.equal(totalOutstanding([{ amount: 120, paid: false }, { amount: 70, paid: true }]), 120);
});
