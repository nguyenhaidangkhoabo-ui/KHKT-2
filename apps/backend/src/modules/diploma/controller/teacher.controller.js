import { TeacherService } from '../services/teacher.service.js';
import { HttpStatus } from '../../../core/error.js';

export class TeacherController {
  static async getMyClass(req, res, next) {
    try {
      const data = await TeacherService.getMyClass(req.user);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }
}