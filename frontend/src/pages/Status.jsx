import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import StatusTracker from '../components/StatusTracker';
import { getStatus } from '../api/client';

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

function saveActiveRequest(referenceId, submittedAt) {
  try {
    const existing = readSavedRequest();
    const resolvedSubmittedAt = submittedAt || existing?.submittedAt || null;
    localStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify({ referenceId, submittedAt: resolvedSubmittedAt }));
  } catch {
    // localStorage unavailable (e.g. private browsing) — persistence is best-effort only
  }
}

function formatSubmittedDate(value) {
  if (!value) return 'Submission date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Submission date unavailable';
  return `Submitted on ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function Status() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const saved = readSavedRequest();
  const referenceId = state?.referenceId || saved?.referenceId || null;
  const submittedAt = state?.submittedAt || saved?.submittedAt || null;

  useEffect(() => {
    if (!referenceId) return;
    saveActiveRequest(referenceId, submittedAt);
    getStatus(referenceId).then(setStatus).catch((requestError) => setError(requestError.message));
  }, [referenceId, submittedAt]);

  if (!referenceId) {
    return (
      <section className="page">
        <h1>No active request yet</h1>
        <p>You don&apos;t have a saved request to track. Start a search to check your record and create one.</p>
        <button className="primary-button" onClick={() => navigate('/')}>Go to home</button>
      </section>
    );
  }

  return (
    <section className="status-page">
      <div className="status-heading"><p className="step-indicator">Request tracking</p><h1>Status Tracking</h1><p>Check the progress of your recent request.</p></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {!status && !error && <p className="loading-copy">Loading your demo status…</p>}
      {status && (
        <article className="status-card">
          <button type="button" className="status-summary" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
            <div>
              <span>Reference ID</span>
              <strong>{status.referenceId}</strong>
              <small>{formatSubmittedDate(submittedAt)}</small>
            </div>
            <span className="material-symbols-outlined" aria-hidden="true">{expanded ? 'expand_less' : 'expand_more'}</span>
          </button>
          {expanded && (
            <div className="status-details">
              <div className="status-badges"><MockBadge /><b className="review-badge"><span className="material-symbols-outlined" aria-hidden="true">sync</span>Under Review</b></div>
              <StatusTracker steps={status.steps} />
              <div className="next-step"><span className="material-symbols-outlined" aria-hidden="true">info</span><div><strong>What happens next</strong><p>{status.nextStep}</p></div></div>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
