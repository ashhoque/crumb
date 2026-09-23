import assert from 'node:assert/strict';
import test from 'node:test';
import net from 'node:net';
import https from 'node:https';
import dns from 'node:dns';
import { createHash, randomUUID } from 'node:crypto';

test('offline test environment actually rejects socket, HTTPS, DNS and fetch calls', () => {
  assert.equal((globalThis as typeof globalThis & { __cecOfflineGuardActive?: boolean }).__cecOfflineGuardActive, true);
  assert.throws(() => net.connect({ host: 'example.com', port: 443 }), /CEC_M0_NETWORK_DISABLED/);
  assert.throws(() => https.get('https://example.com'), /CEC_M0_NETWORK_DISABLED/);
  assert.throws(() => dns.lookup('example.com', () => undefined), /CEC_M0_NETWORK_DISABLED/);
  assert.throws(() => fetch('https://example.com'), /CEC_M0_NETWORK_DISABLED/);
});

test('compiled ESM loads built-in crypto and verifies known hash/UUID behavior offline', () => {
  assert.ok(import.meta.url.startsWith('file:'));
  assert.equal(createHash('sha256').update('abc').digest('hex'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.match(randomUUID(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
