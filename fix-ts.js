const fs = require('fs');

function fixCombo() {
  const path = 'src/app/combo/page.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/_id/g, 'id');
  fs.writeFileSync(path, content);
}

function fixProduct() {
  const path = 'src/app/product/[id]/page.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/StockBySize/g, 'ProductSize[]');
  content = content.replace(/product\.stockBySize/g, 'product.sizes');
  content = content.replace(/Object\.entries\(product\.sizes\)/g, 'product.sizes.map(s => [s.name, s.stock])');
  fs.writeFileSync(path, content);
}

function fixAdminDrawer() {
  const path = 'src/components/admin/ProductFormDrawer.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/StockBySize/g, 'ProductSize[]');
  content = content.replace(/product\.stockBySize/g, 'product.sizes');
  content = content.replace(/Object\.values\(product\.sizes\)\.reduce\(\(a, b\) => a \+ b, 0\)/g, '(product.sizes || []).reduce((a, b) => a + (b.stock || 0), 0)');
  fs.writeFileSync(path, content);
}

fixCombo();
fixProduct();
fixAdminDrawer();
