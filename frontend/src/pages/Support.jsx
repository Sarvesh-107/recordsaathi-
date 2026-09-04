import { useNavigate } from 'react-router-dom';

export default function Support() {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="page-heading">
        <h1>Support</h1>
        <p>Getting help with this prototype.</p>
      </div>
      <div className="info-box">
        <p>RecordSaathi is an independent hackathon prototype — not an official government product or Parivahan service.</p>
        <p>For questions about this demo, reach the team through the hackathon submission channel.</p>
        <p>For a real driving licence or vehicle record issue, contact your local RTO office or the Parivahan helpline instead.</p>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>Back to home</button>
    </section>
  );
}
