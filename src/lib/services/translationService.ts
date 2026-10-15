export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
];

export interface TranslatedPostContent {
  title: string;
  excerpt: string;
  contentHtml: string;
  lang: string;
}

// Split large HTML into safe semantic chunks under 1200 characters to preserve HTML tags
function splitHtmlIntoChunks(html: string, maxChunkLength = 1000): string[] {
  if (!html || html.length <= maxChunkLength) return [html];

  const chunks: string[] = [];
  // Split on block-level closing tags
  const parts = html.split(/(<\/(?:p|h2|h3|h4|blockquote|li|ul|ol|div|tr)>)/gi);

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

async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
    targetLang
  )}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`Translation network error: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0]
      .filter((segment: any) => Array.isArray(segment) && typeof segment[0] === 'string')
      .map((segment: any) => segment[0])
      .join('');
    return translated || text;
  }
  return text;
}

export async function translatePost(
  slug: string,
  title: string,
  excerpt: string,
  contentHtml: string,
  targetLang: string
): Promise<TranslatedPostContent> {
  // If target is English or same as original, return as-is
  if (!targetLang || targetLang === 'en') {
    return { title, excerpt, contentHtml, lang: 'en' };
  }

  // 1. Check local storage cache
  const cacheKey = `td_trans_${slug}_${targetLang}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.title && parsed.contentHtml) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // 2. Perform translation silently in background without injecting any Google UI
  // Translate title and excerpt
  const [translatedTitle, translatedExcerpt] = await Promise.all([
    title ? fetchTranslation(title, targetLang) : Promise.resolve(title),
    excerpt ? fetchTranslation(excerpt, targetLang) : Promise.resolve(excerpt),
  ]);

  // Translate HTML body in safe chunks
  let translatedHtml = contentHtml;
  if (contentHtml && contentHtml.trim()) {
    const chunks = splitHtmlIntoChunks(contentHtml);
    const translatedChunks = await Promise.all(
      chunks.map((chunk) => fetchTranslation(chunk, targetLang))
    );
    translatedHtml = translatedChunks.join('');
  }

  const result: TranslatedPostContent = {
    title: translatedTitle,
    excerpt: translatedExcerpt,
    contentHtml: translatedHtml,
    lang: targetLang,
  };

  // 3. Cache result in local storage
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch (e) {
    // LocalStorage quota may be full, ignore
  }

  return result;
}
