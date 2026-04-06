'use client';

import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function AnimatedText({
  text,
  delay = 0,
  className = '',
}: AnimatedTextProps) {
  const letters = text.split('');

  return (
    <motion.div className={className}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: delay + i * 0.05,
                duration: 0.4,
                ease: 'easeOut',
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
