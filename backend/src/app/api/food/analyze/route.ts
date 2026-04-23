import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: body.messages || [
          {
            role: 'system',
            content: `You are a nutrition expert. Analyze the food and return ONLY a valid JSON object with this exact structure:
{"foodName":"string","nutrition":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number,"sugar":number,"sodium":number},"healthScore":number,"benefits":["string"],"concerns":["string"],"recommendations":["string"]}`
          },
          ...(body.image ? [{ role: 'user', content: [{ type: 'text', text: 'Analyze this food for nutrition.' }, { type: 'image_url', image_url: { url: body.image } }] }] : [{ role: 'user', content: `Analyze: ${body.description}` }])
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: 'Analysis failed', error: errorText }, { status: response.status });
    }

    const data = await response.json();
    const completion = data.choices?.[0]?.message?.content;
    if (!completion) return NextResponse.json({ message: 'No analysis returned' }, { status: 500 });

    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : completion;

    try {
      const parsed = JSON.parse(jsonString);
      return NextResponse.json({ data: parsed });
    } catch {
      return NextResponse.json({ message: 'Failed to parse analysis', raw: completion }, { status: 500 });
    }
  } catch (error) {
    console.error('Food analyze error:', error);
    return NextResponse.json({ message: 'Food analysis failed' }, { status: 500 });
  }
}
