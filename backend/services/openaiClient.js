import OpenAI from 'openai';

export function getOpenAIClient() {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('Groq is not configured. Add GROQ_API_KEY to .env and restart the API.');
    error.statusCode = 503;
    throw error;
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

export async function getJsonResponse(instructions, input) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'openai/gpt-oss-20b',
    instructions,
    input,
  });

  const rawText = response.output_text?.trim();
  if (!rawText) throw new Error('OpenAI returned an empty response. Please try again.');

  try {
    return JSON.parse(rawText.replace(/^```json\s*|\s*```$/g, ''));
  } catch {
    throw new Error('OpenAI returned an unexpected response format. Please try again.');
  }
}
