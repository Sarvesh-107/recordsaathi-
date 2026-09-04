import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="page-heading">
        <h1>Help</h1>
        <p>A quick guide to using RecordSaathi.</p>
      </div>
      <div className="info-box">
        <ul>
          <li><strong>Search:</strong> Enter your driving licence or vehicle registration number (plus date of birth for a licence) to check if it&apos;s listed online.</li>
          <li><strong>Record Not Found:</strong> This means our demo lookup didn&apos;t match a listed record — common real-world reasons include outdated RTO data, an older paper-based record, or a details mismatch.</li>
          <li><strong>Diagnostic:</strong> A couple of quick questions to narrow down why your record might be missing.</li>
          <li><strong>Letter:</strong> We draft a plain-language RTI or grievance letter you can download as a starting point.</li>
          <li><strong>Status:</strong> Track a simulated status timeline for your generated request.</li>
        </ul>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>Back to home</button>
    </section>
  );
}
