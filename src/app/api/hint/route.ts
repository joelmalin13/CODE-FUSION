import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_api_key',
});

export async function POST(req: Request) {
  try {
    const { problemStatement, studentCode, failedTestCase } = await req.json();

    if (!studentCode || !problemStatement) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert, encouraging computer science professor acting as a hint generator for an online coding platform called CodeArena.
Your job is to provide specific, contextual *nudges* to students who are stuck, WITHOUT writing code for them or revealing the direct answer.
When a student asks for a hint, you receive:
1. The Problem Statement
2. Their Current Code
3. The Test Case they failed (if applicable)

Provide a 2-3 sentence nudge. Point out specific logical flaws in their exact code snippet, or suggest a more optimal data structure. 
CRITICAL RULE: Never give the exact same generic advice twice. Be highly creative, dynamic, and tailor the hint completely to the specific lines of code the user has written. 
DO NOT provide the final code solution.`
      },
      {
        role: "user",
        content: `
Problem Statement:
${problemStatement}

Student's Current Code:
${studentCode}

${failedTestCase ? `Failed Test Case output: ${failedTestCase}` : 'No test cases ran yet. They just requested a hint.'}
        `
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      // @ts-expect-error message types in groq-sdk
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.95, // High temperature to ensure varied hints!
      max_tokens: 200,
      presence_penalty: 0.5, // Help penalize repeating the same words
      frequency_penalty: 0.5,
      top_p: 1,
    });

    return NextResponse.json({
      hint: chatCompletion.choices[0]?.message?.content || "Consider revisiting your core loop condition or data structure."
    });

  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json({ error: 'Failed to generate hint from AI' }, { status: 500 });
  }
}
