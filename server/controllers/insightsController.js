const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { toPublicUser } = require('../utils/publicUser');

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message:
          'AI insights are not configured. Set GEMINI_API_KEY environment variable to enable this feature.',
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
    const extra = typeof req.body?.additionalContext === 'string'
      ? req.body.additionalContext.slice(0, 1500)
      : '';

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: system,
          },
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: userContent,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 1,
        },
      }),
    });
   const rawText = await response.text();
     let data = {};
     try {
       data = rawText ? JSON.parse(rawText) : {};
     } catch {
       return res.status(502).json({
         message: 'Gemini returned non-JSON. Check server network and GEMINI_API_KEY.',
         detail: rawText.slice(0, 280),
       });
     }

    if (!response.ok) {
      const msg =
        data.error?.message ||
        data.message ||
        (typeof data === 'string' ? data : null) ||
        `Gemini HTTP ${response.status}`;
      return res.status(502).json({ message: msg, detail: data.error || null });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) {
      return res.status(502).json({
        message: 'No insight text returned from Gemini. Please try again.',
      });
    }

    res.json({ insight: text });
  } catch (err) {
    console.error('Insights generation error:', err);
    return res.status(500).json({ message: 'Server error while generating insights' });
  }
};

exports.getSampleInsight = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message:
          'AI insights are not configured. Set GEMINI_API_KEY environment variable to enable this feature.',
      });
    }

    const sampleExpenses = [
      { category: 'Food', amount: 2500, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { category: 'Transport', amount: 800, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { category: 'Entertainment', amount: 1200, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ];
    const summary = summarizeExpenses(sampleExpenses);

    const system = `You are a concise, practical personal finance coach for users in Kenya (amounts in KES).
Give: (1) a short executive summary, (2) 3–5 bullet observations, (3) 3 concrete actionable tips.
Use plain language, no markdown headings with #. Keep total under 200 words.`;

    const userContent = JSON.stringify({
      profile: { monthlyIncome: 50000, mpesaBalance: 15000 },
      expenseSummary: summary,
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: { text: system } },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
      }),
    });

    const rawText = await response.text();
    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.status(502).json({ message: 'Failed to parse insight', detail: rawText.slice(0, 200) });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Start tracking your expenses to get personalized insights.';
    res.json({ insight: text });
  } catch (err) {
    console.error('Sample insight error:', err);
    res.status(500).json({ message: 'Could not generate sample insight' });
  }
};