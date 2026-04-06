'use client';

import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function HolaMundo({ title, subtitle, description }: HolaMundoProps) {
  return (
    <div className="text-center select-none">
      {/* Título animado letra por letra */}
      <motion.h1
        className="text-7xl md:text-9xl font-bold tracking-tight text-white mb-6"
        aria-label={title}
      >
        <AnimatedText text={title} />
      </motion.h1>

      {/* Subtítulo con fade-in retardado */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: title.length * 0.08 + 0.3, duration: 0.8 }}
        className="text-lg text-white/40 font-light tracking-widest uppercase mb-8"
      >
        {subtitle}
      </motion.p>

      {/* Descripción opcional */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: title.length * 0.08 + 0.8, duration: 0.6 }}
          className="text-sm text-white/60 max-w-md mx-auto mb-8"
        >
          {description}
        </motion.p>
      )}

      {/* Línea decorativa */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: title.length * 0.08 + 1.2, duration: 0.6 }}
        className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto w-64"
      />
    </div>
  );
}