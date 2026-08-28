import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import StatusTracker from '../components/StatusTracker';
import { getStatus } from '../api/client';

export default function Status() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state?.referenceId) return;
    getStatus(state.referenceId).then(setStatus).catch((requestError) => setError(requestError.message));
  }, [state?.referenceId]);

  if (!state?.referenceId) {
    return <section className="page"><h1>Start by creating a remedy letter</h1><button className="primary-button" onClick={() => navigate('/')}>Go to home</button></section>;
  }

  return (
    <section className="status-page">
      <div className="status-heading"><p className="step-indicator">Request tracking</p><h1>Status Tracking</h1><p>Check the progress of your recent request.</p></div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {!status && !error && <p className="loading-copy">Loading your demo status…</p>}
      {status && (
        <article className="status-card">
          <MockBadge />
          <div className="reference-row"><div><span>Reference ID</span><strong>{status.referenceId}</strong></div><b className="review-badge"><span className="material-symbols-outlined" aria-hidden="true">sync</span>Under Review</b></div>
          <StatusTracker steps={status.steps} />
          <div className="next-step"><span className="material-symbols-outlined" aria-hidden="true">info</span><div><strong>What happens next</strong><p>{status.nextStep}</p></div></div>
        </article>
      )}
    </section>
  );
}
