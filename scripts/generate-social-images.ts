import sharp from "sharp";
import { siteUrl } from "../lib/site";

const hostname = new URL(siteUrl).hostname;
const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111315"/>
  <rect x="55" y="60" width="51" height="51" rx="15" fill="#b5f0cf"/>
  <g fill="none" stroke="#15271d" stroke-width="2">
    <circle cx="80" cy="85" r="17"/><circle cx="80" cy="85" r="10"/>
    <path d="M80 85 92 73"/>
  </g>
  <text x="125" y="96" fill="#eff2f0" font-family="Arial" font-size="28" font-weight="600">AssetRadar<tspan fill="#b5f0cf">.</tspan></text>
  <text x="57" y="239" fill="#eff2f0" font-family="Arial" font-size="62" font-weight="600" letter-spacing="-3">Your next world</text>
  <text x="57" y="312" fill="#b5f0cf" font-family="Arial" font-size="62" font-weight="600" letter-spacing="-3">starts here.</text>
  <text x="60" y="369" fill="#a7b2ad" font-family="Arial" font-size="21">Free game assets. Verified licenses.</text>
  <path d="M60 500H1140" stroke="#2c3630"/>
  <text x="60" y="547" fill="#b5f0cf" font-family="Arial" font-size="16" letter-spacing="2">FIND YOUR PIECES. BUILD YOUR WORLD.</text>
  <text x="1126" y="547" text-anchor="end" fill="#9eaba4" font-family="Arial" font-size="16">${hostname}</text>
</svg>`;
async function main() {
  const island = await sharp("public/previews/hero-nature.webp")
    .resize(550, 335, { fit: "contain", background: "#111315" })
    .png()
    .toBuffer();

  await sharp(Buffer.from(panel))
    .composite([{ input: island, left: 620, top: 136 }])
    .jpeg({ quality: 88 })
    .toFile("public/og.jpg");

  console.log(`Social cover generated for ${hostname} from licensed artwork.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
