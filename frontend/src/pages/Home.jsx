import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="home-page">
      <div className="home-intro">
        <h1>{t('home.heading')}</h1>
        <p>{t('home.subheading')}</p>
      </div>
      <div className="choice-list" aria-label="Choose the record type to check">
        <button className="choice-card" onClick={() => navigate('/search?type=DL')}>
          <span className="material-symbols-outlined service-icon" aria-hidden="true">id_card</span>
          <span><strong>{t('home.searchDlTitle')}</strong><small>{t('home.searchDlDesc')}</small></span>
        </button>
        <button className="choice-card" onClick={() => navigate('/search?type=RC')}>
          <span className="material-symbols-outlined service-icon" aria-hidden="true">directions_car</span>
          <span><strong>{t('home.searchRcTitle')}</strong><small>{t('home.searchRcDesc')}</small></span>
        </button>
        <button className="choice-card" onClick={() => navigate('/status')}>
          <span className="material-symbols-outlined service-icon" aria-hidden="true">assignment</span>
          <span><strong>{t('home.trackTitle')}</strong><small>{t('home.trackDesc')}</small></span>
        </button>
      </div>
      <div className="notice"><span className="material-symbols-outlined" aria-hidden="true">info</span><p>{t('home.notice')}</p></div>
    </section>
  );
}
