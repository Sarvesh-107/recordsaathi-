export default function DiagnosticQuestion({ question, selectedValue, onSelect }) {
  return (
    <div className="question-options">
      {question.options.map((option) => (
        <button
          className={`question-option ${selectedValue === option.value ? 'selected' : ''}`}
          key={option.value}
          onClick={() => onSelect(option)}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">{option.icon}</span>
          <span><strong>{option.label}</strong><small>{option.description}</small></span>
          <span className="option-radio" aria-hidden="true">{selectedValue === option.value && '✓'}</span>
        </button>
      ))}
    </div>
  );
}
