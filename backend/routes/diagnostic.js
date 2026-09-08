import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', kn: 'Kannada' };

const PLAIN_TEXT_INSTRUCTION = ' All field values are rendered as plain text, never as markdown: do NOT use any markdown syntax — no ** or __ for bold, no * or # characters for emphasis or headings, and no backticks. Use plain prose only.';

function languageInstruction(language) {
  const name = LANGUAGE_NAMES[language];
  if (!name || name === 'English') return '';
  return ` Write the "likelyCause", "summary", and "remedyPath" field VALUES in ${name}, using natural ${name} script (not transliterated English); keep "documentsNeeded" items in ${name} too, but keep JSON keys in English. Write EVERY sentence in ${name} — do NOT mix in English sentences, phrases, or connecting words. The ONLY things that stay in their original form are proper nouns and verbatim values such as licence/RC numbers, dates, and official form names.`;
}

function answerConstraints(answers) {
  const values = new Set(answers.map((answer) => answer.value));
  if (values.has('mobile_changed')) {
    return 'The citizen says the mobile number they use now is different from (or they are unsure about) the number registered against this record. Parivahan/mParivahan matches records using the registered mobile number, so an out-of-date number can make an existing record return "no records found". Select a likelyCause along the lines of "Registered mobile number no longer matches" or "Record hidden by outdated mobile number". The summary MUST explain that the record most likely still exists and is fine, and that the lookup is failing because the registered mobile number is stale. The remedyPath MUST be about getting the registered mobile number updated at the RTO (Form 33/change-of-contact style request) and having the record re-linked to the current number. Do NOT describe this as a legacy, old, pre-2010, undigitized, or backlog record, and do NOT use the words "digitization", "digitisation", "legacy", or "pre-2010". Do NOT describe it as a data-entry error, spelling mistake, or detail mismatch in the document itself. documentsNeeded must be documents relevant to updating a registered mobile number (for example current photo ID, address proof, and the original licence or RC).';
  }
  if (values.has('exact_match') && values.has('before_2010') && values.has('renewed_since_2010')) {
    return 'The user explicitly confirmed that all document details match, and this record was issued before 2010 but has been renewed or updated since 2010. This means the record SHOULD already exist in the digital system — the citizen\'s issue is that a lookup or search cannot find this already-updated record, not that it was never digitized. Select a likelyCause along the lines of "Renewed record missing from online search" or "Sync issue with an updated record". Do NOT select or describe this as a legacy pre-2010 record needing first-time digitization, and do NOT use words like "digitization", "not currently available", or "not present in the system". Do NOT mention a data-entry error, mismatch, correction, discrepancy, or spelling issue.';
  }
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
    const { recordDetails, answers, language } = req.body;
    if (!recordDetails?.type || !recordDetails?.number || !Array.isArray(answers) || answers.length < 1) {
      return res.status(400).json({ message: 'Record details and all diagnostic answers are required.' });
    }

    const diagnosis = await getJsonResponse(
      `You are a careful citizen-support guide for Indian RTO record recovery. Analyse only the supplied details. Return ONLY valid JSON with this exact shape: {"likelyCause":"short title","summary":"2 concise plain-language sentences","remedyPath":"2 concise practical sentences","documentsNeeded":["item","item","item"]}. Select the most likely of legacy pre-2010 record, recently registered vehicle not yet synced, data-entry/detail mismatch, or an outdated registered mobile number preventing the lookup from matching. Treat recordDetails.type as authoritative: DL means driving licence and must never be described as a vehicle or RC; RC means vehicle registration and must never be described as a driving licence. Documents must match that type. ${answerConstraints(answers)} Never claim access to Parivahan or that an outcome is guaranteed.${PLAIN_TEXT_INSTRUCTION}${languageInstruction(language)}`,
      JSON.stringify({ recordDetails, answers }),
    );

    return res.json({ diagnosis });
  } catch (error) {
    return next(error);
  }
});

export default router;
