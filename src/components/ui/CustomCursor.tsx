'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function CustomCursor() {
  const cursorType = useStore((state) => state.cursorType);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  const isView = cursorType === 'VIEW';
  const isDrag = cursorType === 'DRAG';

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[100] mix-blend-difference flex items-center justify-center"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <motion.div
        className="bg-white rounded-full flex items-center justify-center text-black font-medium text-[10px] tracking-widest overflow-hidden"
        initial={{ width: 12, height: 12 }}
        animate={{
          width: isView || isDrag ? 64 : 12,
          height: isView || isDrag ? 64 : 12,
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isView || isDrag ? 1 : 0, scale: isView || isDrag ? 1 : 0.5 }}
          transition={{ delay: 0.1 }}
        >
          {cursorType}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
