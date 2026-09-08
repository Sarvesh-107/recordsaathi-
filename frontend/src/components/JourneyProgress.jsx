import { useLanguage } from '../i18n/LanguageContext';

const STAGE_LABEL_KEYS = ['stageSearch', 'stageNotFound', 'stageDiagnostic', 'stageLetter', 'stageStatus'];

export default function JourneyProgress({ step }) {
  const { t } = useLanguage();
  const total = STAGE_LABEL_KEYS.length;

  return (
    <div className="journey-progress">
      <p className="progress-label"><strong>{t('diagnostic.stepOf', { current: step, total })} · {t(`journey.${STAGE_LABEL_KEYS[step - 1]}`)}</strong></p>
      <div className="progress-track"><span style={{ width: `${(step / total) * 100}%` }} /></div>
    </div>
  );
}
