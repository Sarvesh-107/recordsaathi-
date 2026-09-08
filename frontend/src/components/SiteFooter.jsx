import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <strong>{t('common.appName')}</strong>
      <nav aria-label="Footer links">
        <Link to="/help">{t('footer.help')}</Link>
        <Link to="/support">{t('footer.support')}</Link>
        <Link to="/privacy">{t('footer.privacy')}</Link>
      </nav>
      <small>{t('footer.disclosure')}</small>
    </footer>
  );
}
