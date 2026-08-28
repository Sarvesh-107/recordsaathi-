import { useLocation, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const found = state?.found;
  const recordType = state?.details?.type === 'RC' ? 'vehicle' : 'driving licence';
  const searchPath = `/search?type=${state?.details?.type === 'RC' ? 'RC' : 'DL'}`;

  if (!state) {
    return (
      <section className="page">
        <h1>Start with a record search</h1>
        <button className="primary-button" onClick={() => navigate('/')}>Go to home</button>
      </section>
    );
  }

  if (found) {
    return (
      <section className="page result-page">
        <div className="result-icon success"><span className="material-symbols-outlined" aria-hidden="true">check</span></div>
        <p className="step-indicator">Record found</p>
        <h1>Your {recordType} record is available</h1>
        <p className="lead">We found this demo record. Your details appear to be available online.</p>
        <button className="primary-button" onClick={() => navigate(searchPath)}>Check another record</button>
      </section>
    );
  }

  return (
    <section className="page result-page not-found-page">
      <div className="result-icon warning"><span className="material-symbols-outlined" aria-hidden="true">search_off</span></div>
      <p className="step-indicator">Record not found</p>
      <h1>We couldn&apos;t find this record — here&apos;s why that might be</h1>
      <div className="info-box">
        <ul>
          <li>Data not yet updated by the RTO</li>
          <li>Record is in an older paper-based format</li>
          <li>Minor spelling mismatch in your details</li>
        </ul>
      </div>
      <button className="primary-button" onClick={() => navigate('/diagnostic', { state })}>Help me understand</button>
      <button className="secondary-button" onClick={() => navigate(searchPath)}>Check another record</button>
    </section>
  );
}
