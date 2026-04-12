const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { toPublicUser } = require('../utils/publicUser');
const { getOpenAiApiKey } = require('../utils/openaiKey');

function summarizeExpenses(expenses) {
  const byCategory = {};
  let total = 0;
  for (const e of expenses) {
    const amt = Number(e.amount) || 0;
    total += amt;
    byCategory[e.category] = (byCategory[e.category] || 0) + amt;
  }
  const months = {};
  for (const e of expenses) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = (months[key] || 0) + (Number(e.amount) || 0);
  }
  return { total, byCategory, months, count: expenses.length };
}

exports.generateInsights = async (req, res) => {
  try {
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      return res.status(503).json({
        message:
          'AI insights are not configured. Set OPENAI_API_KEY in the server .env file (not VITE_* in the client), restart the API, and ensure the key has no extra quotes.',
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const uid = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(String(req.user.id))
      : req.user.id;
    const expenses = await Expense.find({ userId: uid }).sort({ date: -1 }).limit(400);
    const summary = summarizeExpenses(expenses);
    const publicUser = toPublicUser(user);
    const extra = typeof req.body?.additionalContext === 'string' ? req.body.additionalContext.slice(0, 1500) : '';

    const system = `You are a concise, practical personal finance coach for users in Kenya (amounts in KES). 
You receive JSON summaries of spending. The user may or may not have a declared monthly income (may be null).
Give: (1) a short executive summary, (2) 3–5 bullet observations, (3) 3 concrete actionable tips, (4) one gentle risk or opportunity to watch.
Use plain language, no markdown headings with # — use simple labels and line breaks. Keep total under 400 words.`;

    const userContent = JSON.stringify({
      profile: {
        monthlyIncome: publicUser.monthlyIncome,
        mpesaBalance: publicUser.mpesaBalance,
        standingNotes: publicUser.insightsFocus || null,
        sessionNotes: extra || null,
      },
      expenseSummary: summary,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.45,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userContent },
        ],
      }),
    });

    const rawText = await response.text();
    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.status(502).json({
        message: 'OpenAI returned non-JSON. Check server network and OPENAI_API_KEY.',
        detail: rawText.slice(0, 280),
      });
    }

    if (!response.ok) {
      const msg =
        data.error?.message ||
        data.message ||
        (typeof data === 'string' ? data : null) ||
        `OpenAI HTTP ${response.status}`;
      return res.status(502).json({ message: msg, detail: data.error || null });
    }

    const msgObj = data.choices?.[0]?.message;
    const text = (msgObj?.content && String(msgObj.content).trim()) || '';
    const refusal = msgObj?.refusal && String(msgObj.refusal).trim();
    if (refusal && !text) {
      return res.status(502).json({ message: `Model declined: ${refusal}` });
    }
    if (!text) {
      const reason = data.choices?.[0]?.finish_reason || 'unknown';
      return res.status(502).json({
        message: `No insight text returned (finish_reason: ${reason}). Try OPENAI_MODEL=gpt-4o-mini in server .env.`,
      });
    }

    res.json({ insight: text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
