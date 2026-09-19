export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-16">Returns & Exchanges</h1>
        
        <div className="prose prose-stone mx-auto text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">Our Commitment</h2>
            <p className="text-sm leading-relaxed">
              At Rangrez, every piece is handcrafted with immense love and care. We want you to be completely satisfied with your purchase. If for any reason you are not, we gladly accept returns and exchanges under the following conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">Eligibility for Return/Exchange</h2>
            <ul className="text-sm leading-relaxed list-disc pl-5 space-y-2">
              <li>Items must be returned within 14 days of delivery.</li>
              <li>The garment must be unworn, unwashed, and have all original tags intact.</li>
              <li>Custom-stitched or altered items are final sale and cannot be returned or exchanged.</li>
              <li>Jewelry and accessories are non-returnable for hygiene reasons.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">How to Initiate a Return</h2>
            <ol className="text-sm leading-relaxed list-decimal pl-5 space-y-2">
              <li>Contact our support team at <a href="mailto:hello@rangrez.com" className="underline">hello@rangrez.com</a> with your order number.</li>
              <li>Our team will arrange a reverse pickup from your address within 2-3 business days.</li>
              <li>Once we receive the item at our studio, it will undergo a quality check.</li>
              <li>Upon approval, your refund will be processed to the original payment method within 5-7 business days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">International Orders</h2>
            <p className="text-sm leading-relaxed">
              For international orders, the customer is responsible for return shipping costs. Please ensure you use a trackable shipping service as we cannot guarantee receipt of returned items.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
