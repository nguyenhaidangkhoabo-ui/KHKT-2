import { AcademicYear } from '../entities/academic-year.entity.js';

export class AcademicYearService {
  static async setCurrentAcademicYear(yearId) {
    const session = await AcademicYear.startSession();
    session.startTransaction();
    try {
      // AY-01: Set tất cả các năm khác về false
      await AcademicYear.updateMany({}, { $set: { is_current: false } }, { session });

      // Set năm chọn thành true
      const updated = await AcademicYear.findByIdAndUpdate(
        yearId,
        { $set: { is_current: true } },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
