export function cleanExcerpt(input?: string | null, max = 160) {
  const text = String(input || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export function articleSeo(article: any) {
  const title = article?.seo_title || article?.title || 'Haida Gwaii News';
  const description = article?.seo_description || article?.excerpt || cleanExcerpt(article?.body);
  const image = article?.og_image_url || article?.image_url || '/news-placeholder.jpg';
  return { title, description, image };
}
