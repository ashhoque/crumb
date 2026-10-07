/* Focused synthetic verification. No customer images, dependencies or web server. */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function png(color) {
  const crc = bytes => {
    let value = 0xffffffff;
    for (const byte of bytes) { value ^= byte; for (let bit = 0; bit < 8; bit++) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1; }
    return (value ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc(body));
    return Buffer.concat([size, body, checksum]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(64, 0); header.writeUInt32BE(64, 4); header[8] = 8; header[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: 64 }, () => color).flat())]);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(Array.from({ length: 64 }, () => row)))), chunk('IEND', Buffer.alloc(0))]);
}

async function main() {
  const htmlPath = path.join(__dirname, 'four-shot-rehearsal.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert(!/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|serviceWorker)\b/.test(html), 'No network or persistence APIs in helper');
  assert(!/(?:src|href)\s*=\s*["'](?:https?:|\/\/)/i.test(html), 'No external resources');
  assert(html.includes("connect-src 'none'"), 'CSP disallows connections');
  assert(html.includes("default-src 'none'"), 'CSP defaults closed');
  assert(html.includes("doesn't judge cleaning quality or manager approval"));
  assert(!/\b(writeFile|FileSystemWritableFileStream|showSaveFilePicker)\b/.test(html), 'No original file writes');
  console.log('PASS local_boundary: source audit, no network/persistence/external resources or original writes; explicit human limits');

  const browser = process.env.FOUR_SHOT_BROWSER || ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(file => fs.existsSync(file));
  assert(browser, 'Chrome or Edge needed for browser checks; set FOUR_SHOT_BROWSER if installed elsewhere');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'four-shot-synthetic-'));
  const profile = path.join(temp, 'browser-profile');
  const images = ['north','south','west','east','replacement'].map((name, i) => {
    const file = path.join(temp, name + '.png'); fs.writeFileSync(file, png([40 + i * 35, 90 + i * 20, 130])); return file;
  });
  const corrupt = path.join(temp, 'unreadable.png'); fs.writeFileSync(corrupt, 'synthetic non-image bytes');
  const unsupported = path.join(temp, 'unsupported.txt'); fs.writeFileSync(unsupported, 'synthetic unsupported input');
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--disable-sync', '--remote-debugging-port=0', '--window-size=1280,1100', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let attempt = 0; attempt < 100 && !fs.existsSync(portFile); attempt++) await sleep(100);
    assert(fs.existsSync(portFile), 'Headless browser did not start');
    const port = fs.readFileSync(portFile, 'utf8').split(/\r?\n/)[0];
    const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const target = targets.find(item => item.type === 'page');
    assert(target, 'No browser page target');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let id = 0; const pending = new Map(); const requests = []; const errors = [];
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) { const entry = pending.get(message.id); pending.delete(message.id); clearTimeout(entry.timer); message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result); }
      if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const current = ++id;
      const timer = setTimeout(() => { pending.delete(current); reject(new Error('Timeout: ' + method)); }, 30000);
      pending.set(current, { resolve, reject, timer }); socket.send(JSON.stringify({ id: current, method, params }));
    });
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const waitFor = async expression => {
      for (let attempt = 0; attempt < 80; attempt++) { if (await evaluate(expression)) return; await sleep(50); }
      throw new Error('Condition not reached: ' + expression);
    };
    const choose = async (index, file) => {
      const { root } = await call('DOM.getDocument');
      const { nodeId } = await call('DOM.querySelector', { nodeId: root.nodeId, selector: '#photo-' + index });
      await call('DOM.setFileInputFiles', { nodeId, files: [file] });
    };
    const states = () => evaluate('slots.map(state)');
    const confirm = index => evaluate('slots[' + index + '].ui.confirm.click()');
    await call('Network.enable'); await call('Runtime.enable'); await call('Page.enable');
    await call('Page.navigate', { url: pathToFileURL(htmlPath).href });
    await waitFor("typeof slots !== 'undefined' && slots.length === 4");
    assert.deepEqual(await states(), ['MISSING','MISSING','MISSING','MISSING']);
    assert.equal(await evaluate("document.getElementById('ready-count').textContent"), '0 / 4');
    console.log('PASS initial empty state and four fixed named slots');
    for (let i = 0; i < 3; i++) { await choose(i, images[i]); await waitFor('slots[' + i + '].decoded'); await confirm(i); }
    assert.deepEqual(await states(), ['READY','READY','READY','MISSING']);
    assert.equal(await evaluate("document.getElementById('missing').textContent"), 'Missing: East.');
    console.log('PASS missing east remains visible after three confirmed photos');
    await choose(3, images[0]);
    assert.equal((await states())[3], 'MISSING');
    assert.match(await evaluate('slots[3].error'), /already assigned to North/);
    console.log('PASS duplicate fourth-file warning does not fill east');
    await choose(3, images[4]); await waitFor('slots[3].decoded');
    assert.equal((await states())[3], 'REVIEW');
    assert.equal(await evaluate('slots[3].confirmed'), false);
    console.log('PASS intentionally wrong-view assignment remains REVIEW; content judgment stays human');
    await choose(3, images[3]); await waitFor('slots[3].decoded');
    assert.equal((await states())[3], 'REVIEW'); await confirm(3);
    assert.deepEqual(await states(), ['READY','READY','READY','READY']);
    assert.equal(await evaluate("document.getElementById('overall').textContent"), '4 of 4 required views checked by you.');
    console.log('PASS all four READY only after individual confirmation');
    await confirm(3); assert.equal((await states())[3], 'REVIEW'); await confirm(3);
    await choose(3, images[4]); await waitFor('slots[3].decoded');
    assert.equal((await states())[3], 'REVIEW'); assert.equal(await evaluate('slots[3].confirmed'), false);
    console.log('PASS uncheck and replacement clear READY');
    await evaluate('slots[3].ui.remove.click()'); assert.equal((await states())[3], 'MISSING');
    assert.equal(await evaluate('slots[3].ui.image.hasAttribute("src")'), false);
    console.log('PASS removal clears assignment, preview and confirmation');
    await choose(3, unsupported); assert.equal((await states())[3], 'MISSING');
    assert.match(await evaluate('slots[3].error'), /JPEG or PNG/);
    await choose(3, corrupt); await waitFor('slots[3].error.includes("could not be read")');
    assert.equal((await states())[3], 'MISSING');
    assert.equal(await evaluate('slots[3].ui.confirm.disabled'), true);
    console.log('PASS unsupported and unreadable inputs stay missing with explicit errors');
    await choose(3, images[3]); await waitFor('slots[3].decoded'); await confirm(3);
    await call('Page.reload'); await waitFor("typeof slots !== 'undefined' && slots.every(s => !s.file)");
    assert.deepEqual(await states(), ['MISSING','MISSING','MISSING','MISSING']);
    console.log('PASS reload clears assignments and confirmations');
    assert.equal(errors.length, 0, 'No browser JavaScript exceptions');
    assert.deepEqual(requests.filter(url => /^https?:/i.test(url)), [], 'Helper must make no HTTP(S) requests');
    console.log('PASS local_boundary: real page made zero HTTP(S) requests and no browser exceptions');
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1100, deviceScaleFactor: 1, mobile: false });
    const screenshot = await call('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = path.join(temp, 'rehearsal.png'); fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('SCREENSHOT ' + screenshotPath);
    console.log('PASS slot_flow: synthetic browser acceptance cases completed; no human speed/preference or field-use claim');
  } finally {
    if (socket) socket.close();
    child.kill();
  }
}
main().catch(error => { console.error('FAIL ' + error.stack); process.exitCode = 1; });
