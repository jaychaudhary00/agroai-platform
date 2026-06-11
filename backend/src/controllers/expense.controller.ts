import { Response, NextFunction } from 'express';
import { Expense } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import PDFDocument from 'pdfkit';

// ─── POST /api/expenses ───────────────────────────────────────────────────────
export const addExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user!._id });
    res.status(201).json({ success: true, message: 'Expense added', data: expense });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/expenses ────────────────────────────────────────────────────────
export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month, year, category, season } = req.query;
    const filter: Record<string, any> = { userId: req.user!._id };

    if (category) filter.category = category;
    if (season) filter.season = season;
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      filter.date = { $gte: new Date(Number(year), 0, 1), $lte: new Date(Number(year), 11, 31) };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ success: true, data: { expenses, total } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/expenses/analytics ─────────────────────────────────────────────
export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const [byCategory, byMonth] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            userId: req.user!._id,
            date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: req.user!._id,
            date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
          },
        },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ success: true, data: { byCategory, byMonth, year } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/expenses/export-pdf ─────────────────────────────────────────────
export const exportPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expenses = await Expense.find({ userId: req.user!._id }).sort({ date: -1 }).limit(100);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expense-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#16a34a').text('AgroAI — Expense Report', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).fillColor('#000').text('Summary', { underline: true });
    doc.fontSize(11).text(`Total Expenses: ₹${total.toLocaleString()}`);
    doc.text(`Number of Records: ${expenses.length}`);
    doc.moveDown(1);

    // Table header
    doc.fontSize(10).fillColor('#16a34a').text('Date', 50).text('Category', 130).text('Amount', 300).text('Description', 380);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#16a34a');

    // Rows
    expenses.forEach((e) => {
      doc.fillColor('#000').fontSize(9)
        .text(new Date(e.date).toLocaleDateString(), 50, doc.y + 5)
        .text(e.category, 130)
        .text(`₹${e.amount.toLocaleString()}`, 300)
        .text(e.description || '-', 380);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/expenses/:id ─────────────────────────────────────────────────
export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!expense) throw new AppError('Expense not found', 404);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};
