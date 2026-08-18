import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StudentController } from '../controller/student.controller.js';
import { authenticate, authorizeRoles, checkTeacherClassAccess } from '../services/author.service.js';
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

// Lưu ý thứ tự route: các route tĩnh phải đặt TRƯỚC route động /:id
router.get('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH), StudentController.getAll);
router.get('/graduated', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH), StudentController.getGraduated);
router.get('/export', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH), StudentController.exportExcel);
router.get('/class-academic-year/:classAcademicYearId', authenticate, checkTeacherClassAccess, StudentController.getStudentsByClassAY);
router.get('/:id', authenticate, StudentController.getById);
router.get('/:id/academic-history', authenticate, StudentController.getAcademicHistory);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentController.create);
router.post('/bulk-graduate', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentController.bulkGraduate);
router.post('/import', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), upload.single('file'), parseExcel, StudentController.importExcel);
router.patch('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentController.update);
router.patch('/:id/status', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.BGH), StudentController.updateStatus);
router.patch('/:id/graduate', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentController.graduate);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StudentController.delete);

export default router;