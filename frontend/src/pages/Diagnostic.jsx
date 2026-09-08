import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiagnosticQuestion from '../components/DiagnosticQuestion';
import JourneyProgress from '../components/JourneyProgress';
import { useLanguage } from '../i18n/LanguageContext';
import { runDiagnostic } from '../api/client';

function buildQuestions(t) {
  const questionZero = {
    id: 'mobileLinkCheck',
    question: t('diagnostic.q0Question'),
    helper: t('diagnostic.q0Helper'),
    options: [
      { value: 'mobile_same', label: t('diagnostic.q0Opt1Label'), description: t('diagnostic.q0Opt1Desc'), icon: 'smartphone' },
      { value: 'mobile_changed', label: t('diagnostic.q0Opt2Label'), description: t('diagnostic.q0Opt2Desc'), icon: 'sim_card_alert' },
    ],
  };

  const questionOne = {
    id: 'recordAge',
    question: t('diagnostic.q1Question'),
    helper: t('diagnostic.q1Helper'),
    disclaimer: t('diagnostic.q1Disclaimer'),
    options: [
      { value: 'before_2010', label: t('diagnostic.q1Opt1Label'), description: t('diagnostic.q1Opt1Desc'), icon: 'description' },
      { value: '2010_or_later', label: t('diagnostic.q1Opt2Label'), description: t('diagnostic.q1Opt2Desc'), icon: 'credit_card' },
    ],
  };

  const questionTwoLegacy = {
    id: 'legacyUpdateCheck',
    question: t('diagnostic.q2LegacyQuestion'),
    helper: t('diagnostic.q2LegacyHelper'),
    options: [
      { value: 'renewed_since_2010', label: t('diagnostic.q2LegacyOpt1Label'), description: t('diagnostic.q2LegacyOpt1Desc'), icon: 'update' },
      { value: 'never_renewed', label: t('diagnostic.q2LegacyOpt2Label'), description: t('diagnostic.q2LegacyOpt2Desc'), icon: 'history' },
    ],
  };

  const questionTwoRecent = {
    id: 'recentRegistration',
    question: t('diagnostic.q2RecentQuestion'),
    helper: t('diagnostic.q2RecentHelper'),
    options: [
      { value: 'within_90_days', label: t('diagnostic.q2RecentOpt1Label'), description: t('diagnostic.q2RecentOpt1Desc'), icon: 'schedule' },
      { value: 'over_90_days', label: t('diagnostic.q2RecentOpt2Label'), description: t('diagnostic.q2RecentOpt2Desc'), icon: 'event_available' },
    ],
  };

  const questionThree = {
    id: 'detailsChecked',
    question: t('diagnostic.q3Question'),
    helper: t('diagnostic.q3Helper'),
    options: [
      { value: 'exact_match', label: t('diagnostic.q3Opt1Label'), description: t('diagnostic.q3Opt1Desc'), icon: 'fact_check' },
      { value: 'details_do_not_match', label: t('diagnostic.q3Opt2Label'), description: t('diagnostic.q3Opt2Desc'), icon: 'edit_note' },
    ],
  };

  return function getQuestions(answers) {
    if (answers[0]?.value === 'mobile_changed') return [questionZero];
    const recordAge = answers[1]?.value;
    const questionTwo = recordAge === 'before_2010' ? questionTwoLegacy : questionTwoRecent;
    return [questionZero, questionOne, questionTwo, questionThree];
  };
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getQuestions = buildQuestions(t);
  // The pending selection can change which path we are on (and therefore how many
  // steps remain), so the step count and final-step check must account for it.
  const questions = getQuestions(selected ? [...answers, { value: selected.value }] : answers);
  const question = questions[step];
  const isLastStep = step >= questions.length - 1;

  if (!state?.details) {
    return <section className="page"><h1>{t('notFound.startWithSearch')}</h1><button className="primary-button" onClick={() => navigate('/')}>{t('common.goToHome')}</button></section>;
  }

  async function continueDiagnostic() {
    if (!selected) return;
    const nextAnswers = [...answers, { question: question.question, answer: selected.label, value: selected.value }];
    if (!isLastStep) {
      setAnswers(nextAnswers);
      setStep(step + 1);
      setSelected(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await runDiagnostic({ recordDetails: state.details, answers: nextAnswers, language });
      navigate('/remedy', { state: { ...state, answers: nextAnswers, diagnosis: result.diagnosis } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page diagnostic-page">
      <JourneyProgress step={3} />
      <div className="diagnostic-label"><span className="diagnostic-dot" />{t('diagnostic.modeLabel')}</div>
      <div className="progress-label"><span>{t('diagnostic.progressLabel')}</span><strong>{t('diagnostic.stepOf', { current: step + 1, total: questions.length })}</strong></div>
      <div className="progress-track"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      <div className="question-heading"><h1>{question.question}</h1><p>{question.helper}</p>{question.disclaimer && <p className="field-help">{question.disclaimer}</p>}</div>
      <DiagnosticQuestion question={question} selectedValue={selected?.value} onSelect={setSelected} />
      <div className="question-action"><button className="primary-button" disabled={!selected || loading} onClick={continueDiagnostic}>{loading ? t('diagnostic.analysing') : isLastStep ? t('diagnostic.getGuidance') : t('diagnostic.continueBtn')} <span aria-hidden="true">→</span></button></div>
      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  );
}
