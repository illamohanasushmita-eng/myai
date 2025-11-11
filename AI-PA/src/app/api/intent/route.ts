import { NextRequest, NextResponse } from 'next/server';
import { classifyIntentWithCohere, detectIntentWithFallback } from '@/lib/lara/cohere-intent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let text = body.text || body.query || body.message;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('⚠️ No text provided in request');
      return NextResponse.json({
        intent: 'general_query',
        confidence: 0.5,
        entities: {},
        error: 'No text provided',
      });
    }

    text = text.trim();
    console.log('📥 Processing intent for text:', text);

    try {
      // Try Cohere API first
      console.log('🔄 Attempting Cohere API classification...');
      const cohereResult = await classifyIntentWithCohere(text);

      console.log('✅ Cohere intent classification successful');
      console.log('  - Intent:', cohereResult.intent);
      console.log('  - Confidence:', cohereResult.confidence);
      console.log('  - Entities:', JSON.stringify(cohereResult.entities));

      return NextResponse.json({
        intent: cohereResult.intent,
        confidence: cohereResult.confidence,
        entities: cohereResult.entities,
        raw: { source: 'cohere' },
      });
    } catch (cohereError) {
      console.warn('⚠️ Cohere API failed, falling back to pattern matching');
      console.warn('  - Error:', String(cohereError).substring(0, 100));

      // Fallback to pattern matching
      const fallbackResult = detectIntentWithFallback(text);

      console.log('✅ Fallback intent detected');
      console.log('  - Intent:', fallbackResult.intent);
      console.log('  - Confidence:', fallbackResult.confidence);
      console.log('  - Entities:', JSON.stringify(fallbackResult.entities));

      return NextResponse.json({
        intent: fallbackResult.intent,
        confidence: fallbackResult.confidence,
        entities: fallbackResult.entities,
        raw: { source: 'fallback', error: String(cohereError).substring(0, 100) },
      });
    }
  } catch (error) {
    console.error('❌ Intent API error:', error);
    return NextResponse.json({
      intent: 'general_query',
      confidence: 0.3,
      entities: {},
      error: 'Internal server error',
    }, { status: 500 });
  }
}



