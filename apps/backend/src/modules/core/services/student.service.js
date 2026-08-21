import bcrypt from 'bcrypt';
import { AcademicStatus } from '../enums.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

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
  static async getAll(filters = {}) {
    return await StudentAccountRepository.findAll(filters);
  }

  static async getById(id) {
    const student = await StudentAccountRepository.findById(id);
    if (!student) {
      throw new AppError('Không tìm thấy học sinh.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return student;
  }

  static async create(data) {
    const existing = await StudentAccountRepository.findByUsername(data.username);
    if (existing) {
      throw new AppError('Tên đăng nhập đã tồn tại.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    return await StudentAccountRepository.create({ ...data, password_hash: passwordHash });
  }

  static async update(id, data) {
    await this.getById(id);
    return await StudentAccountRepository.update(id, data);
  }

  static async delete(id) {
    await this.getById(id);
    return await StudentAccountRepository.delete(id);
  }

  
  static async updateAcademicStatus(studentId, newStatus, currentGrade) {
    const student = await this.getById(studentId);
    const currentStatus = student.academic_status;
    if (currentStatus === newStatus) return student;

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Chuyển trạng thái từ ${currentStatus} sang ${newStatus} không hợp lệ.`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    
    if (newStatus === AcademicStatus.GRADUATED && currentGrade !== 'GRADE_12') {
      throw new AppError(
        'Chỉ học sinh khối 12 mới được phép chuyển sang trạng thái Tốt nghiệp.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    return await StudentAccountRepository.updateStatus(studentId, newStatus);
  }

  static async bulkGraduate(studentIds) {
    return await StudentAccountRepository.bulkUpdateStatus(studentIds, AcademicStatus.GRADUATED);
  }

  static async getGraduated() {
    return await StudentAccountRepository.findGraduated();
  }

  static async getAcademicHistory(studentId) {
    await this.getById(studentId);
    return await StudentClassAcademicYearRepository.findAcademicHistoryByStudent(studentId);
  }

  static async importFromExcel(rows) {
    const results = { success: 0, failed: 0, errors: [] };
    for (const row of rows) {
      try {
        await this.create(row);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row, message: err.message });
      }
    }
    return results;
  }
}