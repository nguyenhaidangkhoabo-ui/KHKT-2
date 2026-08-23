import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StaffController } from '../controller/staff.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const STAFF_HEADER_MAP = {
  'username': 'username',
  'tên người dùng': 'username',
  'ten nguoi dung': 'username',
  'tài khoản': 'username',
  'tai khoan': 'username',
  'user name': 'username',
  'password': 'password',
  'mật khẩu': 'password',
  'mat khau': 'password',
  'mk': 'password',
  'staff_code': 'staff_code',
  'mã cán bộ': 'staff_code',
  'ma can bo': 'staff_code',
  'staff code': 'staff_code',
  'mã giáo viên': 'staff_code',
  'ma giao vien': 'staff_code',
  'mã gv': 'staff_code',
  'ma gv': 'staff_code',
  'full_name': 'full_name',
  'fullname': 'full_name',
  'full name': 'full_name',
  'họ tên': 'full_name',
  'ho ten': 'full_name',
  'họ và tên': 'full_name',
  'ho va ten': 'full_name',
  'tên': 'full_name',
  'ten': 'full_name',
  'email': 'email',
  'thư điện tử': 'email',
  'thu dien tu': 'email',
  'phone': 'phone',
  'số điện thoại': 'phone',
  'so dien thoai': 'phone',
  'điện thoại': 'phone',
  'dien thoai': 'phone',
  'sđt': 'phone',
  'sdt': 'phone',
  'role': 'role',
  'vai trò': 'role',
  'vai tro': 'role',
  'chức vụ': 'role',
  'chuc vu': 'role',
};

const mapStaffRow = (row) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) {
    const field = STAFF_HEADER_MAP[String(key || '').trim().toLowerCase()];
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
    req.parsedRows = xlsx.utils.sheet_to_json(sheet).map(mapStaffRow);
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