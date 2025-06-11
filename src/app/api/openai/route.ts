import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      systemPrompt,
      userPrompt,
      model,
      temperature,
      maxTokens,
      presencePenalty,
      frequencyPenalty,
      stopSequence,
    } = body;

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { error: 'System prompt and user prompt are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Prepare the messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // Prepare the request parameters
    const requestParams: {
      model: string;
      messages: Array<{ role: 'system' | 'user'; content: string }>;
      temperature: number;
      max_tokens: number;
      presence_penalty: number;
      frequency_penalty: number;
      stop?: string[];
    } = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
    };

    // Add stop sequence if provided
    if (stopSequence && stopSequence.trim() !== '') {
      requestParams.stop = [stopSequence.trim()];
    }

    const completion = await openai.chat.completions.create(requestParams);

    const output = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      output,
      usage: completion.usage,
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 