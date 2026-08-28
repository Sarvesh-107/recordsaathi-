import { Router } from 'express';

const router = Router();

router.get('/:referenceId', (req, res) => {
  const { referenceId } = req.params;
  if (!referenceId || !/^DEMO-RTO-[A-Z0-9-]+$/i.test(referenceId)) {
    return res.status(400).json({ message: 'Please provide a valid demo reference ID.', mocked: true });
  }

  return res.json({
    referenceId,
    status: 'under_review',
    nextStep: 'Your request is in the review queue. Keep your original document and the downloaded letter ready for your RTO visit.',
    steps: [
      { label: 'Submitted', detail: 'Request created', state: 'complete' },
      { label: 'Under Review', detail: 'In progress', state: 'current' },
      { label: 'Completed', detail: 'Pending', state: 'pending' },
    ],
    mocked: true,
  });
});

export default router;
