import { useLocation, useNavigate } from 'react-router-dom';
import JourneyProgress from '../components/JourneyProgress';
import { useLanguage } from '../i18n/LanguageContext';

function formatDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}

export default function NotFound() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useLanguage();
  const found = state?.found;
  const record = state?.record;
  const isRc = state?.details?.type === 'RC';
  const searchPath = `/search?type=${isRc ? 'RC' : 'DL'}`;

  if (!state) {
    return (
      <section className="page">
        <h1>{t('notFound.startWithSearch')}</h1>
        <button className="primary-button" onClick={() => navigate('/')}>{t('common.goToHome')}</button>
      </section>
    );
  }

  if (found) {
    return (
      <section className="page result-page">
        <div className="result-icon success"><span className="material-symbols-outlined" aria-hidden="true">check</span></div>
        <p className="step-indicator">{t('notFound.recordFoundLabel')}</p>
        <h1>{isRc ? t('notFound.foundHeadingRc') : t('notFound.foundHeadingDl')}</h1>
        <p className="lead">{t('notFound.foundLead')}</p>
        <dl className="record-details">
          <div><dt>{t('notFound.nameLabel')}</dt><dd>{record?.holderName}</dd></div>
          <div><dt>{isRc ? t('notFound.rcNumberLabel') : t('notFound.licenceNumberLabel')}</dt><dd>{record?.number}</dd></div>
          <div><dt>{t('notFound.statusLabel')}</dt><dd>{t('notFound.statusActive')}</dd></div>
          <div><dt>{t('notFound.validUntilLabel')}</dt><dd>{formatDate(record?.validUntil)}</dd></div>
        </dl>
        <button className="primary-button" onClick={() => navigate(searchPath)}>{t('notFound.checkAnother')}</button>
      </section>
    );
  }

  return (
    <section className="page result-page not-found-page">
      <JourneyProgress step={2} />
      <div className="result-icon warning"><span className="material-symbols-outlined" aria-hidden="true">search_off</span></div>
      <p className="step-indicator">{t('notFound.recordNotFoundLabel')}</p>
      <h1>{t('notFound.notFoundHeading')}</h1>
      <div className="info-box">
        <ul>
          <li>{t('notFound.reason1')}</li>
          <li>{t('notFound.reason2')}</li>
          <li>{t('notFound.reason3')}</li>
        </ul>
      </div>
      <div className="next-step">
        <span className="material-symbols-outlined" aria-hidden="true">savings</span>
        <div>
          <strong>{t('notFound.replacesTitle')}</strong>
          <p>{t('notFound.replacesText')}</p>
        </div>
      </div>
      <button className="primary-button" onClick={() => navigate('/diagnostic', { state })}>{t('notFound.helpMeUnderstand')}</button>
      <button className="secondary-button" onClick={() => navigate(searchPath)}>{t('notFound.checkAnother')}</button>
    </section>
  );
}
