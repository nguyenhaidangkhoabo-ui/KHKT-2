import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { StudentController } from '../controller/student.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const STUDENT_HEADER_MAP = {
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
  'student_code': 'student_code',
  'mã học sinh': 'student_code',
  'ma hoc sinh': 'student_code',
  'student code': 'student_code',
  'mã hs': 'student_code',
  'ma hs': 'student_code',
  'mshs': 'student_code',
  'full_name': 'full_name',
  'fullname': 'full_name',
  'full name': 'full_name',
  'họ tên': 'full_name',
  'ho ten': 'full_name',
  'họ và tên': 'full_name',
  'ho va ten': 'full_name',
  'tên': 'full_name',
  'ten': 'full_name',
  'birthdate': 'birthdate',
  'ngày sinh': 'birthdate',
  'ngay sinh': 'birthdate',
  'date of birth': 'birthdate',
  'dob': 'birthdate',
  'ngày tháng năm sinh': 'birthdate',
  'ngay thang nam sinh': 'birthdate',
  'gender': 'gender',
  'giới tính': 'gender',
  'gioi tinh': 'gender',
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
  'sđt học sinh': 'phone',
  'sdt hoc sinh': 'phone',
  'father_phone': 'father_phone',
  'sđt bố': 'father_phone',
  'sđt cha': 'father_phone',
  'sdt cha': 'father_phone',
  'sdt bo': 'father_phone',
  'số điện thoại bố': 'father_phone',
  'so dien thoai bo': 'father_phone',
  'mother_phone': 'mother_phone',
  'sđt mẹ': 'mother_phone',
  'sdt me': 'mother_phone',
  'số điện thoại mẹ': 'mother_phone',
  'so dien thoai me': 'mother_phone',
  'enrollment_year': 'enrollment_year',
  'năm nhập học': 'enrollment_year',
  'nam nhap hoc': 'enrollment_year',
  'năm học': 'enrollment_year',
  'nam hoc': 'enrollment_year',
  'enrollment year': 'enrollment_year',
  'academic_status': 'academic_status',
  'trạng thái học vụ': 'academic_status',
  'trang thai hoc vu': 'academic_status',
  'trạng thái': 'academic_status',
  'trang thai': 'academic_status',
};

const normalizeGender = (value) => {
  if (value == null) return value;
  const v = String(value).trim().toLowerCase();
  if (v === 'nam' || v === 'male' || v === '1') return 'MALE';
  if (v === 'nữ' || v === 'nu' || v === 'female' || v === '0') return 'FEMALE';
  return value;
};

const mapStudentRow = (row) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) {
    const field = STUDENT_HEADER_MAP[String(key || '').trim().toLowerCase()];
    if (field) normalized[field] = value;
  }
  if (normalized.gender != null) normalized.gender = normalizeGender(normalized.gender);
  return normalized;
};

const parseExcel = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thiếu file Excel.' });
    }
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    req.parsedRows = xlsx.utils.sheet_to_json(sheet).map(mapStudentRow);
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