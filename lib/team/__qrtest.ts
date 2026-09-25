import fs from "fs";
import sharp from "sharp";
import { qrPng, qrSvg } from "./qr";
const SP = process.argv[2];
const { PNG } = require(SP + "/pgtest/node_modules/pngjs");
const jsQR = require(SP + "/pgtest/node_modules/jsqr");
(async () => {
  let ok = 0, total = 0;
  for (const slug of ["suraj-kumar-sah", "dipesh-kumar-mahato", "nisha-kumari-yadav", "deepa-paswan", "rahul-paswan", "raja-kumar-sah", "ramabtar-yadav"]) {
    const url = `https://leotechsolution.com.np/team/${slug}`;
    const big = await qrPng(url, 1024);
    if (slug === "suraj-kumar-sah") { fs.writeFileSync(SP + "/qr-fancy.png", big); fs.writeFileSync(SP + "/qr-fancy.svg", await qrSvg(url)); }
    const fails: string[] = [];
    for (const [px, blur] of [[1024, 0], [800, 0], [600, 0], [400, 0], [300, 0], [200, 0], [160, 0], [400, 1.5], [300, 1]] as const) {
      let img = sharp(big).resize(px, px);
      if (blur) img = img.blur(blur);
      const png = PNG.sync.read(await img.png().toBuffer());
      const r = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      total++;
      if (r?.data === url) ok++; else fails.push(`${px}${blur ? "b" : ""}`);
    }
    console.log(slug.padEnd(22), fails.length ? "fails: " + fails.join(",") : "all OK");
  }
  console.log(`${ok}/${total} decoded`);
})();
