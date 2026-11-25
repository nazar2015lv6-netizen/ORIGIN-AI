export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI ще не підключено. Власнику сайту потрібно додати OPENAI_API_KEY у Vercel → Settings → Environment Variables."
    });
  }

  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Напиши повідомлення перед відправленням." });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Ти ORIGIN AI — корисний, дружній AI-помічник. Відповідай мовою користувача, за замовчуванням українською. Пояснюй зрозуміло та безпечно."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 900
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenAI API error:", upstream.status, data?.error?.message || "unknown");
      return res.status(502).json({ error: "AI-сервіс тимчасово не відповідає. Перевір API-ключ і ліміти в акаунті власника." });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: "AI не повернув відповідь. Спробуй ще раз." });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Внутрішня помилка сервера. Спробуй пізніше." });
  }
}