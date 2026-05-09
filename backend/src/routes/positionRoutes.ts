import { Router } from 'express';
import { getCandidatesByPosition, getInterviewFlowByPosition, getPositions } from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getPositions);
router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);

export default router;
