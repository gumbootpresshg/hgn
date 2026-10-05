import sharp from "sharp";

const width = 1200;
const height = 630;
const svg = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#07243a"/>
  <rect x="44" y="44" width="1112" height="542" rx="0" fill="#f7f1e7"/>
  <rect x="44" y="44" width="18" height="542" fill="#b3222d"/>
  <text x="112" y="158" fill="#b3222d" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="5">NEWS FROM THE EDGE</text>
  <text x="112" y="270" fill="#07243a" font-family="Georgia, Times New Roman, serif" font-size="72" font-weight="700">Haida Gwaii</text>
  <text x="112" y="348" fill="#07243a" font-family="Georgia, Times New Roman, serif" font-size="72" font-weight="700">News</text>
  <line x1="112" y1="400" x2="650" y2="400" stroke="#07243a" stroke-width="3"/>
  <text x="112" y="454" fill="#3d3a36" font-family="Arial, Helvetica, sans-serif" font-size="27">Local news, events and community stories</text>
  <text x="112" y="510" fill="#07243a" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="2">HAIDAGWAIINEWS.COM</text>
</svg>`);

const seal = await sharp("public/hgn-logo.png")
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize(320, 320, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({ create: { width, height, channels: 4, background: "#07243a" } })
  .composite([
    { input: svg, left: 0, top: 0 },
    { input: seal, left: 760, top: 155 },
  ])
  .png({ quality: 95 })
  .toFile("public/hgn-social-share.png");
