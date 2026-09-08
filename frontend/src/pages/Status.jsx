import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import StatusTracker from '../components/StatusTracker';
import { useLanguage } from '../i18n/LanguageContext';
import { getStatus, generateRemedy } from '../api/client';

const ACTIVE_REQUEST_KEY = 'recordsaathi:activeRequest';

function readSavedRequest() {
  try {
    const raw = localStorage.getItem(ACTIVE_REQUEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.referenceId === 'string' && parsed.referenceId) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveActiveRequest(referenceId, submittedAt, caseType) {
  try {
    const existing = readSavedRequest();
    const resolvedSubmittedAt = submittedAt || existing?.submittedAt || null;
    const resolvedCaseType = caseType || existing?.caseType || 'generic';
    localStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify({ ...existing, referenceId, submittedAt: resolvedSubmittedAt, caseType: resolvedCaseType }));
  } catch {
    // localStorage unavailable (e.g. private browsing) — persistence is best-effort only
  }
}

function markEscalated() {
  try {
    const existing = readSavedRequest() || {};
    const escalatedAt = new Date().toISOString();
    localStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify({ ...existing, escalatedAt }));
    return escalatedAt;
  } catch {
    return null;
  }
}

function formatDateForPrompt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
}

const CASE_TYPE_KEYS = { mobile_mismatch: 'status.caseTypeMismatch', investigation: 'status.caseTypeInvestigation', legacy_digitization: 'status.caseTypeLegacy' };

function caseTypeLabel(t, caseType) {
  return t(CASE_TYPE_KEYS[caseType] || 'status.caseTypeGeneric');
}

