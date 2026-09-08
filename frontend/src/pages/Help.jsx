import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Help() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const items = ['item1', 'item2', 'item3', 'item4', 'item5'];
  const faqs = ['faqQ1', 'faqQ2', 'faqQ3', 'faqQ4'];

  return (
    <section className="page">
      <div className="page-heading">
        <h1>{t('help.heading')}</h1>
        <p>{t('help.subheading')}</p>
      </div>
      <div className="info-box">
        <ul>
          {items.map((key) => (
            /* eslint-disable-next-line react/no-danger */
            <li key={key} dangerouslySetInnerHTML={{ __html: t(`help.${key}`) }} />
          ))}
        </ul>
      </div>
      <div className="faq-box">
        <h2>{t('help.faqTitle')}</h2>
        {faqs.map((key, index) => (
          <details key={key}>
            <summary>{t(`help.${key}`)}</summary>
            <p>{t(`help.faqA${index + 1}`)}</p>
          </details>
        ))}
      </div>
      <div className="info-box honesty-panel">
        <h2>{t('help.honestyTitle')}</h2>
        <div className="honesty-grid">
          <div className="honesty-group">
            <h3>✅ {t('help.honestyRealTitle')}</h3>
            <ul>
              <li>{t('help.honestyReal1')}</li>
              <li>{t('help.honestyReal2')}</li>
            </ul>
          </div>
          <div className="honesty-group">
            <h3>🔶 {t('help.honestySimulatedTitle')}</h3>
            <ul>
              <li>{t('help.honestySimulated1')}</li>
              <li>{t('help.honestySimulated2')}</li>
            </ul>
          </div>
          <div className="honesty-group">
            <h3>🔜 {t('help.honestyRoadmapTitle')}</h3>
            <ul>
              <li>{t('help.honestyRoadmap1')}</li>
              <li>{t('help.honestyRoadmap2')}</li>
              <li>{t('help.honestyRoadmap3')}</li>
              <li>{t('help.honestyRoadmap4')}</li>
              <li>{t('help.honestyRoadmap5')}</li>
              <li>{t('help.honestyRoadmap6')}</li>
              <li>{t('help.honestyRoadmap7')}</li>
            </ul>
          </div>
        </div>
      </div>
      <button className="primary-button" onClick={() => navigate('/')}>{t('common.backToHome')}</button>
    </section>
  );
}
