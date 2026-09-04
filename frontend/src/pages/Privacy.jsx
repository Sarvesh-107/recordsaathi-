import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="page-heading">
        <h1>Privacy Policy</h1>
        <p>How your data is handled in this demo.</p>
      </div>
      <div className="info-box">
        <p>RecordSaathi is a hackathon prototype. Every licence and vehicle record shown is seeded demo data — nothing here connects to any real government database.</p>
        <p>Any details you type in (name, mobile number, licence number, and so on) stay within this demo app for your current session. They are not stored permanently and are never transmitted to any government system.</p>
        <p>Please don&apos;t enter real personal or sensitive information while testing this prototype.</p>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>Back to home</button>
    </section>
  );
}
