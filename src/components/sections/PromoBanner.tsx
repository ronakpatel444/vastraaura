'use client';

import { motion } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="bg-black text-white py-12 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-black border border-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl"
        >
          <div className="flex-1 mb-8 md:mb-0 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center md:justify-start gap-2 text-amber-400 mb-3"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold tracking-widest uppercase">🪔 Diwali Dhamaka Festive Sale</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight text-white">
              Celebrate The Festival of Lights <br className="hidden md:block"/> In Royal Handcrafted Luxury
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto md:mx-0 text-sm leading-relaxed">
              Special Diwali savings on Surat&apos;s finest <strong>Grand 3-Piece Suits</strong>, chic <strong>2-Piece Coord Sets</strong>, and breathable <strong>Cotton Short Kurtis</strong>. Enjoy insured free shipping across India!
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="flex-1 w-full flex justify-center md:justify-end"
          >
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F5EEDC] text-neutral-900 p-6 rounded-2xl flex flex-col items-center shadow-2xl border-2 border-amber-400/60 transform rotate-1 hover:rotate-0 transition-transform duration-300 w-full max-w-sm">
              <div className="text-2xl mb-2">🪔</div>
              <div className="text-xs uppercase tracking-widest text-amber-800 font-bold mb-1">Diwali Festive Promo Code</div>
              <div className="text-3xl font-mono font-black tracking-widest border-2 border-dashed border-amber-600 py-2.5 px-6 rounded-xl mb-2 bg-white w-full text-center text-amber-950 shadow-inner">
                DIWALI20
              </div>
              <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <span className="text-amber-600">✨</span>
                <span>Flat 20% OFF on all Festive Orders</span>
                <span className="text-amber-600">✨</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
