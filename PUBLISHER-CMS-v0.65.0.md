# Publisher CMS

## Pages
Use `/admin/pages` to create and edit information pages. Blocks can be dragged to reorder. Supported blocks: paragraph, heading, image, quote, callout, button/link and divider.

New custom pages publish at `/pages/<slug>`. Add that route to the public menu in Site Configuration. Menu destinations may also be full external URLs beginning with `https://`.

About, Privacy and Terms are seeded as managed pages by the v286 migration and their established public routes continue to work.

## Footer
Use `/admin/footer` to rename, add, remove and reorder footer links. The Accessibility Status link is removed from the default footer.

## Archives
Use `/admin/archives` to upload PDF editions and cover images. Files are stored in the existing public `hgn-media` bucket. The public archive remains `/digital-paper` and now renders as a searchable newsstand.
