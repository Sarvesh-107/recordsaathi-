import { LANGUAGES, useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <select
      className="language-switcher"
      aria-label={t('common.languageLabel')}
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
    >
      {LANGUAGES.map((option) => (
        <option key={option.code} value={option.code}>{option.label}</option>
      ))}
    </select>
  );
}
