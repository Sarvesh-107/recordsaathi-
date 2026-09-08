import { Router } from 'express';
import { getJsonResponse } from '../services/openaiClient.js';

const router = Router();

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', kn: 'Kannada' };

const PLAIN_TEXT_INSTRUCTION = ' The letter is rendered as plain text, never as markdown: do NOT use any markdown syntax — no ** or __ for bold, no * or # characters for emphasis or headings, and no backticks. Use plain prose with newline characters, and a simple hyphen ("- ") for any bullet points.';

function languageInstruction(language) {
  const name = LANGUAGE_NAMES[language];
  if (!name || name === 'English') return '';
  return ` Write the "subject" and "letter" field VALUES in ${name}, using natural ${name} script (not transliterated English). Write EVERY sentence of the letter body in ${name} — do NOT mix in English sentences, phrases, headings, or connecting words. The words "To", "Date", "Subject", and "Respected Sir/Madam" used elsewhere in these instructions are describing the letter's STRUCTURE in English for your own reference only — they are NOT text to copy literally. Translate the salutation (the "Respected Sir/Madam" equivalent) and any field labels like "To:"/"Date:"/"Subject:" into natural ${name}, the way a real formal letter in ${name} would open and label these fields. The ONLY things that stay in their original form are proper nouns and verbatim values: the citizen's name, the RTO office name, licence/RC numbers, dates, and contact numbers, which must be kept exactly as provided without translating or transliterating them. Keep JSON keys in English.`;
}

function answerConstraints(answers) {
  const values = new Set(answers.map((answer) => answer.value));
  if (values.has('mobile_changed')) {
    return 'The citizen\'s current mobile number is different from (or they are unsure about) the mobile number registered against this record, and Parivahan matches records using that registered number. The record itself is presumed to exist and be in order — the lookup is failing only because the contact number on file is out of date. The subject and letter MUST request that the RTO update the registered mobile number on file and re-link or reconfirm the existing record against the citizen\'s current number (for example "Request to Update Registered Mobile Number and Re-link Record"). The letter MUST ask for the mobile number on record to be updated to the contact number supplied by the citizen, and MUST ask the RTO to confirm the record is correctly linked once updated. Do NOT use the words "digitization", "digitisation", "legacy", "pre-2010", "old record", "backlog", "migrate", or "migration", and do NOT suggest the record is missing, undigitized, or was never entered into the system. Do NOT use data-entry-error, spelling-mistake, typo, or document-detail-mismatch framing — the only thing out of date is the registered mobile number.';
  }
  if (values.has('before_2010') && values.has('renewed_since_2010') && values.has('exact_match')) {
    return 'This record was issued before 2010 but has been renewed or updated since 2010, so it SHOULD already exist in the current digital RTO/Parivahan system. The citizen\'s actual problem is that a lookup or search is not finding this already-digital record. The subject and letter MUST frame this as a request to investigate, reconcile, or trace an existing digital record (for example "Request to Investigate Missing Online Record" or "Request for Reconciliation of Renewed Licence Record") — NOT as first-time digitization or migration. Do NOT use the words "digitization", "digitisation", "migrate", "migration", "not currently available", "not present in the system", or any phrasing implying the record has never existed digitally. Do NOT use mismatch, correction, discrepancy, typo, or spelling-error framing either — the citizen has confirmed their details are correct; the issue is that the system cannot locate the already-renewed record.';
  }
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
    const { recordDetails, diagnosis, applicant, answers, language, escalation } = req.body;

    if (escalation) {
      if (!escalation.referenceId || !escalation.caseType || !escalation.submittedAt
        || !applicant?.fullName || !applicant?.rtoOffice || !applicant?.contact) {
        return res.status(400).json({ message: 'Please complete the applicant details before generating the follow-up letter.' });
      }

      const followUpLetter = await getJsonResponse(
        `You draft a short, polite follow-up letter for an Indian citizen checking on the status of an RTO request they already submitted. Return ONLY valid JSON with this exact shape: {"subject":"string","letter":"string"}. This is a BRIEF status-check note, NOT a new request: do NOT restate document lists, licence/RC numbers, or the original justification. Reference the earlier request only by its reference ID, case type, and original submission date (all provided below). State that no update has been received since then, and politely ask for a status update on that specific request. Keep the letter body to about 3-4 short sentences plus a polite closing with the citizen's name and contact. Do not invent addresses, attachments, or new facts.${PLAIN_TEXT_INSTRUCTION}${languageInstruction(language)}`,
        JSON.stringify({ escalation, applicant, date: new Date().toLocaleDateString('en-GB') }),
      );

      const escalationReferenceId = `DEMO-RTO-${Date.now().toString().slice(-8)}`;
      return res.json({ letter: followUpLetter, referenceId: escalationReferenceId, mocked: true });
    }

    if (!recordDetails?.type || !recordDetails?.number || !diagnosis?.likelyCause
      || !applicant?.fullName || !applicant?.rtoOffice || !applicant?.contact || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please complete the applicant and record details before generating the letter.' });
    }

    const letter = await getJsonResponse(
      `You draft respectful, formal RTO request letters for an Indian citizen. Return ONLY valid JSON with this exact shape: {"subject":"string","letter":"string"}. The letter must include To, date, subject, Respected Sir/Madam, a factual request based only on the provided record, diagnosis, and answers, a short bullet-style list of the citizen's record details, a request for next steps, and a polite closing with the citizen's name and contact. Do not invent addresses, attachments, dates of issue, or government policy. ${answerConstraints(answers)} Use plain formal language and newline characters in the letter.${PLAIN_TEXT_INSTRUCTION}${languageInstruction(language)}`,
      JSON.stringify({ recordDetails, diagnosis, answers, applicant, date: new Date().toLocaleDateString('en-GB') }),
    );

    const referenceId = `DEMO-RTO-${Date.now().toString().slice(-8)}`;
    return res.json({ letter, referenceId, mocked: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
