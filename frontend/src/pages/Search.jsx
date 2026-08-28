import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import { searchRecord } from '../api/client';
import MockBadge from '../components/MockBadge';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') === 'RC' ? 'RC' : 'DL';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(details) {
    setLoading(true);
    setError('');
    try {
      const result = await searchRecord(details);
      if (result.record.status === 'found') {
        navigate('/not-found', { state: { record: result.record, details, found: true } });
      } else {
        navigate('/not-found', { state: { record: result.record, details, found: false } });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page search-page">
      <MockBadge />
      <div className="page-heading">
        <p className="step-indicator">Step 1 of 5</p>
        <h1>Record Search</h1>
        <p>Find documents not listed on the primary portal.</p>
      </div>
      <div className="record-tabs" aria-label="Record type">
        <button className={type === 'DL' ? 'active' : ''} onClick={() => navigate('/search?type=DL')}>Driving Licence</button>
        <button className={type === 'RC' ? 'active' : ''} onClick={() => navigate('/search?type=RC')}>Vehicle (RC)</button>
      </div>
      <SearchForm type={type} onSubmit={handleSearch} loading={loading} />
      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  );
}
