import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { AcademicStatus } from '../../core/enums.js';
import { StudentAccount } from '../../core/entities/index.js';
import { PickupRegistration } from '../entities/index.js';
import { RegistrationStatus, DAY_NAMES } from '../enums.js';
import { DiplomaRepository } from '../repositories/diploma.repository.js';
import { PickupScheduleRepository } from '../repositories/pickup-schedule.repository.js';
import { PickupRegistrationRepository } from '../repositories/pickup-registration.repository.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateFromISO(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dayOfWeekFromDate(dateStr) {
  return DAY_NAMES[parseDateFromISO(dateStr).getDay()];
}

export class RegistrationService {
  
  static async register(studentId, data) {
    const pickupDate = data?.pickup_date;

    
    if (!pickupDate || !DATE_REGEX.test(pickupDate)) {
      throw new AppError('Ngày nhận bằng không hợp lệ (định dạng YYYY-MM-DD).', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    const todayStr = todayISO();
    if (pickupDate < todayStr) {
      throw new AppError('Không thể đăng ký nhận bằng vào ngày trong quá khứ.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    
    const student = await StudentAccount.findById(studentId).select('student_code full_name academic_status');
    if (!student) {
      throw new AppError('Không tìm thấy học sinh.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (student.academic_status !== AcademicStatus.GRADUATED) {
      throw new AppError('Chỉ học sinh đã tốt nghiệp mới được đăng ký nhận bằng.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    
    const diploma = await DiplomaRepository.findByStudentId(studentId);
    if (!diploma) {
      throw new AppError('Bạn chưa có bằng tốt nghiệp trong hệ thống.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (diploma.status === 'NOT_STORED') {
      throw new AppError(
        'Bằng tốt nghiệp chưa được trường tiếp nhận, chưa thể đăng ký nhận.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.DIPLOMA_NOT_STORED
      );
    }
    if (diploma.status === 'HANDED_OVER') {
      throw new AppError(
        'Bằng tốt nghiệp đã được trao cho bạn, không thể đăng ký nhận.',
        HttpStatus.BAD_REQUEST,
        ErrorCode.DIPLOMA_ALREADY_HANDED_OVER
      );
    }

    
    const existing = await PickupRegistrationRepository.findUpcomingForStudent(studentId, todayStr);
    if (existing) {
      throw new AppError('Bạn đã có lịch hẹn nhận bằng trong tương lai.', HttpStatus.CONFLICT, ErrorCode.ALREADY_REGISTERED);
    }

    
    const pickupDateObj = parseDateFromISO(pickupDate);
    const schedule = await PickupScheduleRepository.findByDate(pickupDateObj);
    if (!schedule) {
      throw new AppError('Không có lịch phát bằng cho ngày bạn chọn.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    const dayOfWeek = dayOfWeekFromDate(pickupDate);
    const day = schedule.days.find((d) => d.day_of_week === dayOfWeek);
    if (!day || !day.enabled) {
      throw new AppError('Ngày bạn chọn không mở nhận bằng.', HttpStatus.BAD_REQUEST, ErrorCode.SCHEDULE_CONFLICT);
    }

    
    const session = await PickupRegistrationRepository.startSession();
    session.startTransaction();
    try {
      const lockedSchedule = await PickupScheduleRepository.findByIdForUpdate(schedule._id, session);
      const lockedDay = lockedSchedule?.days.find((d) => d.day_of_week === dayOfWeek);
      if (!lockedDay || !lockedDay.enabled) {
        throw new AppError('Ngày bạn chọn không mở nhận bằng.', HttpStatus.BAD_REQUEST, ErrorCode.SCHEDULE_CONFLICT);
      }
      if (lockedDay.registered_count >= lockedDay.capacity) {
        throw new AppError('Ngày này đã đủ số lượng đăng ký.', HttpStatus.CONFLICT, ErrorCode.CAPACITY_FULL);
      }

      lockedDay.registered_count += 1;
      await lockedSchedule.save({ session });

      const registration = await PickupRegistrationRepository.create(
        {
          student_id: studentId,
          diploma_id: diploma._id,
          schedule_id: schedule._id,
          pickup_date: pickupDate,
          status: RegistrationStatus.CONFIRMED
        },
        session
      );

      await session.commitTransaction();
      session.endSession();
      return registration;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  
  static async cancel(registrationId) {
    const registration = await PickupRegistrationRepository.findById(registrationId);
    if (!registration) {
      throw new AppError('Không tìm thấy phiếu đăng ký.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const todayStr = todayISO();
    if (registration.pickup_date < todayStr) {
      throw new AppError('Không thể hủy phiếu đăng ký đã qua ngày nhận bằng.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new AppError('Phiếu đăng ký đã bị hủy trước đó.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (registration.status === RegistrationStatus.COMPLETED) {
      throw new AppError('Phiếu đăng ký đã hoàn thành, không thể hủy.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const session = await PickupRegistrationRepository.startSession();
    session.startTransaction();
    try {
      await PickupRegistrationRepository.updateStatus(registration._id, RegistrationStatus.CANCELLED, session);

      
      const schedule = await PickupScheduleRepository.findByIdForUpdate(registration.schedule_id, session);
      const day = schedule?.days?.find((d) => d.day_of_week === dayOfWeekFromDate(registration.pickup_date));
      if (day && day.registered_count > 0) {
        day.registered_count -= 1;
        await schedule.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return { message: 'Hủy đăng ký thành công.' };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  
  static async getMe(studentId) {
    return await PickupRegistrationRepository.findFutureByStudent(studentId, todayISO());
  }

  
  static async getMeHistory(studentId) {
    return await PickupRegistrationRepository.findHistoryByStudent(studentId, todayISO());
  }

  
  static async getStats() {
    const byStatus = await PickupRegistrationRepository.countByStatus();
    const todayStr = todayISO();
    const todayCount = await PickupRegistration.countDocuments({ pickup_date: todayStr });
    const upcomingCount = await PickupRegistration.countDocuments({
      pickup_date: { $gte: todayStr },
      status: { $ne: RegistrationStatus.CANCELLED }
    });
    return { ...byStatus, today: todayCount, upcoming: upcomingCount };
  }

  
  static async getList(filters = {}) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    return await PickupRegistrationRepository.findList({
      pickup_date: filters.pickup_date,
      student_id: filters.student_id,
      page,
      limit
    });
  }

  
  static async getByDate(pickupDate) {
    if (!pickupDate || !DATE_REGEX.test(pickupDate)) {
      throw new AppError('Thiếu tham số pickup_date (YYYY-MM-DD).', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    const rows = await PickupRegistrationRepository.findByDate(pickupDate);
    return rows.map((r) => ({
      registration_id: r._id,
      student_id: r.student_id?._id,
      student_code: r.student_id?.student_code,
      full_name: r.student_id?.full_name,
      phone: r.student_id?.phone || '',
      diploma_number: r.diploma_id?.diploma_number || '',
      diploma_status: r.diploma_id?.status || '',
      pickup_date: r.pickup_date,
      status: r.status
    }));
  }
}