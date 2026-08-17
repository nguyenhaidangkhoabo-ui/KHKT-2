import { AcademicStatus } from '../enums.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';

const VALID_TRANSITIONS = {
  [AcademicStatus.ACTIVE]: [
    AcademicStatus.SUSPENDED,
    AcademicStatus.DROPOUT,
    AcademicStatus.TRANSFERRED,
    AcademicStatus.GRADUATED
  ],
  [AcademicStatus.SUSPENDED]: [
    AcademicStatus.ACTIVE,
    AcademicStatus.DROPOUT,
    AcademicStatus.TRANSFERRED
  ],
  [AcademicStatus.DROPOUT]: [],
  [AcademicStatus.TRANSFERRED]: [],
  [AcademicStatus.GRADUATED]: []
};

export class StudentService {
  static async updateAcademicStatus(studentId, newStatus, currentGrade) {
    const student = await StudentAccountRepository.findById(studentId);
    if (!student) throw new Error('Không tìm thấy học sinh.');

    const currentStatus = student.academic_status;
    if (currentStatus === newStatus) return student;

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Chuyển trạng thái từ ${currentStatus} sang ${newStatus} không hợp lệ.`);
    }

    if (newStatus === AcademicStatus.GRADUATED && currentGrade !== 'GRADE_12') {
      throw new Error('Chỉ học sinh khối 12 mới được phép chuyển sang trạng thái Tốt nghiệp.');
    }

    return await StudentAccountRepository.updateStatus(studentId, newStatus);
  }
}
