import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StudentClassController } from '../controller/student-class.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const CLASS_HEADER_MAP = {
  'student_code': 'student_code',
  'mã học sinh': 'student_code',
  'ma hoc sinh': 'student_code',
  'student code': 'student_code',
  'mã hs': 'student_code',
  'ma hs': 'student_code',
  'mshs': 'student_code',
};

const mapClassRow = (row) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) {
    const field = CLASS_HEADER_MAP[String(key || '').trim().toLowerCase()];
    if (field) normalized[field] = value;
  }
  return normalized;
};

const parseExcel = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thiếu file Excel.' });
    }
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    req.parsedRows = xlsx.utils.sheet_to_json(sheet).map(mapClassRow);
    next();
  } catch (err) {
    next(err);
  }
};

router.post('/assign', authenticate, StudentClassController.assign);
router.post('/bulk-assign', authenticate, StudentClassController.bulkAssign);
router.post('/:classAcademicYearId/import', authenticate, upload.single('file'), parseExcel, StudentClassController.importExcel);
router.delete('/:classAcademicYearId/students/:studentId', authenticate, StudentClassController.remove);

export default router;