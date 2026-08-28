import { Router } from 'express';
import records from '../data/mockRecords.json' with { type: 'json' };

const router = Router();

function normaliseNumber(value = '') {
  return String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normaliseDob(value = '') {
  const rawValue = String(value).trim();
  let year;
  let month;
  let day;

  let match = rawValue.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) {
    [, year, month, day] = match;
  } else {
    match = rawValue.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (!match) return null;
    [, day, month, year] = match;
  }

  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (parsed.getUTCFullYear() !== Number(year)
    || parsed.getUTCMonth() !== Number(month) - 1
    || parsed.getUTCDate() !== Number(day)) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

router.get('/', (req, res) => {
  const { type, number, dob } = req.query;
  if (!['DL', 'RC'].includes(type) || !number) {
    return res.status(400).json({ message: 'Please provide a record type and number.', mocked: true });
  }
  const formattedDob = type === 'DL' ? normaliseDob(dob) : null;
  if (type === 'DL' && !formattedDob) {
    return res.status(400).json({ message: 'Please provide a valid date of birth.', mocked: true });
  }

  const matchingRecord = records.find((record) => record.type === type
    && normaliseNumber(record.number) === normaliseNumber(number)
    && (type !== 'DL' || normaliseDob(record.dob) === formattedDob));

  const record = matchingRecord || { type, number: String(number).trim().replace(/\s+/g, ' ').toUpperCase(), status: 'not_found' };
  return res.json({ record, mocked: true });
});

export default router;
