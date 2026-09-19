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
              className="flex items-center justify-center md:justify-start gap-2 text-accent mb-3"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold tracking-widest uppercase">Festive Special</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">
              Elevate Your Wardrobe <br className="hidden md:block"/> With Our Premium Collection
            </h2>
            <p className="text-gray-400 max-w-md mx-auto md:mx-0">
              Experience the luxury of traditional craftsmanship. Enjoy a special discount on your next purchase.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="flex-1 w-full flex justify-center md:justify-end"
          >
            <div className="bg-white text-black p-6 rounded-xl flex flex-col items-center shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 w-full max-w-sm">
              <Gift className="w-8 h-8 mb-3 text-black" />
              <div className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-1">Use Code</div>
              <div className="text-3xl font-black tracking-wider border-2 border-dashed border-black py-3 px-8 rounded-lg mb-3 bg-gray-50 w-full text-center">
                WELCOME20
              </div>
              <div className="text-sm font-medium">Get 20% OFF on all orders</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
