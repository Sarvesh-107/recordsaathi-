import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <strong>RecordSaathi</strong>
      <nav aria-label="Footer links">
        <Link to="/help">Help</Link>
        <Link to="/support">Support</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </nav>
      <small>Independent hackathon prototype — not an official government product.</small>
    </footer>
  );
}
