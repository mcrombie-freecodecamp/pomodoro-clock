import { Minus, Plus } from 'lucide-react';

interface LengthControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

export default function LengthControl({
  id,
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: LengthControlProps) {
  return (
    <div className="length-control">
      <span className="length-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="stepper" role="group" aria-labelledby={`${id}-label`}>
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label} length`}
        >
          <Minus size={13} />
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
        </span>
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label} length`}
        >
          <Plus size={13} />
        </button>
      </div>
      <span className="length-unit">min</span>
    </div>
  );
}
