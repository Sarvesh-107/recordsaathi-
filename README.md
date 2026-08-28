# RecordSaathi

A mobile-first recovery flow for when a Parivahan driving licence (DL) or registration certificate (RC) record is not found online.

## Local development

1. Copy `.env.example` to `.env` and add your Groq API key before Stage 2.
2. Install dependencies with `npm install`, `npm --prefix frontend install`, and `npm --prefix backend install`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

Stage 1 supports the Home, Search, and Record Not Found screens. The sample not-found DL is `KA01 9999 2005` with DOB `1978-11-02`; the sample not-found RC is `KA05 AB 1234`.
