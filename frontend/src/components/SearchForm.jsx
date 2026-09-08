import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const DOB_SHAPE = /^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4})$/;

export default function SearchForm({ type, onSubmit, loading }) {
  const { t } = useLanguage();
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState({});
  const isDl = type === 'DL';

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!number.trim()) {
      nextErrors.number = isDl
        ? t('searchForm.errorEmptyDl')
        : t('searchForm.errorEmptyRc');
    }
    if (isDl && !dob.trim()) {
      nextErrors.dob = t('searchForm.errorEmptyDob');
    } else if (isDl && !DOB_SHAPE.test(dob.trim())) {
      nextErrors.dob = t('searchForm.errorInvalidDate');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type,
      number: number.trim().replace(/\s+/g, ' ').toUpperCase(),
      ...(isDl ? { dob: dob.trim() } : {}),
    });
  }

  function updateNumber(event) {
    setNumber(event.target.value.toUpperCase());
    if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
  }

  function updateDob(event) {
    setDob(event.target.value);
    if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }));
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <label htmlFor="number">{isDl ? t('searchForm.dlNumberLabel') : t('searchForm.rcNumberLabel')}</label>
      <input
        id="number"
        name="number"
        value={number}
        onChange={updateNumber}
        placeholder={isDl ? t('searchForm.dlPlaceholder') : t('searchForm.rcPlaceholder')}
        autoCapitalize="characters"
        aria-describedby={errors.number ? 'number-error' : undefined}
        aria-invalid={Boolean(errors.number)}
      />
      {errors.number && <p id="number-error" className="field-error" role="alert">{errors.number}</p>}
      {isDl ? (
        <>
          <label htmlFor="dob">{t('searchForm.dobLabel')}</label>
          <input
            id="dob"
            name="dob"
            type="text"
            inputMode="numeric"
            value={dob}
            onChange={updateDob}
            placeholder={t('searchForm.dobPlaceholder')}
            aria-describedby={errors.dob ? 'dob-error' : 'dob-help'}
            aria-invalid={Boolean(errors.dob)}
          />
          {errors.dob && <p id="dob-error" className="field-error" role="alert">{errors.dob}</p>}
          <span id="dob-help" className="field-help">{t('searchForm.dobHelp')}</span>
          <p className="field-help sample-hint"><strong>{t('searchForm.sampleLabel')}</strong> {t('searchForm.dlSample')}</p>
        </>
      ) : (
        <>
          <p className="field-help">{t('searchForm.rcHelp')}</p>
          <p className="field-help sample-hint"><strong>{t('searchForm.sampleLabel')}</strong> {t('searchForm.rcSample')}</p>
        </>
      )}
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? t('searchForm.checkingRecord') : t('searchForm.checkRecord')}
      </button>
    </form>
  );
}
