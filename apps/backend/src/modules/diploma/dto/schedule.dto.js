import { DayOfWeek } from '../enums.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const validateDayPatchInput = (data) => {
  const errors = [];
  if (!Object.values(DayOfWeek).includes(data.dayOfWeek)) errors.push('dayOfWeek không hợp lệ.');
  if (data.enabled !== undefined && typeof data.enabled !== 'boolean') errors.push('enabled phải là boolean.');
  if (data.start_time !== undefined && !TIME_REGEX.test(data.start_time)) {
    errors.push('start_time không hợp lệ (định dạng HH:mm).');
  }
  if (data.end_time !== undefined && !TIME_REGEX.test(data.end_time)) {
    errors.push('end_time không hợp lệ (định dạng HH:mm).');
  }
  if (data.capacity !== undefined && (!Number.isInteger(data.capacity) || data.capacity < 1)) {
    errors.push('capacity phải là số nguyên >= 1.');
  }
  const hasAnyField =
    data.enabled !== undefined ||
    data.start_time !== undefined ||
    data.end_time !== undefined ||
    data.capacity !== undefined;
  if (!hasAnyField) errors.push('Không có trường nào để cập nhật.');
  return { isValid: errors.length === 0, errors };
};