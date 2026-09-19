export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-16">Privacy Policy</h1>
        
        <div className="prose prose-stone mx-auto text-foreground/80 space-y-8">
          <p className="text-sm italic">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              When you visit Rangrez, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 mt-4 space-y-2">
              <li><strong>Order Information:</strong> Name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.</li>
              <li><strong>Device Information:</strong> Version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-sm leading-relaxed">
              We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
            </p>
            <p className="text-sm leading-relaxed mt-4">
              Additionally, we use this Order Information to:
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 mt-2 space-y-2">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud; and</li>
              <li>Provide you with information or advertising relating to our products or services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">Data Retention</h2>
            <p className="text-sm leading-relaxed">
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
