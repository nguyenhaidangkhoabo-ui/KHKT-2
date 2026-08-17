import { AcademicYearRepository } from '../repositories/academic-year.repository.js';
import { AcademicYearService } from '../services/academic-year.service.js';
import { validateAcademicYearInput } from '../dto/academic-year.dto.js';

export class AcademicYearController {
  static async getAll(req, res) {
    const list = await AcademicYearRepository.findAll();
    return res.status(200).json({ data: list });
  }

  static async create(req, res) {
    try {
      const validation = validateAcademicYearInput(req.body);
      if (!validation.isValid) return res.status(400).json({ errors: validation.errors });

      const created = await AcademicYearRepository.create(req.body);
      return res.status(201).json({ data: created });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async setCurrent(req, res) {
    try {
      const updated = await AcademicYearService.setCurrentAcademicYear(req.params.id);
      return res.status(200).json({ message: 'Cập nhật năm học hiện tại thành công', data: updated });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