function formatBareDate(locale, value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSubmittedDate(t, locale, value) {
  const bareDate = formatBareDate(locale, value);
  if (!bareDate) return t('status.submissionUnavailable');
  return t('status.submittedOn', { date: bareDate });
}

export default function Status() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t, locale, language } = useLanguage();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const saved = readSavedRequest();
  const referenceId = state?.referenceId || saved?.referenceId || null;
  const submittedAt = state?.submittedAt || saved?.submittedAt || null;
  const caseType = state?.caseType || saved?.caseType || 'generic';
  const [escalatedAt, setEscalatedAt] = useState(saved?.escalatedAt || null);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationApplicant, setEscalationApplicant] = useState({ fullName: '', rtoOffice: '', contact: '' });
  const [escalationLetter, setEscalationLetter] = useState(null);
  const [escalationConfirmed, setEscalationConfirmed] = useState(false);
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationError, setEscalationError] = useState('');

  useEffect(() => {
    if (!referenceId) return;
    saveActiveRequest(referenceId, submittedAt, caseType);
    getStatus(referenceId).then(setStatus).catch((requestError) => setError(requestError.message));
  }, [referenceId, submittedAt, caseType]);

  function updateEscalationApplicant(field, value) {
    setEscalationApplicant((current) => ({ ...current, [field]: value }));
  }

  async function submitEscalation(event) {
    event.preventDefault();
    setEscalationLoading(true);
    setEscalationError('');
    try {
      const result = await generateRemedy({
        escalation: { referenceId, caseType: caseTypeLabel(t, caseType), submittedAt: formatDateForPrompt(submittedAt) },
        applicant: escalationApplicant,
        language,
      });
      setEscalationLetter(result.letter);
    } catch (requestError) {
      setEscalationError(requestError.message);
    } finally {
      setEscalationLoading(false);
    }
  }

  function downloadEscalationLetter() {
    const text = `${escalationLetter.subject}\n\n${escalationLetter.letter}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RecordSaathi-follow-up-letter.txt';
    link.click();
    URL.revokeObjectURL(url);
    setEscalatedAt(markEscalated());
  }

  if (!referenceId) {
    return (
      <section className="page">
        <h1>{t('status.noActiveHeading')}</h1>
        <p>{t('status.noActiveText')}</p>
        <button className="primary-button" onClick={() => navigate('/')}>{t('common.goToHome')}</button>
      </section>
    );
  }

  return (
    <section className="status-page">
      <div className="status-heading"><p className="step-indicator">{t('status.trackingLabel')}</p><h1>{t('status.heading')}</h1><p>{t('status.subheading')}</p></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {!status && !error && <p className="loading-copy">{t('status.loading')}</p>}
      {status && (
        <article className="status-card">
          <button type="button" className="status-summary" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
            <div>
              <span>{t('status.caseLabel', { caseType: caseTypeLabel(t, caseType) })}</span>
              <strong>{t('status.refLabel', { referenceId: status.referenceId })}</strong>
              <small>{formatSubmittedDate(t, locale, submittedAt)}</small>
            </div>
            <span className="material-symbols-outlined" aria-hidden="true">{expanded ? 'expand_less' : 'expand_more'}</span>
          </button>
          {expanded && (
            <div className="status-details">
              <div className="case-summary"><strong>{t('status.caseOpenedFor', { caseType: caseTypeLabel(t, caseType) })}</strong></div>
              <div className="status-badges"><MockBadge /><b className="review-badge"><span className="material-symbols-outlined" aria-hidden="true">sync</span>{t('status.underReview')}</b></div>
              <p className="simulated-notice"><span className="material-symbols-outlined" aria-hidden="true">info</span>{t('status.simulatedNotice')}</p>
              <StatusTracker steps={status.steps} />
              <div className="next-step"><span className="material-symbols-outlined" aria-hidden="true">info</span><div><strong>{t('status.whatHappensNext')}</strong><p>{t('status.nextStepText')}</p></div></div>
              <div className="next-step"><span className="material-symbols-outlined" aria-hidden="true">alt_route</span><div><strong>{t('status.mapsToRealTitle')}</strong><p>{t('status.mapsToRealText')}</p></div></div>

              <div className="escalation-block">
                {escalatedAt && (
                  <p className="field-help escalation-marker">
                    <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                    {t('status.escalatedOn', { date: formatBareDate(locale, escalatedAt) })}
                  </p>
                )}

                {!escalationLetter && !escalationOpen && (
                  <button type="button" className="secondary-button" onClick={() => setEscalationOpen(true)}>
                    <span className="material-symbols-outlined" aria-hidden="true">flag</span> {t('status.escalateButton')}
                  </button>
                )}

                {!escalationLetter && escalationOpen && (
                  <form className="form-card" onSubmit={submitEscalation}>
                    <p className="field-help">{t('status.escalateIntro')}</p>
                    <label htmlFor="escalationFullName">{t('remedy.fullNameLabel')}</label>
                    <input id="escalationFullName" value={escalationApplicant.fullName} onChange={(event) => updateEscalationApplicant('fullName', event.target.value)} required />
                    <p className="field-help">{t('remedy.fullNameHelp')}</p>
                    <label htmlFor="escalationRtoOffice">{t('remedy.rtoOfficeLabel')}</label>
                    <input id="escalationRtoOffice" value={escalationApplicant.rtoOffice} onChange={(event) => updateEscalationApplicant('rtoOffice', event.target.value)} placeholder={t('remedy.rtoOfficePlaceholder')} required />
                    <p className="field-help">{t('remedy.rtoOfficeHelp')}</p>
                    <label htmlFor="escalationContact">{t('remedy.contactLabel')}</label>
                    <input id="escalationContact" value={escalationApplicant.contact} onChange={(event) => updateEscalationApplicant('contact', event.target.value)} required />
                    <p className="field-help">{t('remedy.contactHelp')}</p>
                    <button className="primary-button" disabled={escalationLoading}>{escalationLoading ? t('remedy.generatingLetter') : t('status.escalateGenerate')} <em className="inline-demo">{t('common.demoBadge')}</em></button>
                  </form>
                )}
                {escalationError && <p className="error-message" role="alert">{escalationError}</p>}

                {escalationLetter && (
                  <>
                    <article className="letter-card">
                      <MockBadge />
                      <p className="letter-subject"><strong>{t('remedy.subjectLabel')}</strong> {escalationLetter.subject}</p>
                      <div className="letter-text">{escalationLetter.letter}</div>
                      <p className="ai-disclaimer"><span className="material-symbols-outlined" aria-hidden="true">info</span>{t('remedy.aiDisclaimer')}</p>
                    </article>
                    <label className="confirm-checkbox">
                      <input type="checkbox" checked={escalationConfirmed} onChange={(event) => setEscalationConfirmed(event.target.checked)} />
                      {t('remedy.confirmReviewed')}
                    </label>
                    <div className="letter-actions">
                      <button className="secondary-button" onClick={downloadEscalationLetter} disabled={!escalationConfirmed}>
                        <span className="material-symbols-outlined" aria-hidden="true">download</span> {t('status.escalateDownload')} <em>{t('common.demoBadge')}</em>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
