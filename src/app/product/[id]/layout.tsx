import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }> | { id: string };
  children: React.ReactNode;
};

// Fetch product data directly from DB for metadata since this is a server component
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    await dbConnect();
    const product = await Product.findById(resolvedParams.id);

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const title = `${product.name} | Vastra Aura`;
    const description = product.description || `Buy ${product.name} at Vastra Aura Surat. Handcrafted designer ethnic wear.`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://vastraaura.com/product/${product._id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://vastraaura.com/product/${product._id}`,
        siteName: 'Vastra Aura',
        images: [
          {
            url: product.image,
            width: 800,
            height: 1066,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [product.image],
      },
    };
  } catch (error) {
    return {
      title: 'Product | Vastra Aura',
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }> | { id: string };
}) {
  let productJsonLd = null;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const product = await Product.findById(resolvedParams.id);

    if (product) {
      const productImages = product.images && product.images.length > 0 
        ? [product.image, ...product.images] 
        : [product.image];

      const isAvailable = product.status === 'Active';

      productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": productImages,
        "description": product.description || `Buy authentic ${product.name} online at Vastra Aura Surat.`,
        "sku": product._id.toString(),
        "brand": {
          "@type": "Brand",
          "name": "Vastra Aura"
        },
        "offers": {
          "@type": "Offer",
          "url": `https://vastraaura.com/product/${product._id}`,
          "priceCurrency": "INR",
          "price": product.price,
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "itemCondition": "https://schema.org/NewCondition",
          "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Vastra Aura"
          }
        }
      };
    }
  } catch (e) {
    // Graceful fallback if db fails during layout render
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
