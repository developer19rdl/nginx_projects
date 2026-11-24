const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 9333;
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = "C:\\Users\\User\\AppData\\Local\\Temp\\claude\\edge-profile-cdp";

const proc = spawn(edge, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--window-size=1366,900", "about:blank"
], { stdio: 'ignore' });

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}${path}`, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  // wait for CDP to come up
  let list;
  for (let i = 0; i < 30; i++) {
    try { list = await getJson('/json'); if (list.length) break; } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  const target = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const events = [];
  ws.on('message', (msg) => {
    const m = JSON.parse(msg);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    else if (m.method) { events.push(m); }
  });
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const myId = ++id;
      pending[myId] = resolve;
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  }
  await new Promise(r => ws.on('open', r));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Log.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/Sign_in' });
  // wait for load event
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (events.find(e => e.method === 'Page.loadEventFired')) { clearInterval(check); resolve(); }
    }, 200);
    setTimeout(() => { clearInterval(check); resolve(); }, 15000);
  });
  // extra settle time
  await new Promise(r => setTimeout(r, 4000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const img = document.querySelector('img[alt="Lenovo Facility"]');
        if (!img) return {found:false};
        const rect = img.getBoundingClientRect();
        return {
          found: true,
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
          computedDisplay: getComputedStyle(img).display,
          computedVisibility: getComputedStyle(img).visibility,
          computedOpacity: getComputedStyle(img).opacity,
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('IMG STATE:', JSON.stringify(evalRes.result.result.value, null, 2));

  const netErrors = events.filter(e => e.method === 'Network.loadingFailed');
  console.log('NETWORK FAILURES:', JSON.stringify(netErrors, null, 2));

  const consoleErrors = events.filter(e => e.method === 'Log.entryAdded' && (e.params.entry.level === 'error' || e.params.entry.level === 'warning'));
  console.log('CONSOLE ENTRIES:', JSON.stringify(consoleErrors.map(e => ({level: e.params.entry.level, text: e.params.entry.text})), null, 2));

  const runtimeExceptions = events.filter(e => e.method === 'Runtime.exceptionThrown');
  console.log('RUNTIME EXCEPTIONS:', JSON.stringify(runtimeExceptions, null, 2));

  // also grab a screenshot now via CDP
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\User\\AppData\\Local\\Temp\\claude\\lenovo_signin_shots\\cdp_screenshot.png', Buffer.from(shot.result.data, 'base64'));
  console.log('screenshot saved');

  ws.close();
  proc.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); proc.kill(); process.exit(1); });
