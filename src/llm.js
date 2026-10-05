// LLM factory — OpenAI / Anthropic / Gemini behind one streaming interface.
// stream({ system, turns:[{role,text}], imageDataUrl, maxTokens, onToken, timeout }) -> Promise<fullText>

function normalizeProviderName(provider) {
  if (!provider) return 'provider';
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function formatProviderErrorMessage(error, provider) {
  const status = error && (error.status || error.statusCode || error.response?.status);
  const code = error && (error.code || error.error?.code);
  const rawMessage = (error && (error.message || String(error))) || '';
  const text = `${rawMessage} ${status || ''} ${code || ''}`.toLowerCase();
  const isQuota = status === 429 || code === 'insufficient_quota' || code === 'rate_limit_exceeded' || /quota|billing|rate limit|exceeded your current quota/i.test(text);
  if (isQuota) {
    const label = normalizeProviderName(provider);
    return `${label} quota or rate-limit hit. Check your plan/billing for the API key, wait a moment, or switch to another provider in Settings.`;
  }
  if (isTransientError(error)) return `${normalizeProviderName(provider)} is temporarily unavailable (service error). Please try again shortly, or choose another provider/model in Settings.`;
  if (/timeout|timed out|aborted/i.test(rawMessage)) return `${normalizeProviderName(provider)} took too long to answer. Try again, use Fast, or choose another model in Settings.`;
  return rawMessage || 'Unknown LLM error.';
}

function isTransientError(error) {
  const status = Number(error?.status || error?.statusCode || error?.response?.status || error?.error?.code);
  return [500, 502, 503, 504].includes(status) ||
    /\b(500|502|503|504)\b|service unavailable|overloaded|UNAVAILABLE/i.test(error?.message || '');
}

async function streamWithRetry(run, { onToken, onRetry, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  let emitted = false;
  const emit = (text) => { if (text) emitted = true; onToken(text); };
  for (let attempt = 0; ; attempt++) {
    try { return await run(emit); }
    catch (error) {
      // Never replay an answer that has already started streaming.
      if (emitted || attempt >= 2 || !isTransientError(error)) throw error;
      if (onRetry) onRetry({ attempt: attempt + 1 });
      await wait(1000 * (2 ** attempt));
    }
  }
}

function canFallback(error) {
  const status = Number(error?.status || error?.statusCode || error?.response?.status || error?.error?.code);
  return isTransientError(error) || status === 429 ||
    /timeout|timed out|aborted|RESOURCE_EXHAUSTED|quota|rate.?limit|fetch failed|ECONNRESET|ETIMEDOUT/i.test(error?.message || error?.code || '');
}

async function streamWithFallback(primary, fallback, { onToken, onFallback }) {
  let emitted = false;
  const emit = (text) => { if (text) emitted = true; onToken(text); };
  try { return await primary(emit); }
  catch (error) {
    if (!fallback || emitted || !canFallback(error)) throw error;
    if (onFallback) onFallback();
    try { return await fallback(emit); }
    catch (fallbackError) {
      throw new Error('Gemini failed: ' + formatProviderErrorMessage(error, 'gemini') +
        ' Groq fallback failed: ' + formatProviderErrorMessage(fallbackError, 'groq'));
    }
  }
}

function stripDataUrl(dataUrl) {
  const m = /^data:(.+?);base64,(.*)$/s.exec(dataUrl || '');
  return m ? { mime: m[1], b64: m[2] } : null;
}

async function streamOpenAI({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken, timeout, baseURL }) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey, timeout, maxRetries: 0, ...(baseURL ? { baseURL } : {}) });
  const messages = [{ role: 'system', content: system }];
  turns.forEach((t, i) => {
    const last = i === turns.length - 1;
    if (last && imageDataUrl && t.role === 'user') {
      messages.push({ role: 'user', content: [
        { type: 'text', text: t.text },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ] });
    } else {
      messages.push({ role: t.role, content: t.text });
    }
  });
  const stream = await client.chat.completions.create({ model, messages, stream: true, max_tokens: maxTokens });
  let full = '';
  for await (const part of stream) {
    const d = part.choices && part.choices[0] && part.choices[0].delta && part.choices[0].delta.content;
    if (d) { full += d; onToken(d); }
  }
  return full;
}

