import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { recordDetails, diagnosis, applicant } = req.body;
    if (!recordDetails?.type || !recordDetails?.number || !diagnosis?.likelyCause
      || !applicant?.fullName || !applicant?.rtoOffice || !applicant?.contact) {
      return res.status(400).json({ message: 'Please complete the applicant and record details before generating the letter.' });
    }

    const letter = await getJsonResponse(
      `You draft respectful, formal RTO request letters for an Indian citizen. Return ONLY valid JSON with this exact shape: {"subject":"string","letter":"string"}. The letter must include To, date, subject, Respected Sir/Madam, a factual request based only on the provided record and diagnosis, a short bullet-style list of the citizen's record details, a request for next steps, and a polite closing with the citizen's name and contact. Do not invent addresses, attachments, dates of issue, or government policy. Use plain formal English and newline characters in the letter.`,
      JSON.stringify({ recordDetails, diagnosis, applicant, date: new Date().toLocaleDateString('en-GB') }),
    );

    const referenceId = `DEMO-RTO-${Date.now().toString().slice(-8)}`;
    return res.json({ letter, referenceId, mocked: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
