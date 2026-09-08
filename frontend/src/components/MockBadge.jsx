import { useLanguage } from '../i18n/LanguageContext';

export default function MockBadge() {
  const { t } = useLanguage();
  return <span className="demo-badge"><span className="material-symbols-outlined" aria-hidden="true">science</span>{t('common.demoBadge')}</span>;
}
