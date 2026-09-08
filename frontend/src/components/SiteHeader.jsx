import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function SiteHeader() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const { t } = useLanguage();
  const hasBackButton = pathname !== '/';
  const recordType = state?.details?.type === 'RC' ? 'RC' : 'DL';

  function goBack() {
    if (pathname === '/search') navigate('/');
    else if (pathname === '/not-found') navigate(`/search?type=${recordType}`);
    else navigate(-1);
  }

  return (
    <header className="site-header">
      {hasBackButton && <button className="header-back" aria-label={t('common.goBack')} onClick={goBack}>←</button>}
      <Link className="site-brand" to="/">{t('common.appName')}</Link>
      <LanguageSwitcher />
    </header>
  );
}
