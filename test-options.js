async function test() {
  const res = await fetch('https://mudraethnic.com/products/women-s-gujarati-kediya-top-gamthi-embroidery-gota-patti-real-mirror-work-rayon-cotton-navratri-garba-dandiya-festive-wear.js');
  const json = await res.json();
  console.log(JSON.stringify(json.options, null, 2));
}
test();
