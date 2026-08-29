import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

function answerConstraints(answers) {
  const values = new Set(answers.map((answer) => answer.value));
  if (values.has('exact_match')) {
    return 'The user explicitly confirmed that all document details match. You MUST NOT select or mention a data-entry error, mismatch, correction, discrepancy, or spelling issue. If the record is before 2010, select legacy pre-2010 record; if it is recent, select recently registered/unsynced vehicle.';
  }
  if (values.has('details_do_not_match')) {
    return 'The user explicitly said that their details do not match the physical document. You may select data-entry/detail mismatch if it is the most likely cause. If the answers also say before 2010 and within 90 days, describe this as an old record with a possible recent update, reissue, or online-entry discrepancy; do not describe an old DL as newly issued or newly registered.';
  }
  return 'Do not assume a mismatch unless the user explicitly says the details do not match.';
}

router.post('/', async (req, res, next) => {
  try {
    const { recordDetails, answers } = req.body;
    if (!recordDetails?.type || !recordDetails?.number || !Array.isArray(answers) || answers.length < 3) {
      return res.status(400).json({ message: 'Record details and all diagnostic answers are required.' });
    }

    const diagnosis = await getJsonResponse(
      `You are a careful citizen-support guide for Indian RTO record recovery. Analyse only the supplied details. Return ONLY valid JSON with this exact shape: {"likelyCause":"short title","summary":"2 concise plain-language sentences","remedyPath":"2 concise practical sentences","documentsNeeded":["item","item","item"]}. Select the most likely of legacy pre-2010 record, recently registered vehicle not yet synced, or data-entry/detail mismatch. Treat recordDetails.type as authoritative: DL means driving licence and must never be described as a vehicle or RC; RC means vehicle registration and must never be described as a driving licence. Documents must match that type. ${answerConstraints(answers)} Never claim access to Parivahan or that an outcome is guaranteed.`,
      JSON.stringify({ recordDetails, answers }),
    );

    return res.json({ diagnosis });
  } catch (error) {
    return next(error);
  }
});

export default router;
