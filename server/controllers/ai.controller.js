let Anthropic, client

try {
  Anthropic = require('@anthropic-ai/sdk')
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
} catch (e) {
  console.warn('Anthropic SDK not available:', e.message)
}

exports.getSuggestions = async (req, res) => {
  if (!client) {
    return res.status(503).json({
      message: 'AI suggestions are not configured. Add ANTHROPIC_API_KEY to your .env file.',
      suggestions: []
    })
  }

  try {
    const { goals, existingHabits = [] } = req.body
    if (!goals?.trim()) return res.status(400).json({ message: 'Goals are required' })

    const prompt = `You are a habit coaching AI. A user wants to build better habits.

Their goals: "${goals}"
Their existing habits: ${existingHabits.length > 0 ? existingHabits.join(', ') : 'none yet'}

Suggest exactly 6 personalized habits. Respond ONLY with valid JSON, no markdown, no explanation:
{
  "suggestions": [
    {
      "name": "Habit name (max 40 chars)",
      "category": "health|fitness|mindfulness|learning|productivity|social|other",
      "frequency": "daily|weekdays|weekends|weekly",
      "icon": "single emoji",
      "color": "#hexcolor",
      "reason": "One sentence why this helps their goal (max 80 chars)"
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.json(parsed)
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ message: 'Failed to generate suggestions', suggestions: [] })
  }
}
