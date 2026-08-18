import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StaffController } from '../controller/staff.controller.js';
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

router.get('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH), StaffController.getAll);
router.get('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH), StaffController.getById);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StaffController.create);
router.patch('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StaffController.update);
router.patch('/:id/status', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StaffController.updateStatus);
router.patch('/:id/role', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StaffController.updateRole);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), StaffController.delete);
router.post('/import', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), upload.single('file'), parseExcel, StaffController.importExcel);

export default router;