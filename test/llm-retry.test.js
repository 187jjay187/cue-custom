const assert = require('node:assert/strict');
const test = require('node:test');
const { streamWithRetry, formatProviderErrorMessage } = require('../src/llm');

test('retries transient failures with backoff then streams once', async () => {
  let calls = 0;
  const delays = [], tokens = [], retries = [];
  const result = await streamWithRetry(async (emit) => {
    if (++calls < 3) throw Object.assign(new Error('exception parsing response'), { status: 503 });
    emit('answer'); return 'answer';
  }, { onToken: (t) => tokens.push(t), onRetry: (r) => retries.push(r.attempt), wait: async (ms) => delays.push(ms) });
  assert.equal(result, 'answer');
  assert.deepEqual(tokens, ['answer']);
  assert.deepEqual(delays, [1000, 2000]);
  assert.deepEqual(retries, [1, 2]);
});

test('stops after two retries and formats service errors', async () => {
  let calls = 0;
  await assert.rejects(streamWithRetry(async () => {
    calls++; throw new Error('got status: 503 Service Unavailable');
  }, { onToken() {}, wait: async () => {} }), /503/);
  assert.equal(calls, 3);
  assert.match(formatProviderErrorMessage({ status: 503, message: 'exception parsing response' }, 'gemini'), /Gemini is temporarily unavailable/);
});

test('does not retry partial answers or authentication failures', async () => {
  for (const partial of [true, false]) {
    let calls = 0;
    await assert.rejects(streamWithRetry(async (emit) => {
      calls++;
      if (partial) emit('partial');
      throw Object.assign(new Error('failed'), { status: partial ? 503 : 401 });
    }, { onToken() {}, wait: async () => { throw new Error('unexpected retry'); } }), /failed/);
    assert.equal(calls, 1);
  }
});
