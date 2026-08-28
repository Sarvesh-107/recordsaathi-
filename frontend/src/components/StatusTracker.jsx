export default function StatusTracker({ steps }) {
  return (
    <ol className="status-tracker">
      {steps.map((step, index) => (
        <li className={step.state} key={step.label}>
          <span className="tracker-icon">{step.state === 'complete' ? '✓' : index + 1}</span>
          <span><strong>{step.label}</strong><small>{step.detail}</small></span>
        </li>
      ))}
    </ol>
  );
}
