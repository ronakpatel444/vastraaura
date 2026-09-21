
import { execSync } from 'child_process';
import path from 'path';

async function scrapeCollection(collectionUrl: string, category: string) {
  try {
    // Extract base shop URL and collection handle
    // e.g. https://mudraethnic.com/collections/navratri-special
    const urlObj = new URL(collectionUrl);
    let collectionPath = urlObj.pathname; // /collections/navratri-special/navratri
    
    // Sometimes URLs have extra tags like /collections/navratri-special/navratri
    // We just want the base collection for the JSON api: /collections/navratri-special
    const pathParts = collectionPath.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'collections') {
       collectionPath = `/collections/${pathParts[1]}`;
    }

    let successCount = 0;
    let totalFound = 0;

    for (let page = 1; page <= 2; page++) {
      const jsonUrl = `${urlObj.origin}${collectionPath}/products.json?limit=250&page=${page}`;
      console.log(`🔍 Fetching collection page ${page} from: ${jsonUrl}`);

      const res = await fetch(jsonUrl);
      if (!res.ok) {
        console.error(`Failed to fetch collection JSON page ${page}: ${res.statusText}`);
        continue;
      }

      const data = await res.json();
      const products = data.products;

      if (!products || !Array.isArray(products) || products.length === 0) {
        console.log(`⚠️ No products found on page ${page}.`);
        break;
      }

      console.log(`🎉 Found ${products.length} products on page ${page}!`);
      totalFound += products.length;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productUrl = `${urlObj.origin}/products/${product.handle}`;
        
        console.log(`\n[Page ${page}] [${i + 1}/${products.length}] Scraping: ${product.title}`);
        
        try {
          // Run the scrape-product.ts script using npx tsx via cmd to avoid execution policy issues
          execSync(`cmd.exe /c npx tsx scrape-product.ts ${productUrl} "${category}"`, { stdio: 'inherit' });
          successCount++;
        } catch (err) {
          console.error(`❌ Failed to scrape ${productUrl}`);
        }
      }
    }

    console.log(`\n✅ Bulk scraping complete! Successfully added ${successCount}/${totalFound} products.`);
  } catch (error) {
    console.error('❌ Error scraping collection:', error);
  }
}

const url = process.argv[2];
const category = process.argv[3] || 'Chaniya Choli';

if (!url) {
  console.log('Usage: npx ts-node scrape-collection.ts <Collection_URL> [Category]');
  process.exit(1);
}

scrapeCollection(url, category);
