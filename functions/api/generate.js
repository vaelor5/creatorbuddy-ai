

export async function onRequestPost({ request, env }) {
  try {
    const { topic, type, tone } = await request.json();

    if (!topic || typeof topic !== "string" || topic.length > 500) {
      return Response.json(
        { error: "Please enter a topic (up to 500 characters)." },
        { status: 400 }
      );
    }

    const allowedTypes = ["ideas", "hooks", "script", "caption", "hashtags", "all"];
    const allowedTones = ["fun", "professional", "educational"];

    if (!allowedTypes.includes(type) || !allowedTones.includes(tone)) {
      return Response.json(
        { error: "Invalid content type or style." },
        { status: 400 }
      );
    }

    const prompt = `You are CreatorBuddy, a creative TikTok content assistant.

Create ${type} for this topic: "${topic}".

Writing style: ${tone}.

Requirements:
- Make the content original, natural, engaging and useful.
- Avoid repetitive generic phrases.
- Use clear, conversational English.
- Make scripts sound natural when spoken aloud.
- Give practical details, not empty advice.
- Do not promise that content will go viral.
- Use headings and numbered lists where helpful.
- Keep the response suitable for a TikTok creator.`;

    const result = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      {
        messages: [
          {
            role: "system",
            content: "You are a helpful and creative short-form video content expert."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200
      }
    );

    return Response.json({
      result: result.response || "Sorry, no content was generated. Please try again."
    });

  } catch (error) {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
