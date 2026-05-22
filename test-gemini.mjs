import { readFileSync } from 'fs';
import https from 'https';

// Read key from .env
const env = readFileSync('./server/.env', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim();
console.log('Key prefix:', key?.substring(0, 10));

const body = JSON.stringify({ contents: [{ parts: [{ text: 'Say hello in one word' }] }] });

const endpoints = [
  { url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`, label: 'v1/gemini-2.5-flash' },
  { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, label: 'v1beta/gemini-2.5-flash' },
  { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, label: 'v1beta/gemini-2.0-flash' },
  { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, label: 'v1beta/gemini-1.5-flash' },
  { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, label: 'v1beta/gemini-1.5-flash-latest' },
];

for (const ep of endpoints) {
  const result = await new Promise((resolve) => {
    const urlObj = new URL(ep.url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });

  if (result.status === 200) {
    const parsed = JSON.parse(result.body);
    console.log(`✅ WORKS: ${ep.label}`);
    console.log(`   Response: ${parsed.candidates?.[0]?.content?.parts?.[0]?.text}`);
    break;
  } else {
    let errMsg = '';
    try { errMsg = JSON.parse(result.body)?.error?.message?.substring(0, 80); } catch {}
    console.log(`❌ FAIL [${result.status}]: ${ep.label} — ${errMsg}`);
  }
}
