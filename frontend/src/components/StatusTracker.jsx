import { useLanguage } from '../i18n/LanguageContext';

const STEP_KEYS = [
  { label: 'status.stepSubmittedLabel', detail: 'status.stepSubmittedDetail' },
  { label: 'status.stepUnderReviewLabel', detail: 'status.stepUnderReviewDetail' },
  { label: 'status.stepCompletedLabel', detail: 'status.stepCompletedDetail' },
];

export default function StatusTracker({ steps }) {
  const { t } = useLanguage();
  return (
    <ol className="status-tracker">
      {steps.map((step, index) => (
        <li className={step.state} key={step.label}>
          <span className="tracker-icon">{step.state === 'complete' ? '✓' : index + 1}</span>
          <span><strong>{t(STEP_KEYS[index]?.label) || step.label}</strong><small>{t(STEP_KEYS[index]?.detail) || step.detail}</small></span>
        </li>
      ))}
    </ol>
  );
}
