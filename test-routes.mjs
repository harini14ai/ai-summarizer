// Full route verification test
import http from 'http';

const BASE = 'http://localhost:5000';

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, b: JSON.parse(raw) }); }
        catch { resolve({ s: res.statusCode, b: raw }); }
      });
    });
    r.on('error', (e) => resolve({ s: 0, b: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

const pass = (label, s, expected = [200, 201]) => {
  const ok = expected.includes(s);
  console.log(`  ${ok ? '✅' : '❌'} [${s}] ${label}`);
  return ok;
};

const rand = Math.floor(Math.random() * 99999);
let token, summaryId;

console.log('\n══════════════════════════════════════════════');
console.log('  COMPLETE ROUTE VERIFICATION TEST');
console.log('══════════════════════════════════════════════\n');

// ── Public routes ─────────────────────────────────────────────────────
console.log('PUBLIC ROUTES:');
const r = await req('GET', '/');
pass('GET  /', r.s);

const h = await req('GET', '/api/health');
pass('GET  /api/health', h.s);

const t = await req('GET', '/api/test');
pass('GET  /api/test', t.s);
if (t.b.routes) console.log('       Routes map returned ✓');

// ── 404 test ──────────────────────────────────────────────────────────
const notFound = await req('GET', '/api/nonexistent');
pass('GET  /api/nonexistent  → 404', notFound.s, [404]);
console.log(`       Message: "${notFound.b.message}"`);
console.log(`       Hint:    "${notFound.b.hint}"`);

// ── Auth routes ───────────────────────────────────────────────────────
console.log('\nAUTH ROUTES:');
const signup = await req('POST', '/api/auth/signup', {
  username: `user${rand}`, email: `user${rand}@test.com`,
  password: 'Test1234!', confirmPassword: 'Test1234!',
  firstName: 'Test', lastName: 'User',
});
pass('POST /api/auth/signup', signup.s, [201]);
token = signup.b.data?.token;

// Register alias
const register = await req('POST', '/api/auth/register', {
  username: `reg${rand}`, email: `reg${rand}@test.com`,
  password: 'Test1234!', confirmPassword: 'Test1234!',
});
pass('POST /api/auth/register  (alias)', register.s, [201]);

const login = await req('POST', '/api/auth/login', {
  email: `user${rand}@test.com`, password: 'Test1234!',
});
pass('POST /api/auth/login', login.s);

const me = await req('GET', '/api/auth/me', null, token);
pass('GET  /api/auth/me', me.s);
console.log(`       User: ${me.b.data?.email}`);

// ── Summary routes ────────────────────────────────────────────────────
console.log('\nSUMMARY ROUTES:');
const create = await req('POST', '/api/summaries/text', {
  title: 'Route Test Summary',
  content: 'This is a test of the route verification system. The backend should handle this request correctly and return a proper JSON response with the summary data.',
  aiModel: 'gemini',
  summaryTypes: ['short'],
}, token);
pass('POST /api/summaries/text', create.s, [201]);
summaryId = create.b.data?._id;
console.log(`       Summary ID: ${summaryId}`);

// Alias route
const alias = await req('POST', '/api/summarize/text', {
  title: 'Alias Test',
  content: 'Testing the /api/summarize alias route to ensure it works correctly.',
  aiModel: 'gemini',
  summaryTypes: ['short'],
}, token);
pass('POST /api/summarize/text  (alias)', alias.s, [201]);

const list = await req('GET', '/api/summaries', null, token);
pass('GET  /api/summaries', list.s);
console.log(`       Total: ${list.b.data?.pagination?.total}`);

const search = await req('GET', '/api/summaries/search/query?query=test', null, token);
pass('GET  /api/summaries/search/query', search.s);

if (summaryId) {
  const getOne = await req('GET', `/api/summaries/${summaryId}`, null, token);
  pass(`GET  /api/summaries/:id`, getOne.s);

  const bookmark = await req('PATCH', `/api/summaries/${summaryId}/bookmark`, null, token);
  pass(`PATCH /api/summaries/:id/bookmark`, bookmark.s);

  const del = await req('DELETE', `/api/summaries/${summaryId}`, null, token);
  pass(`DELETE /api/summaries/:id`, del.s);
}

// ── File routes ───────────────────────────────────────────────────────
console.log('\nFILE ROUTES:');
const urlSum = await req('POST', '/api/files/url', {
  url: 'https://example.com',
  aiModel: 'gemini',
  summaryTypes: ['short'],
}, token);
// 400 is OK here — example.com content may be too short
pass('POST /api/files/url', urlSum.s, [201, 400]);
console.log(`       Response: ${urlSum.b.message}`);

// ── User routes ───────────────────────────────────────────────────────
console.log('\nUSER ROUTES:');
const stats = await req('GET', '/api/users/me/stats', null, token);
pass('GET  /api/users/me/stats', stats.s);

// ── Auth guard test ───────────────────────────────────────────────────
console.log('\nAUTH GUARD:');
const noAuth = await req('GET', '/api/summaries');
pass('GET  /api/summaries (no token) → 401', noAuth.s, [401]);
console.log(`       Message: "${noAuth.b.message}"`);

console.log('\n══════════════════════════════════════════════');
console.log('  ALL ROUTE TESTS COMPLETE');
console.log('══════════════════════════════════════════════\n');
