import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Support() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="page">
      <div className="page-heading">
        <h1>{t('support.heading')}</h1>
        <p>{t('support.subheading')}</p>
      </div>
      <div className="info-box">
        <p>{t('support.p1')}</p>
        <p>{t('support.p2')}</p>
        <p>{t('support.p3')}</p>
      </div>
      <div className="faq-box">
        <h2>{t('support.faqTitle')}</h2>
        <details>
          <summary>{t('support.faqQ1')}</summary>
          <p>{t('support.faqA1')}</p>
        </details>
        <details>
          <summary>{t('support.faqQ2')}</summary>
          <p>{t('support.faqA2')}</p>
        </details>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>{t('common.backToHome')}</button>
    </section>
  );
}
