import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockBadge from '../components/MockBadge';
import { generateRemedy } from '../api/client';

export default function Remedy() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [applicant, setApplicant] = useState({ fullName: '', rtoOffice: '', contact: '' });
  const [generated, setGenerated] = useState(() => {
    if (state?.generated) return state.generated;
    try { return JSON.parse(sessionStorage.getItem('recordSaathiGeneratedRemedy') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state?.details || !state?.diagnosis) {
    return <section className="page"><h1>Complete the diagnostic first</h1><button className="primary-button" onClick={() => navigate('/')}>Go to home</button></section>;
  }

  function update(field, value) { setApplicant((current) => ({ ...current, [field]: value })); }

  async function createLetter(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await generateRemedy({ recordDetails: state.details, diagnosis: state.diagnosis, applicant });
      setGenerated(result);
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
    sessionStorage.setItem('recordSaathiGeneratedRemedy', JSON.stringify(generated));
    navigate('/status', { state: { referenceId: generated.referenceId, diagnosis: state.diagnosis, generated } });
  }

  if (!generated) {
    return (
      <section className="page remedy-page">
        <p className="step-indicator">Step 5 of 5</p>
        <h1>Prepare your RTO request letter</h1>
        <p className="remedy-intro">We&apos;ll use your diagnostic guidance to draft a letter you can review before taking it to the RTO.</p>
        <div className="diagnosis-summary"><strong>{state.diagnosis.likelyCause}</strong><p>{state.diagnosis.summary}</p></div>
        <form className="form-card" onSubmit={createLetter}>
          <label htmlFor="fullName">Your full name</label><input id="fullName" value={applicant.fullName} onChange={(event) => update('fullName', event.target.value)} required />
          <label htmlFor="rtoOffice">RTO office or city</label><input id="rtoOffice" value={applicant.rtoOffice} onChange={(event) => update('rtoOffice', event.target.value)} placeholder="e.g. Bengaluru Central RTO" required />
          <label htmlFor="contact">Mobile number or email</label><input id="contact" value={applicant.contact} onChange={(event) => update('contact', event.target.value)} required />
          <button className="primary-button" disabled={loading}>{loading ? 'Generating letter…' : 'Generate my letter'} <em className="inline-demo">Demo</em></button>
        </form>
        {error && <p className="error-message" role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <section className="remedy-output">
      <div className="remedy-heading"><p className="step-indicator">Step 5 of 5</p><h1>Remedy Letter Generated</h1><p>Review the generated letter below. You can download a copy or proceed to book an RTO appointment.</p></div>
      <article className="letter-card"><MockBadge /><p className="letter-subject"><strong>Subject:</strong> {generated.letter.subject}</p><div className="letter-text">{generated.letter.letter}</div></article>
      <div className="letter-actions"><button className="secondary-button" onClick={downloadLetter}><span className="material-symbols-outlined" aria-hidden="true">download</span> Download copy <em>Demo</em></button><button className="primary-button" onClick={bookAppointment}><span className="material-symbols-outlined" aria-hidden="true">calendar_month</span> Book RTO appointment <em>Demo</em></button></div>
    </section>
  );
}
