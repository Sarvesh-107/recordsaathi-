import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Privacy() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="page">
      <div className="page-heading">
        <h1>{t('privacy.heading')}</h1>
        <p>{t('privacy.subheading')}</p>
      </div>
      <div className="info-box">
        <p>{t('privacy.p1')}</p>
        <p>{t('privacy.p2')}</p>
        <p>{t('privacy.p3')}</p>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>{t('common.backToHome')}</button>
    </section>
  );
}
