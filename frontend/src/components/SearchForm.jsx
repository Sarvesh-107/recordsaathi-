import { useState } from 'react';

const DOB_SHAPE = /^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4})$/;

export default function SearchForm({ type, onSubmit, loading }) {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState({});
  const isDl = type === 'DL';

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!number.trim()) {
      nextErrors.number = isDl
        ? 'Please enter your driving licence number.'
        : 'Please enter your vehicle registration number.';
    }
    if (isDl && !dob.trim()) {
      nextErrors.dob = 'Please enter your date of birth.';
    } else if (isDl && !DOB_SHAPE.test(dob.trim())) {
      nextErrors.dob = 'Please enter a valid date.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type,
      number: number.trim().replace(/\s+/g, ' ').toUpperCase(),
      ...(isDl ? { dob: dob.trim() } : {}),
    });
  }

  function updateNumber(event) {
    setNumber(event.target.value.toUpperCase());
    if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
  }

  function updateDob(event) {
    setDob(event.target.value);
    if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }));
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <label htmlFor="number">{isDl ? 'Driving licence number' : 'Vehicle registration number'}</label>
      <input
        id="number"
        name="number"
        value={number}
        onChange={updateNumber}
        placeholder={isDl ? 'e.g. KA01 9999 2005' : 'e.g. KA05 AB 1234'}
        autoCapitalize="characters"
        aria-describedby={errors.number ? 'number-error' : undefined}
        aria-invalid={Boolean(errors.number)}
      />
      {errors.number && <p id="number-error" className="field-error" role="alert">{errors.number}</p>}
      {isDl ? (
        <>
          <label htmlFor="dob">Date of birth</label>
          <input
            id="dob"
            name="dob"
            type="text"
            inputMode="numeric"
            value={dob}
            onChange={updateDob}
            placeholder="DD-MM-YYYY (e.g. 12-05-1980)"
            aria-describedby={errors.dob ? 'dob-error' : 'dob-help'}
            aria-invalid={Boolean(errors.dob)}
          />
          {errors.dob && <p id="dob-error" className="field-error" role="alert">{errors.dob}</p>}
          <span id="dob-help" className="field-help">Use DD-MM-YYYY. YYYY-MM-DD is also accepted.</span>
          <p className="field-help sample-hint"><strong>Try a sample record:</strong> KA01 1234 2005, DOB 12-05-1980</p>
        </>
      ) : (
        <>
          <p className="field-help">Enter your vehicle registration number to check this demo record.</p>
          <p className="field-help sample-hint"><strong>Try a sample record:</strong> KA01 CD 4567</p>
        </>
      )}
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Checking record…' : 'Check record'}
      </button>
    </form>
  );
}
