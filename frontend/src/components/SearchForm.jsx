import { useState } from 'react';

export default function SearchForm({ type, onSubmit, loading }) {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const isDl = type === 'DL';

  function submit(event) {
    event.preventDefault();
    onSubmit({
      type,
      number: number.trim().replace(/\s+/g, ' ').toUpperCase(),
      ...(isDl ? { dob: dob.trim() } : {}),
    });
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <label htmlFor="number">{isDl ? 'Driving licence number' : 'Vehicle registration number'}</label>
      <input
        id="number"
        name="number"
        value={number}
        onChange={(event) => setNumber(event.target.value.toUpperCase())}
        placeholder={isDl ? 'e.g. KA01 9999 2005' : 'e.g. KA05 AB 1234'}
        autoCapitalize="characters"
        required
      />
      {isDl ? (
        <>
          <label htmlFor="dob">Date of birth</label>
          <input
            id="dob"
            name="dob"
            type="text"
            inputMode="numeric"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            placeholder="DD-MM-YYYY (e.g. 12-05-1980)"
            aria-describedby="dob-help"
            required
          />
          <span id="dob-help" className="field-help">Use DD-MM-YYYY. YYYY-MM-DD is also accepted.</span>
        </>
      ) : (
        <p className="field-help">Enter your vehicle registration number to check this demo record.</p>
      )}
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Checking record…' : 'Check record'}
      </button>
    </form>
  );
}
