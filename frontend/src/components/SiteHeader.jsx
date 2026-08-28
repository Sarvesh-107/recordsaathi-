import { useLocation, useNavigate } from 'react-router-dom';

export default function SiteHeader() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const hasBackButton = pathname !== '/';
  const recordType = state?.details?.type === 'RC' ? 'RC' : 'DL';

  function goBack() {
    if (pathname === '/search') navigate('/');
    else if (pathname === '/not-found') navigate(`/search?type=${recordType}`);
    else navigate(-1);
  }

  return (
    <header className="site-header">
      {hasBackButton && <button className="header-back" aria-label="Go back" onClick={goBack}>←</button>}
      <span className="site-brand">RecordSaathi</span>
    </header>
  );
}
