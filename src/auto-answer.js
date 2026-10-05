// Schedule one answer for a completed question from the remote audio channel.
function isQuestion(text) {
  const value = (text || '').trim();
  return /\?/.test(value) || /\b(tell me|walk me through|describe|explain|give me an example|what|why|how|when|where|which|can you|could you|would you|have you|do you|are you)\b/i.test(value);
}

class AutoAnswerQueue {
  constructor({ enabled, ready, answer, schedule = setTimeout, cancel = clearTimeout }) {
    Object.assign(this, { enabled, ready, answer, schedule, cancel });
    this.timer = null;
    this.pending = null;
  }
  push(turn) {
    if (turn.channel !== 'them' || !this.enabled() || !isQuestion(turn.text)) return;
    this.pending = turn;
    this.arm();
  }
  arm() {
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = this.schedule(() => {
      this.timer = null;
      if (!this.enabled()) { this.clear(); return; }
      if (!this.ready()) { this.arm(); return; }
      const turn = this.pending;
      this.pending = null;
      if (turn) this.answer(turn);
    }, 250);
  }
  clear() {
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
    this.pending = null;
  }
}
module.exports = { isQuestion, AutoAnswerQueue };
