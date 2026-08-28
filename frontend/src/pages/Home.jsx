import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="home-page">
      <div className="home-intro">
        <h1>Can&apos;t find your licence or vehicle record online? We&apos;ll help you figure out why and what to do next.</h1>
        <p>Unofficial helper tool for records not found on the primary portal.</p>
      </div>
      <div className="choice-list" aria-label="Choose the record type to check">
        <button className="choice-card" onClick={() => navigate('/search?type=DL')}>
          <span className="material-symbols-outlined service-icon" aria-hidden="true">id_card</span>
          <span><strong>Search my Driving Licence</strong><small>Check a licence record</small></span>
        </button>
        <button className="choice-card" onClick={() => navigate('/search?type=RC')}>
          <span className="material-symbols-outlined service-icon" aria-hidden="true">directions_car</span>
          <span><strong>Search my Vehicle (RC)</strong><small>Check a vehicle record</small></span>
        </button>
      </div>
      <div className="notice"><span className="material-symbols-outlined" aria-hidden="true">info</span><p>This tool identifies common reasons for missing digital records and provides guidance on rectifying them with the appropriate authorities.</p></div>
    </section>
  );
}
