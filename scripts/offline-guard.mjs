import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import dgram from 'node:dgram';
import { syncBuiltinESMExports } from 'node:module';

// Test-only transport denial, including all CLI subprocesses via NODE_OPTIONS.
// This is not an OS firewall or a sandbox against adversarial same-user code.
const denied = () => { throw new Error('CEC_M0_NETWORK_DISABLED'); };
net.Socket.prototype.connect = denied;
net.connect = denied;
net.createConnection = denied;
tls.connect = denied;
http.request = denied;
http.get = denied;
https.request = denied;
https.get = denied;
dns.lookup = denied;
dns.resolve = denied;
dnsPromises.lookup = denied;
dnsPromises.resolve = denied;
dgram.createSocket = denied;
globalThis.fetch = denied;
globalThis.WebSocket = class { constructor() { denied(); } };
syncBuiltinESMExports();
globalThis.__cecOfflineGuardActive = true;
