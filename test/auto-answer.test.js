const test = require('node:test');
const assert = require('node:assert/strict');
const { AutoAnswerQueue, isQuestion } = require('../src/auto-answer');
function harness() {
  let next = 0;
  const timers = new Map(), answers = [];
  const state = { enabled: true, ready: true };
  const queue = new AutoAnswerQueue({enabled:()=>state.enabled,ready:()=>state.ready,answer:(t)=>answers.push(t.text),schedule:(cb)=>{timers.set(++next,cb);return next;},cancel:(id)=>timers.delete(id)});
  const tick = () => { const entries = [...timers]; timers.clear(); entries.forEach(([,cb])=>cb()); };
  return {queue,state,answers,timers,tick};
}
test('answers remote questions automatically and ignores local speech and statements',()=>{
  const h=harness();
  h.queue.push({channel:'you',text:'What is a cache?'});
  h.queue.push({channel:'them',text:'Thanks for joining today.'});
  assert.equal(h.timers.size,0);
  h.queue.push({channel:'them',text:'Explain how caching works.'});h.tick();
  assert.deepEqual(h.answers,['Explain how caching works.']);h.tick();assert.equal(h.answers.length,1);
});
test('waits for speech or an active answer to finish and keeps latest question',()=>{
  const h=harness();h.state.ready=false;
  h.queue.push({channel:'them',text:'What is a cache?'});h.tick();assert.equal(h.answers.length,0);
  h.queue.push({channel:'them',text:'How would you invalidate it?'});
  assert.equal(h.timers.size,1);h.state.ready=true;h.tick();
  assert.deepEqual(h.answers,['How would you invalidate it?']);
});
test('manual requests, stopping and disabling clear pending automatic replies',()=>{
  const h=harness();h.queue.push({channel:'them',text:'Tell me about yourself.'});h.queue.clear();h.tick();assert.equal(h.answers.length,0);
  h.queue.push({channel:'them',text:'Why this role?'});h.state.enabled=false;h.tick();assert.equal(h.answers.length,0);assert.equal(h.timers.size,0);
});
test('recognizes interview prompts without question marks',()=>{
  assert.equal(isQuestion('Walk me through your experience'),true);
  assert.equal(isQuestion('Tell me about a time you solved a conflict'),true);
  assert.equal(isQuestion('Welcome to the meeting'),false);
});
