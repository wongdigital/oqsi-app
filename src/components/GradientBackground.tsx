import { motion } from 'motion/react';

interface GradientBackgroundProps {
  isVisible: boolean;
}

export function GradientBackground({ isVisible }: GradientBackgroundProps) {
  return (
    <>
      {/* SVG Filters for noise effect */}
      <svg className="hidden">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0.1" />
          <feBlend mode="multiply" in="SourceGraphic" result="blend" />
        </filter>
      </svg>

      {/* Gradient animation */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          background: isVisible
            ? [
                "linear-gradient(45deg, #d9d9ff, #ffd9d9)",
                "linear-gradient(45deg, #d9ffd9, #d9d9ff)",
                "linear-gradient(45deg, #ffd9d9, #d9ffd9)",
                "linear-gradient(45deg, #d9e6ff, #ffd9e6)",
                "linear-gradient(45deg, #d9d9ff, #ffd9d9)",
              ]
            : "linear-gradient(45deg, #d9d9ff, #ffd9d9)",
        }}
        transition={{
          opacity: { duration: 0.5 },
          background: {
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "linear",
          }
        }}
      />

      {/* Noise overlay */}
      <motion.div 
        className="absolute inset-0 z-5 mix-blend-multiply"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.3 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ filter: "url(#noise)" }} 
      />

      {/* Enhanced pulsing overlay */}
      <motion.div
        className="absolute inset-0 z-10 bg-white"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isVisible ? [0.05, 0.25, 0.05] : 0
        }}
        transition={{
          opacity: {
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }
        }}
      />
    </>
  );
} 