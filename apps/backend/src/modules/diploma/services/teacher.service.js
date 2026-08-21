import { ClassAcademicYear, StudentClassAcademicYear } from '../../core/entities/index.js';
import { Diploma } from '../entities/diploma.entity.js';

export class TeacherService {
  
  static async getMyClass(user) {
    const filter = user?.sub ? { homeroom_staff_id: user.sub } : {};
    const classAYs = await ClassAcademicYear.find(filter).lean();
    if (!classAYs.length) {
      return {
        class_name: '',
        diplomas: []
      };
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