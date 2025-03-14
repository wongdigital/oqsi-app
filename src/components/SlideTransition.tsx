import React, { ReactNode } from "react";
import { motion, AnimatePresence } from 'motion/react';

// Define transition types
type TransitionType = "fade" | "slide";

interface SlideTransitionProps {
  children: ReactNode;
  slideKey: number | string;
  direction?: "left" | "right";
  transitionType?: TransitionType;
}

export function SlideTransition({ 
  children, 
  slideKey,
  direction = "left",
  transitionType = "slide"
}: SlideTransitionProps) {
  // Container slide animation (handles the wipe effect)
  const slideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? "100%" : "-100%",
    }),
    center: {
      x: 0,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? "-100%" : "100%",
    }),
  };

  // Fade animation
  const fadeVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  // Content animation (handles the fade effect)
  const contentVariants = {
    enter: {
      opacity: 0,
      scale: 0.98,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
    },
  };

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slideKey}
          custom={direction}
          variants={transitionType === "slide" ? slideVariants : fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { 
              type: "tween", 
              duration: 0.5, 
              ease: "easeInOut" 
            },
            opacity: {
              duration: 0.5,
              ease: "easeInOut"
            }
          }}
          className="w-full"
        >
          {/* Inner content with separate fade animation */}
          <motion.div
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { 
                duration: 0.5,
                ease: "easeInOut",
                delay: transitionType === "slide" ? 0.2 : 0 // Only delay for slide transitions
              },
              scale: {
                duration: 0.5,
                ease: "easeOut",
                delay: transitionType === "slide" ? 0.2 : 0
              }
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 