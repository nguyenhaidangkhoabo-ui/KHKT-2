import { StudentClassService } from '../services/student-class.service.js';
import { validateAssignStudentInput, validateBulkAssignInput } from '../dto/student-class.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class StudentClassController {
  static async assign(req, res, next) {
    try {
      const validation = validateAssignStudentInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await StudentClassService.assign(req.body.class_academic_year_id, req.body.student_id);
      return res.status(HttpStatus.CREATED).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  static async bulkAssign(req, res, next) {
    try {
      const validation = validateBulkAssignInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await StudentClassService.bulkAssign(req.body.class_academic_year_id, req.body.student_ids);
      return res.status(HttpStatus.CREATED).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  static async remove(req, res, next) {
    try {
      const { classAcademicYearId, studentId } = req.params;
      await StudentClassService.remove(classAcademicYearId, studentId);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa học sinh khỏi lớp thành công' });
    } catch (err) { next(err); }
  }

  static async importExcel(req, res, next) {
    try {
      const rows = req.parsedRows || [];
      const result = await StudentClassService.importFromExcel(req.params.classAcademicYearId, rows);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}