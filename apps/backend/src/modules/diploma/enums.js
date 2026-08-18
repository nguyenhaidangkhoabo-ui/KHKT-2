// Trạng thái bằng tốt nghiệp (state machine: NOT_STORED → STORED → HANDED_OVER)
export const DiplomaStatus = Object.freeze({
  NOT_STORED: 'NOT_STORED',     // Trường chưa nhận bằng từ Sở
  STORED: 'STORED',             // Trường đã lưu bằng
  HANDED_OVER: 'HANDED_OVER'    // Đã trao cho học sinh
});

// Thứ trong tuần
export const DayOfWeek = Object.freeze({
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY'
});

// Trạng thái phiếu đăng ký nhận bằng (bổ sung để đồng bộ frontend hiện tại)
export const RegistrationStatus = Object.freeze({
  PENDING: 'PENDING',       // Chờ xác nhận (dự phòng)
  CONFIRMED: 'CONFIRMED',   // Đã xác nhận lịch
  COMPLETED: 'COMPLETED',   // Đã nhận bằng
  CANCELLED: 'CANCELLED'    // Đã hủy (giữ lịch sử)
});

// Ánh xạ index getDay() của JS (0=Chủ nhật) → DayOfWeek
export const DAY_NAMES = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY
];

export const DIPLOMA_STATUS_TRANSITIONS = Object.freeze({
  [DiplomaStatus.NOT_STORED]: [DiplomaStatus.STORED],
  [DiplomaStatus.STORED]: [DiplomaStatus.HANDED_OVER],
  [DiplomaStatus.HANDED_OVER]: []
});