'use client';

import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description?: string;
  animationStyle?: 'typewriter' | 'fadeIn' | 'slideUp';
}

export default function HolaMundo({
  title,
  subtitle,
  description = 'Sistema fullstack funcionando correctamente.',
  animationStyle = 'typewriter',
}: HolaMundoProps) {
  const titleDelay = 0;
  const subtitleDelay = title.length * 0.05 + 0.4;
  const decorativeDelay = subtitleDelay + 0.5;

  return (
    <div className="flex flex-col items-center justify-center text-center select-none px-4">
      {/* Título animado - letra por letra */}
      <motion.div
        className="font-playfair text-7xl md:text-9xl font-bold tracking-tight text-white mb-2"
        style={{ lineHeight: '1.1' }}
      >
        <AnimatedText text={title} delay={titleDelay} />
      </motion.div>

      {/* Línea decorativa animada */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          delay: decorativeDelay,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="h-1 w-32 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-8 rounded-full"
        style={{ transformOrigin: 'center' }}
      />

      {/* Subtítulo con fade-in */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: subtitleDelay,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="font-poppins text-lg md:text-xl text-white/80 font-light tracking-wide uppercase mb-4"
      >
        {subtitle}
      </motion.p>

      {/* Descripción con fade-in más retardado */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: subtitleDelay + 0.3,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="font-poppins text-sm md:text-base text-white/60 max-w-md"
      >
        {description}
      </motion.p>

      {/* Información del usuario */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: subtitleDelay + 0.6,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="mt-8 space-y-2 text-white/70"
      >
        <p className="font-poppins text-sm md:text-base">
          <span className="text-cyan-400 font-semibold">Nombre:</span> Juan Gutierrez M.
        </p>
        <p className="font-poppins text-sm md:text-base">
          <span className="text-cyan-400 font-semibold">Documento:</span> 1044218091
        </p>
      </motion.div>

      {/* Efecto glow animado bajo el texto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{
          delay: decorativeDelay + 0.5,
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute -bottom-20 w-72 h-72 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ zIndex: -1 }}
      />
    </div>
  );
}
