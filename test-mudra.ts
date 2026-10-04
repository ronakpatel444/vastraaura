async function test() {
  const res = await fetch("https://mudraethnic.com/products/laheriya-anarkali-gown-for-women-pure-soft-fox-georgette-full-flare-navratri-gown-with-gamthi-work.js");
  const json = await res.json();
  console.log("Total images in JSON:", json.images.length);
  console.log("Options:", JSON.stringify(json.options, null, 2));
  console.log("Variants snippet:", JSON.stringify(json.variants.slice(0, 5), null, 2));
}
test();
