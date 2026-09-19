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

    const title = `${product.name} | VASTRA AURA`;
    const description = product.description || `Buy ${product.name} at VASTRA AURA`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
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
      title: 'Product | VASTRA AURA',
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
