import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { recordDetails, answers } = req.body;
    if (!recordDetails?.type || !recordDetails?.number || !Array.isArray(answers) || answers.length < 3) {
      return res.status(400).json({ message: 'Record details and all diagnostic answers are required.' });
    }

    const diagnosis = await getJsonResponse(
      `You are a careful citizen-support guide for Indian RTO record recovery. Analyse only the supplied details. Return ONLY valid JSON with this exact shape: {"likelyCause":"short title","summary":"2 concise plain-language sentences","remedyPath":"2 concise practical sentences","documentsNeeded":["item","item","item"]}. Select the most likely of legacy pre-2010 record, recently registered vehicle not yet synced, or data-entry/detail mismatch. Treat recordDetails.type as authoritative: DL means driving licence and must never be described as a vehicle or RC; RC means vehicle registration and must never be described as a driving licence. Documents must match that type. Never claim access to Parivahan or that an outcome is guaranteed.`,
      JSON.stringify({ recordDetails, answers }),
    );

    return res.json({ diagnosis });
  } catch (error) {
    return next(error);
  }
});

export default router;
