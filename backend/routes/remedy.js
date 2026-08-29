import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

function answerConstraints(answers) {
  const values = new Set(answers.map((answer) => answer.value));
  if (values.has('before_2010') && values.has('exact_match')) {
    return 'This is a legacy pre-2010 record digitization request. The subject and letter MUST request digitization, migration, or updating of a legacy record. Do NOT use mismatch, correction, discrepancy, typo, spelling error, or data-entry-error framing.';
  }
  if (values.has('within_90_days') && values.has('exact_match')) {
    return 'This is a recently registered vehicle record-sync request. The subject and letter MUST request a record sync or update. Do NOT use mismatch, correction, discrepancy, typo, spelling error, or data-entry-error framing.';
  }
  if (values.has('details_do_not_match')) {
    return 'The user explicitly reports a detail mismatch, so correction framing may be used if it matches the diagnosis. If the answers also say before 2010 and within 90 days, frame it as correction of an old record that may have a recent update or online-entry discrepancy; do not call an old DL newly issued or newly registered.';
  }
  return 'Do not use mismatch or correction framing unless the user explicitly reports that details do not match.';
}

router.post('/', async (req, res, next) => {
  try {
    const { recordDetails, diagnosis, applicant, answers } = req.body;
    if (!recordDetails?.type || !recordDetails?.number || !diagnosis?.likelyCause
      || !applicant?.fullName || !applicant?.rtoOffice || !applicant?.contact || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please complete the applicant and record details before generating the letter.' });
    }

    const letter = await getJsonResponse(
      `You draft respectful, formal RTO request letters for an Indian citizen. Return ONLY valid JSON with this exact shape: {"subject":"string","letter":"string"}. The letter must include To, date, subject, Respected Sir/Madam, a factual request based only on the provided record, diagnosis, and answers, a short bullet-style list of the citizen's record details, a request for next steps, and a polite closing with the citizen's name and contact. Do not invent addresses, attachments, dates of issue, or government policy. ${answerConstraints(answers)} Use plain formal English and newline characters in the letter.`,
      JSON.stringify({ recordDetails, diagnosis, answers, applicant, date: new Date().toLocaleDateString('en-GB') }),
    );

    const referenceId = `DEMO-RTO-${Date.now().toString().slice(-8)}`;
    return res.json({ letter, referenceId, mocked: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
