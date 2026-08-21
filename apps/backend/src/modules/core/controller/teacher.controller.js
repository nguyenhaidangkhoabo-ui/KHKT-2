import { TeacherService } from '../services/teacher.service.js';
import { HttpStatus } from '../../../core/error.js';

export class TeacherController {
  static async getMyClasses(req, res, next) {
    try {
      const list = await TeacherService.getMyHomeroomClasses(req.user?.sub, req.query.academic_year_id);
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getClassStudents(req, res, next) {
    try {
      const students = await TeacherService.getClassStudents(req.params.classAcademicYearId);
      return res.status(HttpStatus.OK).json({ success: true, data: students });
    } catch (err) { next(err); }
  }
}