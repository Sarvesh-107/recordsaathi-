import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import JourneyProgress from '../components/JourneyProgress';
import { useLanguage } from '../i18n/LanguageContext';
import { generateRemedy } from '../api/client';

function deriveCaseType(answers) {
  const values = new Set((answers || []).map((answer) => answer.value));
  if (values.has('mobile_changed')) return 'mobile_mismatch';
  if (values.has('before_2010') && values.has('renewed_since_2010') && values.has('exact_match')) return 'investigation';
  if (values.has('before_2010') && values.has('exact_match')) return 'legacy_digitization';
  return 'generic';
}

const REMEDY_CACHE_KEY = 'recordSaathiGeneratedRemedy';

function remedySignature(details, answers) {
  return JSON.stringify({ details: details || null, answers: answers || null });
}

function readCachedRemedy(details, answers) {
  try {
    const raw = sessionStorage.getItem(REMEDY_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || entry.signature !== remedySignature(details, answers)) return null;
    return entry.generated || null;
  } catch {
    return null;
  }
}

function writeCachedRemedy(details, answers, generated) {
  try {
    sessionStorage.setItem(REMEDY_CACHE_KEY, JSON.stringify({ signature: remedySignature(details, answers), generated }));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — reload-survival is best-effort only
  }
}

export default function Remedy() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t, language } = useLanguage();
  const [applicant, setApplicant] = useState({ fullName: '', rtoOffice: '', contact: '' });
  const [generated, setGenerated] = useState(() => {
    if (state?.generated) return state.generated;
    return readCachedRemedy(state?.details, state?.answers);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!state?.details || !state?.diagnosis) {
    return <section className="page"><h1>{t('remedy.completeFirst')}</h1><button className="primary-button" onClick={() => navigate('/')}>{t('common.goToHome')}</button></section>;
  }

  function update(field, value) { setApplicant((current) => ({ ...current, [field]: value })); }

  async function createLetter(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await generateRemedy({ recordDetails: state.details, diagnosis: state.diagnosis, answers: state.answers, applicant, language });
      setGenerated(result);
      writeCachedRemedy(state.details, state.answers, result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadLetter() {
    const text = `${generated.letter.subject}\n\n${generated.letter.letter}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RecordSaathi-RTO-request-letter.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function bookAppointment() {
    navigate('/status', { state: { referenceId: generated.referenceId, submittedAt: new Date().toISOString(), diagnosis: state.diagnosis, caseType: deriveCaseType(state.answers), generated } });
  }

  if (!generated) {
    return (
      <section className="page remedy-page">
        <JourneyProgress step={4} />
        <h1>{t('remedy.prepareHeading')}</h1>
        <p className="remedy-intro">{t('remedy.intro')}</p>
        <div className="diagnosis-summary"><strong>{state.diagnosis.likelyCause}</strong><p>{state.diagnosis.summary}</p></div>
        <form className="form-card" onSubmit={createLetter}>
          <label htmlFor="fullName">{t('remedy.fullNameLabel')}</label><input id="fullName" value={applicant.fullName} onChange={(event) => update('fullName', event.target.value)} required />
          <p className="field-help">{t('remedy.fullNameHelp')}</p>
          <label htmlFor="rtoOffice">{t('remedy.rtoOfficeLabel')}</label><input id="rtoOffice" value={applicant.rtoOffice} onChange={(event) => update('rtoOffice', event.target.value)} placeholder={t('remedy.rtoOfficePlaceholder')} required />
          <p className="field-help">{t('remedy.rtoOfficeHelp')}</p>
          <label htmlFor="contact">{t('remedy.contactLabel')}</label><input id="contact" value={applicant.contact} onChange={(event) => update('contact', event.target.value)} required />
          <p className="field-help">{t('remedy.contactHelp')}</p>
          <button className="primary-button" disabled={loading}>{loading ? t('remedy.generatingLetter') : t('remedy.generateLetter')} <em className="inline-demo">{t('common.demoBadge')}</em></button>
        </form>
        {error && <p className="error-message" role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <section className="remedy-output">
      <JourneyProgress step={4} />
      <div className="remedy-heading"><h1>{t('remedy.letterHeading')}</h1><p>{t('remedy.letterSubtitle')}</p></div>
      <article className="letter-card">
        <MockBadge />
        <p className="letter-subject"><strong>{t('remedy.subjectLabel')}</strong> {generated.letter.subject}</p>
        <div className="letter-text">{generated.letter.letter}</div>
        <p className="ai-disclaimer"><span className="material-symbols-outlined" aria-hidden="true">info</span>{t('remedy.aiDisclaimer')}</p>
      </article>
      <label className="confirm-checkbox">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        {t('remedy.confirmReviewed')}
      </label>
      <div className="letter-actions"><button className="secondary-button" onClick={downloadLetter} disabled={!confirmed}><span className="material-symbols-outlined" aria-hidden="true">download</span> {t('remedy.downloadCopy')} <em>{t('common.demoBadge')}</em></button><button className="primary-button" onClick={bookAppointment} disabled={!confirmed}><span className="material-symbols-outlined" aria-hidden="true">calendar_month</span> {t('remedy.bookAppointment')} <em>{t('common.demoBadge')}</em></button></div>
    </section>
  );
}
