import { FC } from 'react';
import { motion } from 'motion/react';

interface SpeakerProps {
  isPlaying: boolean;
}

export const Speaker: FC<SpeakerProps> = ({ isPlaying }) => {
  return (
    <svg width="72" height="24" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.1055 1H55.8945C56.5429 1 57.0837 1.49579 57.1398 2.14176L58.7913 21.1418C58.8547 21.8721 58.279 22.5 57.546 22.5H14.454C13.721 22.5 13.1453 21.8721 13.2087 21.1418L14.8602 2.14176C14.9163 1.49579 15.4571 1 16.1055 1Z" stroke="black" strokeWidth="2"/>
      <circle cx="36" cy="8" r="4" fill="black"/>
      <circle cx="45" cy="8" r="2" fill="black"/>
      <circle cx="39" cy="16" r="2" fill="black"/>
      <circle cx="33" cy="16" r="2" fill="black"/>
      <circle cx="21" cy="8" r="2" fill="black"/>
      <circle cx="21" cy="16" r="2" fill="black"/>
      <circle cx="51" cy="8" r="2" fill="black"/>
      <circle cx="51" cy="16" r="2" fill="black"/>
      <circle cx="45" cy="16" r="2" fill="black"/>
      <circle cx="27" cy="8" r="2" fill="black"/>
      <circle cx="27" cy="16" r="2" fill="black"/>
      {/* Right Sound Wave */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0 }}
        transition={{
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut"
        }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62.25 6.28703C63.7754 6.76252 64.8826 8.18582 64.8826 9.86774C64.8826 11.5199 63.8142 12.9225 62.3306 13.4223L63.2485 15.7505C65.659 14.8834 67.3826 12.5768 67.3826 9.86774C67.3826 7.12885 65.6209 4.80143 63.1688 3.95691L62.25 6.28703Z"
        fill="black"
      />
      <motion.path
        initial={{ opacity: 0 }}
        animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0 }}
        transition={{
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.2
        }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M63.9951 2.32735C67.1887 3.46566 69.4746 6.5162 69.4746 10.1006C69.4746 13.6553 67.2266 16.6849 64.0746 17.8451L64.9921 20.172C69.0709 18.6455 71.9746 14.7122 71.9746 10.1006C71.9746 5.45928 69.0332 1.50493 64.9128 0L63.9951 2.32735Z"
        fill="black"
      />
      {/* Left Sound Wave */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0 }}
        transition={{
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut"
        }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.75 6.28703C8.22464 6.76252 7.11737 8.18582 7.11737 9.86774C7.11737 11.5199 8.18581 12.9225 9.66944 13.4223L8.75146 15.7505C6.34101 14.8834 4.61737 12.5768 4.61737 9.86774C4.61737 7.12885 6.37913 4.80143 8.83124 3.95691L9.75 6.28703Z"
        fill="black"
      />
      <motion.path
        initial={{ opacity: 0 }}
        animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0 }}
        transition={{
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.2
        }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00488 2.32735C4.8113 3.46566 2.52535 6.5162 2.52535 10.1006C2.52535 13.6553 4.77344 16.6849 7.9254 17.8451L7.00793 20.172C2.9291 18.6455 0.0253523 14.7122 0.0253523 10.1006C0.0253523 5.45928 2.96678 1.50493 7.08721 0L8.00488 2.32735Z"
        fill="black"
      />
    </svg>
  );
}; 