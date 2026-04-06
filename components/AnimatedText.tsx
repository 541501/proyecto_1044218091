'use client';

import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
}

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function AnimatedText({ text, delay = 0 }: AnimatedTextProps) {
  const letters = text.split('');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="inline-block"
      style={{ display: 'inline-block' }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i + delay}
          variants={letterVariants}
          className="inline-block"
          style={{
            textShadow: '0 0 40px rgba(255,255,255,0.3)',
            display: 'inline-block',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}