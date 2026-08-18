import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { AcademicStatus } from '../../core/enums.js';
import { StudentAccount, AcademicYear, StudentClassAcademicYear } from '../../core/entities/index.js';
import { DiplomaStatus, DIPLOMA_STATUS_TRANSITIONS } from '../enums.js';
import { DiplomaRepository } from '../repositories/diploma.repository.js';
import { PickupRegistrationRepository } from '../repositories/pickup-registration.repository.js';

// DIP-02: kiểm tra học sinh có học khối 12 trong năm tốt nghiệp không
async function isGrade12InYear(studentId, graduationAcademicYearId) {
  const records = await StudentClassAcademicYear.find({ student_id: studentId })
    .populate('class_academic_year_id')
    .lean();
  return records.some(
    (r) =>
      r.class_academic_year_id &&
      String(r.class_academic_year_id.academic_year_id) === String(graduationAcademicYearId) &&
      r.class_academic_year_id.grade === 'GRADE_12'
  );
}

export class DiplomaService {
  // GET /diplomas/me — học sinh xem bằng của mình
  static async getMe(studentId) {
    const diploma = await DiplomaRepository.findByStudentIdPopulated(studentId);
    if (!diploma) return null;
    return {
      _id: diploma._id,
      student_id: diploma.student_id?._id,
      student_code: diploma.student_id?.student_code,
      full_name: diploma.student_id?.full_name,
      graduation_academic_year: diploma.graduation_academic_year_id?.name || diploma.graduation_academic_year_id?._id,
      diploma_number: diploma.diploma_number,
      status: diploma.status,
      updated_at: diploma.updated_at
    };
  }

  // GET /diplomas/stats — thống kê theo trạng thái
  static async getStats() {
    return await DiplomaRepository.countByStatus();
  }

  // GET /diplomas — danh sách (BGH/ADMIN) với bộ lọc
  static async getAll(filters = {}) {
    let studentIds;
    const keyword = filters.student_code || filters.search;
    if (keyword) {
      const students = await StudentAccount.find({
        $or: [
          { student_code: { $regex: keyword, $options: 'i' } },
          { full_name: { $regex: keyword, $options: 'i' } }
        ]
      })
        .select('_id')
        .lean();
      studentIds = students.map((s) => s._id);
    }
    return await DiplomaRepository.findAll({
      status: filters.status,
      year_id: filters.year_id,
      student_id: filters.student_id,
      student_ids: studentIds
    });
  }

