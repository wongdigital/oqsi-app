import { useState } from 'react';
import { LightOn, LightOff } from '@/lib/icons';

interface LightSwitchProps {
  initialState?: boolean;
  size?: number;
  onChange?: (isOn: boolean) => void;
  className?: string;
}

export const LightSwitch: React.FC<LightSwitchProps> = ({
  initialState = false,
  size = 16,
  onChange,
  className = '',
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleClick = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange?.(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      aria-label={isOn ? 'Turn light off' : 'Turn light on'}
      type="button"
    >
      {isOn ? (
        <LightOn size={size} />
      ) : (
        <LightOff size={size} />
      )}
    </button>
  );
}; 