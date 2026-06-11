import { Router } from 'express';
import { addExpense, getExpenses, getAnalytics, exportPDF, deleteExpense } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, addExpense);
router.get('/', authenticate, getExpenses);
router.get('/analytics', authenticate, getAnalytics);
router.get('/export-pdf', authenticate, exportPDF);
router.delete('/:id', authenticate, deleteExpense);

export default router;
