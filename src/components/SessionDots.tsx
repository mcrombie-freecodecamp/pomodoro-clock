interface SessionDotsProps {
  completed: number;
  total: number;
}

export default function SessionDots({ completed, total }: SessionDotsProps) {
  return (
    <div
      className="session-dots"
      role="img"
      aria-label={`${completed} of ${total} sessions completed in this cycle`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`session-dot ${i < completed ? 'session-dot--active' : 'session-dot--inactive'}`}
        />
      ))}
    </div>
  );
}