async function streamAnthropic({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken, timeout }) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey, timeout, maxRetries: 0 });
  const messages = turns.map((t, i) => {
    const last = i === turns.length - 1;
    if (last && imageDataUrl && t.role === 'user') {
      const img = stripDataUrl(imageDataUrl);
      const content = [];
      if (img) content.push({ type: 'image', source: { type: 'base64', media_type: img.mime, data: img.b64 } });
      content.push({ type: 'text', text: t.text });
      return { role: 'user', content };
    }
    return { role: t.role, content: t.text };
  });
  const stream = await client.messages.create({ model, max_tokens: maxTokens, system, messages, stream: true });
  let full = '';
  for await (const ev of stream) {
    if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') { full += ev.delta.text; onToken(ev.delta.text); }
  }
  return full;
}

async function streamGemini({ apiKey, model, system, turns, imageDataUrl, maxTokens, onToken, timeout }) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout } });
  const contents = turns.map((t, i) => {
    const last = i === turns.length - 1;
    const parts = [{ text: t.text }];
    if (last && imageDataUrl && t.role === 'user') {
      const img = stripDataUrl(imageDataUrl);
      if (img) parts.push({ inlineData: { mimeType: img.mime, data: img.b64 } });
    }
    return { role: t.role === 'assistant' ? 'model' : 'user', parts };
  });
  const stream = await ai.models.generateContentStream({
    model, contents, config: { systemInstruction: system, maxOutputTokens: maxTokens }
  });
  let full = '';
  for await (const chunk of stream) {
    const t = chunk && chunk.text;
    if (t) { full += t; onToken(t); }
  }
  return full;
}

function createLLM(settings) {
  const provider = settings.provider;
  const keys = settings.apiKeys || {};
  const apiKey = keys[provider];
  const tier = settings.smart ? 'smart' : 'fast';
  let model = (settings.models?.[provider] || {})[tier];
  if (provider === 'gemini' && /^gemini-1\.5\-/.test(model || '')) {
    model = 'gemini-flash-latest';
  }
  if (!model && provider === 'groq') model = settings.smart ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b';
  if (!model) model = provider === 'gemini' ? 'gemini-flash-latest' : (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-haiku-latest');
  const maxTokens = settings.smart ? 1400 : 700;

  return {
    provider, model, apiKey,
    ready: !!apiKey && !!model,
    async stream(params) {
      const args = { apiKey, model, maxTokens, timeout: settings.smart ? 45000 : 20000, ...params };
      const fallbackEnabled = provider === 'gemini' && !!keys.groq && settings.groqFallback !== false;
      const groqModel = settings.models?.groq?.[tier] || (settings.smart ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b');
      const run = async (onToken) => {
        const request = { ...args, onToken };
        if (provider === 'groq') {
          if (request.imageDataUrl) throw new Error('This Groq model supports text only. Use Gemini for screen questions, or ask using text/transcript.');
          return await streamOpenAI({ ...request, baseURL: 'https://api.groq.com/openai/v1' });
        }
        if (provider === 'openai') return await streamOpenAI(request);
        if (provider === 'anthropic') return await streamAnthropic(request);
        if (provider === 'gemini') return await streamGemini(request);
        throw new Error('unknown provider: ' + provider);
      };
      try {
        if (fallbackEnabled) {
          // Switch promptly on the first recoverable failure, rather than waiting for retries.
          return await streamWithFallback(run, (onToken) => streamWithRetry((emit) => streamOpenAI({
            ...args, apiKey: keys.groq, model: groqModel, imageDataUrl: null,
            system: args.system + (args.imageDataUrl ? '\nThe screenshot is unavailable. Answer only from the supplied text and transcript; ask for the missing screen text if needed. Do not invent screen contents.' : ''),
            baseURL: 'https://api.groq.com/openai/v1', onToken: emit
          }), { ...params, onToken }), {
            onToken: params.onToken,
            onFallback: () => params.onFallback?.({ provider: 'groq', model: groqModel, omittedScreen: !!args.imageDataUrl })
          });
        }
        return await streamWithRetry(run, params);
      } catch (error) {
        if (error.message?.startsWith('Gemini failed:')) throw error;
        throw new Error(formatProviderErrorMessage(error, provider));
      }
    }
  };
}

module.exports = { createLLM, formatProviderErrorMessage, isTransientError, streamWithRetry, streamWithFallback, canFallback };
