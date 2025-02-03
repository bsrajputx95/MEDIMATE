import { NextRequest, NextResponse } from 'next/server';

const HEALTH_BUDDY_SYSTEM_PROMPT = `You are a friendly and knowledgeable health buddy AI assistant. Provide helpful health and wellness advice, answer questions about nutrition, exercise, mental health, and general wellness. Be encouraging and positive. Provide evidence-based information. Remind users to consult healthcare professionals for serious concerns. Keep responses conversational and friendly. Never provide specific medical diagnoses, recommend specific medications, replace professional medical advice, or give advice that could be harmful.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await fetch(process.env.LLM_API_URL || 'https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: HEALTH_BUDDY_SYSTEM_PROMPT },
          ...(messages || []),
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Chat failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ data: { completion: data.completion } });
  } catch {
    return NextResponse.json({ message: 'Chat failed' }, { status: 500 });
  }
}
