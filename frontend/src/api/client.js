const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function searchRecord(params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}/api/search?${query}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || 'We could not check the record right now.');
  }

  return body;
}

async function post(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'We could not complete that request right now.');
  return body;
}

export const runDiagnostic = (payload) => post('/api/diagnostic', payload);
export const generateRemedy = (payload) => post('/api/remedy', payload);

export async function getStatus(referenceId) {
  const response = await fetch(`${API_BASE_URL}/api/status/${encodeURIComponent(referenceId)}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'Could not load status.');
  return body;
}
