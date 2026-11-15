import sharp from "sharp";

const jobs = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
];

for (const [file, size] of jobs) {
  await sharp("public/logo.svg").resize(size, size).png().toFile(file);
  console.log(`Wrote ${file}`);
}

