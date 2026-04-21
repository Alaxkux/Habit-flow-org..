const Anthropic = require('@anthropic-ai/sdk');
const Badge = require('../models/Badge');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.getSuggestions = async (req, res) => {
  try {
    const { goals, existingHabits = [] } = req.body;

    const prompt = `You are a habit coach. The user wants to achieve: "${goals}".
Their existing habits are: ${existingHabits.length ? existingHabits.join(', ') : 'none yet'}.

Suggest exactly 6 personalized habits. Respond ONLY with valid JSON in this format, no other text:
[
  {
    "name": "Habit name",
    "category": "health|fitness|mindfulness|learning|productivity|social|other",
    "icon": "single emoji",
    "color": "hex color code",
    "reason": "one sentence why this habit helps their goal",
    "frequency": "daily|weekdays|weekends|weekly"
  }
]`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(cleaned);

    // Award AI explorer badge
    await Badge.findOneAndUpdate(
      { userId: req.user.id, badgeType: 'ai_explorer' },
      { userId: req.user.id, badgeType: 'ai_explorer' },
      { upsert: true, new: true }
    ).catch(() => {});

    res.json({ suggestions });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ message: 'AI suggestion failed', error: err.message });
  }
};
