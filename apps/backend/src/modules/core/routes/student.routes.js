import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StudentController } from '../controller/student.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseExcel = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thiếu file Excel.' });
    }
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    req.parsedRows = xlsx.utils.sheet_to_json(sheet);
    next();
  } catch (err) {
    next(err);
  }
};


router.get('/', authenticate, StudentController.getAll);
router.get('/graduated', authenticate, StudentController.getGraduated);
router.get('/export', authenticate, StudentController.exportExcel);
router.get('/class-academic-year/:classAcademicYearId', authenticate, StudentController.getStudentsByClassAY);
router.get('/:id', authenticate, StudentController.getById);
router.get('/:id/academic-history', authenticate, StudentController.getAcademicHistory);
router.post('/', authenticate, StudentController.create);
router.post('/bulk-graduate', authenticate, StudentController.bulkGraduate);
router.post('/import', authenticate, upload.single('file'), parseExcel, StudentController.importExcel);
router.patch('/:id', authenticate, StudentController.update);
router.patch('/:id/status', authenticate, StudentController.updateStatus);
router.patch('/:id/graduate', authenticate, StudentController.graduate);
router.delete('/:id', authenticate, StudentController.delete);

export default router;