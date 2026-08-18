import { StudentService } from '../services/student.service.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { validateStatusUpdateInput } from '../dto/student.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class StudentController {
  static async getAll(req, res, next) {
    try {
      const list = await StudentService.getAll(req.query);
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const student = await StudentService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: student });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const created = await StudentService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const updated = await StudentService.update(req.params.id, req.body);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await StudentService.delete(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa học sinh thành công' });
    } catch (err) { next(err); }
  }

  static async getStudentsByClassAY(req, res, next) {
    try {
      const { classAcademicYearId } = req.params;
      const students = await StudentClassAcademicYearRepository.findStudentsByClassAcademicYear(classAcademicYearId);
      return res.status(HttpStatus.OK).json({ success: true, data: students });
    } catch (err) { next(err); }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const validation = validateStatusUpdateInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await StudentService.updateAcademicStatus(id, req.body.academic_status, req.body.current_grade);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Cập nhật trạng thái thành công', data: updated });
    } catch (err) { next(err); }
  }

  static async graduate(req, res, next) {
    try {
      const updated = await StudentService.updateAcademicStatus(req.params.id, 'GRADUATED', 'GRADE_12');
      return res.status(HttpStatus.OK).json({ success: true, message: 'Đánh dấu tốt nghiệp thành công', data: updated });
    } catch (err) { next(err); }
  }

  static async bulkGraduate(req, res, next) {
    try {
      const { student_ids } = req.body;
      if (!Array.isArray(student_ids) || student_ids.length === 0) {
        throw new AppError('student_ids phải là mảng không rỗng.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await StudentService.bulkGraduate(student_ids);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  static async getGraduated(req, res, next) {
    try {
      const list = await StudentService.getGraduated();
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getAcademicHistory(req, res, next) {
    try {
      const history = await StudentService.getAcademicHistory(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: history });
    } catch (err) { next(err); }
  }

  static async exportExcel(req, res, next) {
    try {
      const list = await StudentService.getAll(req.query);
      const xlsx = (await import('xlsx')).default;
      const worksheet = xlsx.utils.json_to_sheet(list);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'students');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
      return res.send(buffer);
    } catch (err) { next(err); }
  }

  static async importExcel(req, res, next) {
    try {
      const rows = req.parsedRows || [];
      const result = await StudentService.importFromExcel(rows);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}