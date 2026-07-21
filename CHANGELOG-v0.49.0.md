# HGN v0.49.0 - Text-First Online Newsroom

## Homepage
- Separates the main front-page story from the front-page photo.
- Uses the article marked `front_page_photo` for the large homepage image.
- Falls back to the newest genuine article photo if no photo is explicitly selected.
- Displays the real image caption, photo credit, and alt text.
- Never substitutes the HGN logo or a generic placeholder as a story photograph.
- Makes text-only story cards use their full width instead of reserving empty thumbnail space.
- Adds clean excerpts and `Read more` links to lower homepage stories.

## Article editor
- Adds image alt text, caption, and photo credit fields to the main article editor.
- Adds `Use this article's photo as the front-page photo` independently of `Main front-page story`.
- Saves all photo metadata with the article.

## News listings and SEO
- News listing cards automatically switch between image and text-only layouts.
- Removes repeated placeholder-logo thumbnails.
- NewsArticle structured data includes an image only when the article has a genuine image.

## Database
Run `supabase/v264-front-page-photo.sql` before deployment.
