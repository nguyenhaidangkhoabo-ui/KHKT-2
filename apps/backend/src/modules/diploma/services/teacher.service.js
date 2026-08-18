import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { ClassAcademicYear, StudentClassAcademicYear } from '../../core/entities/index.js';
import { Diploma } from '../entities/diploma.entity.js';

export class TeacherService {
  // GET /teacher/my-class — giáo viên xem tình trạng bằng của lớp mình (TCH-01..03)
  static async getMyClass(user) {
    // TCH-01: chỉ lớp mình làm GVCN
    const classAYs = await ClassAcademicYear.find({ homeroom_staff_id: user.sub }).lean();
    if (!classAYs.length) {
      throw new AppError('Bạn không phải giáo viên chủ nhiệm của lớp nào.', HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const classAYIds = classAYs.map((c) => c._id);
    const classNames = classAYs.map((c) => c.name || c.class_name || '').filter(Boolean);

    const enrollments = await StudentClassAcademicYear.find({ class_academic_year_id: { $in: classAYIds } })
      .populate('student_id', 'student_code full_name')
      .lean();

    const studentIds = enrollments.map((e) => e.student_id?._id).filter(Boolean);
    const diplomas = studentIds.length ? await Diploma.find({ student_id: { $in: studentIds } }).lean() : [];

    const diplomaMap = new Map(diplomas.map((d) => [String(d.student_id), d]));

    const rows = enrollments.map((e) => {
      const diploma = diplomaMap.get(String(e.student_id?._id));
      return {
        student_id: e.student_id?._id,
        student_code: e.student_id?.student_code || '',
        student_name: e.student_id?.full_name || '',
        diploma_number: diploma?.diploma_number || '',
        status: diploma?.status || 'NO_DIPLOMA'
      };
    });

    return {
      class_name: classNames.join(', '),
      diplomas: rows
    };
  }
}