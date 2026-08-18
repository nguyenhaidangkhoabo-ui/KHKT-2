import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StudentClassController } from '../controller/student-class.controller.js';
import { authenticate, authorizeRoles } from '../services/author.service.js';
import { UserRole } from '../enums.js';

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

router.post('/assign', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentClassController.assign);
router.post('/bulk-assign', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentClassController.bulkAssign);
router.post('/:classAcademicYearId/import', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), upload.single('file'), parseExcel, StudentClassController.importExcel);
router.delete('/:classAcademicYearId/students/:studentId', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentClassController.remove);

export default router;