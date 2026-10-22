'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is Vastra Aura?",
    answer: "Vastra Aura is Surat's premier luxury ethnic fashion label, celebrated for handcrafted Chaniya Choli, designer Lehengas, festive 3-Piece Suits, and contemporary Indian attire. Every garment brings together master artisans, royal silhouettes, and traditional textile heritage."
  },
  {
    question: "Where is Vastra Aura located?",
    answer: "Vastra Aura is based in Surat, Gujarat — the textile capital of India. Our flagship studio is located at Vijay Nagar, Yogi Chowk, Surat, Gujarat, India. We deliver authentic ethnic wear directly to customers across India and worldwide."
  },
  {
    question: "How can I buy authentic Vastra Aura designer collections online?",
    answer: "You can explore and order our full designer catalog directly through our official website vastraaura.com. We provide secure online payments, UPI, Net Banking, Cash on Delivery (COD) across India, and insured express doorstep shipping."
  },
  {
    question: "What collections does Vastra Aura offer?",
    answer: "Our curated catalog features exclusive Diwali 3-Piece Suits, breathable cotton Short Kurtis, modern 2-Piece Co-ord sets, royal bridal and wedding Lehengas, luxury Roman Silk ensembles, festive Chaniya Cholis, and classic Indian Sarees."
  },
  {
    question: "How do I contact Vastra Aura for bridal consultations or customer support?",
    answer: "Our dedicated stylist and support team is available Monday through Saturday. You can reach us by email at hello@vastraaura.com or through WhatsApp/phone for custom sizing assistance, bridal orders, and order tracking."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-20 md:py-32 px-4 md:px-6 bg-background text-foreground border-t border-foreground/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-accent block mb-3 font-medium">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-serif tracking-wide">
            Everything About Vastra Aura
          </h2>
          <p className="mt-4 text-sm md:text-base opacity-70 max-w-xl mx-auto font-light leading-relaxed">
            Discover our heritage, craft, ordering process, and the story behind Surat's signature ethnic fashion label.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-foreground/10 rounded-lg overflow-hidden transition-colors hover:border-accent/40 bg-foreground/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg font-serif font-medium tracking-wide">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 text-accent transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm md:text-base opacity-75 font-light leading-relaxed border-t border-foreground/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
