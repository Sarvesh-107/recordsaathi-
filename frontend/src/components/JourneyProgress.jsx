const STAGES = ['Search', 'Not Found', 'Diagnostic', 'Letter', 'Status'];

export default function JourneyProgress({ step }) {
  return (
    <div className="journey-progress">
      <p className="progress-label"><strong>Step {step} of {STAGES.length} · {STAGES[step - 1]}</strong></p>
      <div className="progress-track"><span style={{ width: `${(step / STAGES.length) * 100}%` }} /></div>
    </div>
  );
}
