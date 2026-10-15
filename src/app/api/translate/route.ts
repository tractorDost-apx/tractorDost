import { NextRequest, NextResponse } from 'next/server';

// In-memory cache to prevent redundant external API calls
const translationCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

function getCacheKey(text: string, lang: string): string {
  // Simple fast hash of text + target lang
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `${lang}:${hash}:${text.length}`;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;

  const cacheKey = getCacheKey(text, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
    targetLang
  )}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`Translation API failed with status ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0]
      .filter((segment: any) => Array.isArray(segment) && typeof segment[0] === 'string')
      .map((segment: any) => segment[0])
      .join('');

    if (translated) {
      if (translationCache.size >= MAX_CACHE_SIZE) {
        // Clear half to avoid memory overflow
        const keys = Array.from(translationCache.keys()).slice(0, 200);
        keys.forEach((k) => translationCache.delete(k));
      }
      translationCache.set(cacheKey, translated);
      return translated;
    }
  }

  return text;
}

// Split large HTML into safe semantic chunks under 1500 chars to avoid URL length issues
function splitHtmlIntoChunks(html: string, maxChunkLength = 1200): string[] {
  if (!html || html.length <= maxChunkLength) return [html];

  const chunks: string[] = [];
  // Split on paragraph or heading closures
  const parts = html.split(/(<\/(?:p|h2|h3|h4|blockquote|li|ul|ol|div)>)/gi);

  let current = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current.length + part.length > maxChunkLength && current.length > 0) {
      chunks.push(current);
      current = part;
    } else {
      current += part;
    }
  }
  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, contentHtml, targetLang } = body;

    if (!targetLang || targetLang === 'en') {
      return NextResponse.json({
        success: true,
        data: { title, excerpt, contentHtml, lang: 'en' },
      });
    }

    // Supported Indian language codes
    const validLangs = ['hi', 'mr', 'te', 'ta', 'pa', 'bn', 'gu', 'kn'];
    if (!validLangs.includes(targetLang)) {
      return NextResponse.json(
        { success: false, message: 'Unsupported language requested.' },
        { status: 400 }
      );
    }

    // 1. Translate Title & Excerpt in parallel
    const [translatedTitle, translatedExcerpt] = await Promise.all([
      title ? translateText(title, targetLang) : Promise.resolve(title),
      excerpt ? translateText(excerpt, targetLang) : Promise.resolve(excerpt),
    ]);

    // 2. Translate HTML body chunks
    let translatedHtml = contentHtml;
    if (contentHtml && contentHtml.trim()) {
      const chunks = splitHtmlIntoChunks(contentHtml);
      const translatedChunks = await Promise.all(
        chunks.map((chunk) => translateText(chunk, targetLang))
      );
      translatedHtml = translatedChunks.join('');
    }

    return NextResponse.json({
      success: true,
      data: {
        title: translatedTitle,
        excerpt: translatedExcerpt,
        contentHtml: translatedHtml,
        lang: targetLang,
      },
    });
  } catch (error: any) {
    console.error('Translation error in /api/translate:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Translation failed. Falling back to original language.',
      },
      { status: 500 }
    );
  }
}
