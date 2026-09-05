import { useLocation, useNavigate } from 'react-router-dom';
import JourneyProgress from '../components/JourneyProgress';

function formatDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}

export default function NotFound() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const found = state?.found;
  const record = state?.record;
  const isRc = state?.details?.type === 'RC';
  const recordType = isRc ? 'vehicle' : 'driving licence';
  const searchPath = `/search?type=${isRc ? 'RC' : 'DL'}`;

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
        <dl className="record-details">
          <div><dt>Name</dt><dd>{record?.holderName}</dd></div>
          <div><dt>{isRc ? 'RC number' : 'Licence number'}</dt><dd>{record?.number}</dd></div>
          <div><dt>Status</dt><dd>Active</dd></div>
          <div><dt>Valid until</dt><dd>{formatDate(record?.validUntil)}</dd></div>
        </dl>
        <button className="primary-button" onClick={() => navigate(searchPath)}>Check another record</button>
      </section>
    );
  }

  return (
    <section className="page result-page not-found-page">
      <JourneyProgress step={2} />
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
      <div className="next-step">
        <span className="material-symbols-outlined" aria-hidden="true">savings</span>
        <div>
          <strong>What this replaces</strong>
          <p>Normally this means an RTO visit or paying an agent ₹700–2,000 for a backlog entry — here&apos;s a free, guided alternative.</p>
        </div>
      </div>
      <button className="primary-button" onClick={() => navigate('/diagnostic', { state })}>Help me understand</button>
      <button className="secondary-button" onClick={() => navigate(searchPath)}>Check another record</button>
    </section>
  );
}
