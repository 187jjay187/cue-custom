const assert = require('node:assert/strict');
const test = require('node:test');
const { streamWithFallback } = require('../src/llm');

test('falls back on busy, quota and timeout errors', async () => {
  for (const error of [Object.assign(new Error('busy'), {status: 503}), Object.assign(new Error('limit'), {status: 429}), new Error('request timed out')]) {
    const tokens = []; let switches = 0;
    const result = await streamWithFallback(async () => { throw error; }, async (emit) => { emit('backup'); return 'backup'; }, {onToken: (t) => tokens.push(t), onFallback: () => switches++});
    assert.equal(result, 'backup'); assert.equal(switches, 1); assert.deepEqual(tokens, ['backup']);
  }
});

test('does not fall back after partial output, bad keys, or successful primary', async () => {
  for (const partial of [false, true]) {
    let switched = false;
    await assert.rejects(streamWithFallback(async (emit) => {
      if (partial) emit('start');
      throw Object.assign(new Error('failed'), {status: partial ? 503 : 401});
    }, async () => {switched = true;}, {onToken() {}}), /failed/);
    assert.equal(switched, false);
  }
  assert.equal(await streamWithFallback(async () => 'primary', async () => {throw Error('unexpected');}, {onToken() {}}), 'primary');
});

test('reports both provider failures', async () => {
  await assert.rejects(streamWithFallback(async () => {throw Object.assign(new Error('busy'), {status:503});}, async () => {throw Object.assign(new Error('bad key'), {status:401});}, {onToken() {}}), /Gemini failed:.*Groq fallback failed: bad key/);
});

test('Gemini fallback uses Groq endpoint, tier model, key, and omits unsupported images', async () => {
  const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
  let options, payload;
  class OpenAI {
    constructor(opts) { options = opts; this.chat = {completions: {create: async (data) => {
      payload = data;
      return (async function* () {yield {choices:[{delta:{content:'backup answer'}}]};})();
    }}}; }
  }
  class GoogleGenAI { constructor() {this.models = {generateContentStream: async () => {throw Object.assign(new Error('busy'), {status:503});}};} }
  const mod = {exports:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/llm.js'), 'utf8'), {module:mod, require:(name) => name === 'openai' ? OpenAI : {GoogleGenAI}, setTimeout});
  for (const smart of [false,true]) {
    const switches = [], tokens = [];
    const llm = mod.exports.createLLM({provider:'gemini', smart, apiKeys:{gemini:'test-gemini',groq:'test-groq'}, models:{gemini:{fast:'gemini-test',smart:'gemini-test'}}});
    assert.equal(await llm.stream({system:'prompt',turns:[{role:'user',text:'question'}],imageDataUrl:'data:image/png;base64,test',onToken:(t)=>tokens.push(t),onFallback:(info)=>switches.push(info)}), 'backup answer');
    assert.equal(options.baseURL,'https://api.groq.com/openai/v1'); assert.equal(options.apiKey,'test-groq');
    assert.equal(payload.model,smart ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b');
    assert.equal(payload.messages[1].content,'question'); assert.match(payload.messages[0].content,/Do not invent screen contents/);
    assert.equal(switches[0].omittedScreen,true); assert.deepEqual(tokens,['backup answer']);
  }
});
