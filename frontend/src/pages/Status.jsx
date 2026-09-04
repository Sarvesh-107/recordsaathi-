import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import StatusTracker from '../components/StatusTracker';
import JourneyProgress from '../components/JourneyProgress';
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

function saveActiveRequest(referenceId) {
  try {
    localStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify({ referenceId, savedAt: new Date().toISOString() }));
  } catch {
    // localStorage unavailable (e.g. private browsing) — persistence is best-effort only
  }
}

export default function Status() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const referenceId = state?.referenceId || readSavedRequest()?.referenceId || null;

  useEffect(() => {
    if (!referenceId) return;
    saveActiveRequest(referenceId);
    getStatus(referenceId).then(setStatus).catch((requestError) => setError(requestError.message));
  }, [referenceId]);

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
      <JourneyProgress step={5} />
      <div className="status-heading"><p className="step-indicator">Request tracking</p><h1>Status Tracking</h1><p>Check the progress of your recent request.</p></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {!status && !error && <p className="loading-copy">Loading your demo status…</p>}
      {status && (
        <article className="status-card">
          <div className="reference-row"><div><span>Reference ID</span><strong>{status.referenceId}</strong></div><div className="status-badges"><MockBadge /><b className="review-badge"><span className="material-symbols-outlined" aria-hidden="true">sync</span>Under Review</b></div></div>
          <StatusTracker steps={status.steps} />
          <div className="next-step"><span className="material-symbols-outlined" aria-hidden="true">info</span><div><strong>What happens next</strong><p>{status.nextStep}</p></div></div>
        </article>
      )}
    </section>
  );
}
