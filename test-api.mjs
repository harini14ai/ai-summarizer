// Quick end-to-end API test
import http from 'http';

const BASE = 'http://localhost:5000';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const rand = Math.floor(Math.random() * 99999);

console.log('\n========================================');
console.log('  AI SUMMARIZER - END-TO-END API TEST');
console.log('========================================\n');

// 1. Health
const health = await request('GET', '/api/health');
console.log(`[1] HEALTH CHECK`);
console.log(`    Status: ${health.status} | ${health.body.status}`);
console.log(`    Time:   ${health.body.timestamp}\n`);

// 2. Signup
const signup = await request('POST', '/api/auth/signup', {
  username: `tester${rand}`,
  email: `tester${rand}@test.com`,
  password: 'Test1234!',
  confirmPassword: 'Test1234!',
  firstName: 'John',
  lastName: 'Doe',
});
console.log(`[2] SIGNUP`);
console.log(`    HTTP: ${signup.status} | ${signup.body.message}`);
const token = signup.body.data?.token;
console.log(`    Token: ${token?.substring(0, 30)}...\n`);

// 3. Get current user
const me = await request('GET', '/api/auth/me', null, token);
console.log(`[3] GET CURRENT USER`);
console.log(`    HTTP: ${me.status}`);
console.log(`    Email:    ${me.body.data?.email}`);
console.log(`    Username: ${me.body.data?.username}`);
console.log(`    Plan:     ${me.body.data?.subscriptionPlan}`);
console.log(`    API Limit: ${me.body.data?.apiUsageLimit}\n`);

// 4. Get summaries (empty)
const sums = await request('GET', '/api/summaries', null, token);
console.log(`[4] GET SUMMARIES`);
console.log(`    HTTP: ${sums.status}`);
console.log(`    Total: ${sums.body.data?.pagination?.total}`);
console.log(`    Pages: ${sums.body.data?.pagination?.pages}\n`);

// 5. AI Summary (OpenAI)
console.log(`[5] CREATE AI SUMMARY (Gemini 2.5 Flash)`);
console.log(`    Sending request...`);
const sumRes = await request('POST', '/api/summaries/text', {
  content: `Artificial intelligence is rapidly transforming industries worldwide. 
  Machine learning models can now process vast amounts of data to identify patterns 
  and make accurate predictions. This technology is being applied in healthcare for 
  disease diagnosis, in finance for fraud detection, in transportation for autonomous 
  vehicles, and in many other sectors to dramatically improve efficiency and outcomes. 
  The pace of AI advancement shows no signs of slowing, with new breakthroughs 
  emerging regularly in natural language processing, computer vision, and robotics.`,
  title: 'AI Industry Overview',
  aiModel: 'gemini',
  summaryTypes: ['short', 'bulletPoints'],
}, token);

console.log(`    HTTP: ${sumRes.status} | ${sumRes.body.message}`);
if (sumRes.body.data?.summaries?.short) {
  console.log(`\n    SHORT SUMMARY:`);
  console.log(`    "${sumRes.body.data.summaries.short}"`);
}
if (sumRes.body.data?.summaries?.bulletPoints?.length) {
  console.log(`\n    BULLET POINTS:`);
  sumRes.body.data.summaries.bulletPoints.forEach((p, i) => {
    console.log(`    ${i + 1}. ${p}`);
  });
}
if (sumRes.body.data?.analysis?.sentiment) {
  console.log(`\n    SENTIMENT:  ${sumRes.body.data.analysis.sentiment}`);
  console.log(`    KEYWORDS:   ${sumRes.body.data.analysis.keywords?.slice(0,5).join(', ')}`);
}
if (sumRes.body.data?.tokensUsed?.total) {
  console.log(`    TOKENS:     ${sumRes.body.data.tokensUsed.total}`);
}

// 6. Verify summary saved
const sums2 = await request('GET', '/api/summaries', null, token);
console.log(`\n[6] VERIFY SUMMARY SAVED`);
console.log(`    Total summaries now: ${sums2.body.data?.pagination?.total}`);

console.log('\n========================================');
console.log('  ALL TESTS COMPLETE');
console.log('========================================\n');
