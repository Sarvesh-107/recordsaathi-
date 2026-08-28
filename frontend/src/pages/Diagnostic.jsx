import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiagnosticQuestion from '../components/DiagnosticQuestion';
import { runDiagnostic } from '../api/client';

const QUESTIONS = [
  {
    id: 'recordAge',
    question: 'When was this record first issued or registered?',
    helper: 'This helps us identify whether it may be stored in an older system.',
    options: [
      { value: 'before_2010', label: 'Before 2010', description: 'It is an older paper, booklet, or early smart-card record.', icon: 'description' },
      { value: '2010_or_later', label: '2010 or later', description: 'It was issued or registered more recently.', icon: 'credit_card' },
    ],
  },
  {
    id: 'recentRegistration',
    question: 'Was it issued or registered very recently?',
    helper: 'New registrations can take time to reach all online systems.',
    options: [
      { value: 'within_90_days', label: 'Within the last 90 days', description: 'The document or vehicle registration is recent.', icon: 'schedule' },
      { value: 'over_90_days', label: 'More than 90 days ago', description: 'It has been issued or registered for some time.', icon: 'event_available' },
    ],
  },
  {
    id: 'detailsChecked',
    question: 'Do the details exactly match your physical document?',
    helper: 'A small mismatch in a number, date, or spelling can prevent a match.',
    options: [
      { value: 'exact_match', label: 'Yes, I checked them', description: 'The number and personal details match the document.', icon: 'fact_check' },
      { value: 'possible_mismatch', label: 'I am not sure', description: 'There may be a typo, different spelling, or old address.', icon: 'edit_note' },
    ],
  },
];

export default function Diagnostic() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const question = QUESTIONS[step];

  if (!state?.details) {
    return <section className="page"><h1>Start with a record search</h1><button className="primary-button" onClick={() => navigate('/')}>Go to home</button></section>;
  }

  async function continueDiagnostic() {
    if (!selected) return;
    const nextAnswers = [...answers, { question: question.question, answer: selected.label, value: selected.value }];
    if (step < QUESTIONS.length - 1) {
      setAnswers(nextAnswers);
      setStep(step + 1);
      setSelected(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await runDiagnostic({ recordDetails: state.details, answers: nextAnswers });
      navigate('/remedy', { state: { ...state, answers: nextAnswers, diagnosis: result.diagnosis } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page diagnostic-page">
      <div className="diagnostic-label"><span className="diagnostic-dot" />Diagnostic mode</div>
      <div className="progress-label"><span>Diagnostic progress</span><strong>Step {step + 1} of {QUESTIONS.length}</strong></div>
      <div className="progress-track"><span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <div className="question-heading"><h1>{question.question}</h1><p>{question.helper}</p></div>
      <DiagnosticQuestion question={question} selectedValue={selected?.value} onSelect={setSelected} />
      <div className="question-action"><button className="primary-button" disabled={!selected || loading} onClick={continueDiagnostic}>{loading ? 'Analysing your answers…' : step === QUESTIONS.length - 1 ? 'Get my guidance' : 'Continue diagnostic'} <span aria-hidden="true">→</span></button></div>
      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  );
}
