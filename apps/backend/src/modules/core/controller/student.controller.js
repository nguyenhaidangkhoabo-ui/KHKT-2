import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { StudentService } from '../services/student.service.js';
import { validateStatusUpdateInput } from '../dto/student.dto.js';

export class StudentController {
  static async getStudentsByClassAY(req, res) {
    try {
      const { classAcademicYearId } = req.params;
      const students = await StudentClassAcademicYearRepository.findStudentsByClassAcademicYear(classAcademicYearId);
      return res.status(200).json({ data: students });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { academic_status, current_grade } = req.body;

      const validation = validateStatusUpdateInput(req.body);
      if (!validation.isValid) return res.status(400).json({ errors: validation.errors });

      const updated = await StudentService.updateAcademicStatus(id, academic_status, current_grade);
      return res.status(200).json({ message: 'Cập nhật trạng thái thành công', data: updated });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
