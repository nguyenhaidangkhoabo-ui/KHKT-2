import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StaffController } from '../controller/staff.controller.js';
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

router.get('/', authenticate, StaffController.getAll);
router.get('/:id', authenticate, StaffController.getById);
router.post('/', authenticate, StaffController.create);
router.patch('/:id', authenticate, StaffController.update);
router.patch('/:id/status', authenticate, StaffController.updateStatus);
router.patch('/:id/role', authenticate, StaffController.updateRole);
router.delete('/:id', authenticate, StaffController.delete);
router.post('/import', authenticate, upload.single('file'), parseExcel, StaffController.importExcel);

export default router;