  // GET /diplomas/:id
  static async getById(id) {
    const diploma = await DiplomaRepository.findById(id);
    if (!diploma) {
      throw new AppError('Không tìm thấy bằng tốt nghiệp.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return diploma;
  }

  // POST /diplomas — tạo bằng (DIP-01, DIP-02)
  static async create(data) {
    const { student_id, graduation_academic_year_id } = data;

    const student = await StudentAccount.findById(student_id).select('student_code full_name academic_status');
    if (!student) {
      throw new AppError('Không tìm thấy học sinh.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (student.academic_status !== AcademicStatus.GRADUATED) {
      throw new AppError(
        'Chỉ học sinh đã tốt nghiệp (academic_status = GRADUATED) mới được tạo bằng tốt nghiệp.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const year = await AcademicYear.findById(graduation_academic_year_id);
    if (!year) {
      throw new AppError('Không tìm thấy năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // DIP-01: tối đa 1 bằng / học sinh / năm
    const exists = await DiplomaRepository.existsByStudentAndYear(student_id, graduation_academic_year_id);
    if (exists) {
      throw new AppError(
        'Học sinh này đã có bằng tốt nghiệp cho năm học được chọn.',
        HttpStatus.CONFLICT,
        ErrorCode.DIPLOMA_ALREADY_EXISTS
      );
    }

    return await DiplomaRepository.create({
      student_id,
      graduation_academic_year_id,
      status: DiplomaStatus.NOT_STORED
    });
  }

  // POST /diplomas/bulk-create — tạo hàng loạt cho toàn bộ học sinh tốt nghiệp của năm
  static async bulkCreate(data) {
    let students;

    if (Array.isArray(data.student_ids) && data.student_ids.length > 0) {
      students = await StudentAccount.find({
        _id: { $in: data.student_ids },
        academic_status: AcademicStatus.GRADUATED
      })
        .select('_id')
        .lean();
    } else if (data.academic_year_id) {
      // Toàn bộ học sinh đã tốt nghiệp trong hệ thống
      students = await StudentAccount.find({ academic_status: AcademicStatus.GRADUATED })
        .select('_id')
        .lean();
    } else {
      throw new AppError(
        'Cần truyền academic_year_id hoặc student_ids để tạo hàng loạt.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const existing = await DiplomaRepository.findAll({ year_id: data.academic_year_id });
    const existingStudentIds = new Set(
      existing
        .map((d) => d.student_id?._id || d.student_id)
        .filter(Boolean)
        .map(String)
    );

    const toCreate = students
      .map((s) => s._id)
      .filter((id) => !existingStudentIds.has(String(id)))
      .map((studentId) => ({
        student_id: studentId,
        graduation_academic_year_id: data.academic_year_id,
        status: DiplomaStatus.NOT_STORED
      }));

    if (toCreate.length > 0) {
      await DiplomaRepository.bulkCreate(toCreate);
    }

    return {
      created_count: toCreate.length,
      skipped_count: students.length - toCreate.length,
      message: `Đã tạo ${toCreate.length} bằng tốt nghiệp, bỏ qua ${students.length - toCreate.length} học sinh đã có bằng.`
    };
  }

  // POST /diplomas/:id/receive — NOT_STORED → STORED
  static async receive(id) {
    const diploma = await DiplomaRepository.findById(id);
    if (!diploma) {
      throw new AppError('Không tìm thấy bằng tốt nghiệp.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const allowedNext = DIPLOMA_STATUS_TRANSITIONS[diploma.status] || [];
    if (!allowedNext.includes(DiplomaStatus.STORED)) {
      throw new AppError(
        `Không thể chuyển bằng từ trạng thái ${diploma.status} sang STORED (chỉ từ NOT_STORED).`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Sinh số hiệu bằng nếu chưa có
    const extra = {};
    if (!diploma.diploma_number) {
      const count = await DiplomaRepository.countAll();
      extra.diploma_number = `HVN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    return await DiplomaRepository.updateStatus(id, DiplomaStatus.STORED, extra);
  }

  // POST /diplomas/bulk-receive — cập nhật nhiều bằng cùng lúc
  static async bulkReceive(diplomaIds) {
    const result = await DiplomaRepository.bulkUpdateStatus(
      diplomaIds,
      DiplomaStatus.NOT_STORED,
      DiplomaStatus.STORED
    );
    return {
      modified_count: result.modifiedCount,
      message: `Đã cập nhật ${result.modifiedCount} bằng sang trạng thái Đã lưu tại trường.`
    };
  }

  // POST /diplomas/:id/handover — STORED → HANDED_OVER
  static async handover(id) {
    const diploma = await DiplomaRepository.findById(id);
    if (!diploma) {
      throw new AppError('Không tìm thấy bằng tốt nghiệp.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (diploma.status === DiplomaStatus.HANDED_OVER) {
      throw new AppError(
        'Bằng tốt nghiệp đã được trao cho học sinh trước đó.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.DIPLOMA_ALREADY_HANDED_OVER
      );
    }
    if (diploma.status !== DiplomaStatus.STORED) {
      throw new AppError(
        'Chỉ bằng ở trạng thái STORED mới được trao cho học sinh.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const updated = await DiplomaRepository.updateStatus(id, DiplomaStatus.HANDED_OVER);

    // Đồng bộ: mọi phiếu đăng ký nhận bằng của học sinh → COMPLETED
    await PickupRegistrationRepository.markCompletedByStudent(diploma.student_id);

    return updated;
  }

  // POST /diplomas/bulk-handover
  static async bulkHandover(diplomaIds) {
    const result = await DiplomaRepository.bulkUpdateStatus(
      diplomaIds,
      DiplomaStatus.STORED,
      DiplomaStatus.HANDED_OVER
    );

    if (result.modifiedCount > 0) {
      const diplomas = await DiplomaRepository.findByIds(diplomaIds);
      const studentIds = diplomas.map((d) => d.student_id).filter(Boolean);
      if (studentIds.length > 0) {
        await PickupRegistrationRepository.markCompletedByStudentMany(studentIds);
      }
    }

    return {
      modified_count: result.modifiedCount,
      message: `Đã trao ${result.modifiedCount} bằng tốt nghiệp cho học sinh.`
    };
  }
}