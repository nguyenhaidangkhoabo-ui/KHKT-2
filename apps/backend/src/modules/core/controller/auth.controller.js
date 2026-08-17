import { AuthenService } from '../services/authen.service.js';
import { validateLoginInput } from '../dto/login.dto.js';

export class AuthController {
  static async login(req, res) {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
      }

      const result = await AuthenService.login(req.body.username, req.body.password);
      return res.status(200).json({ message: 'Đăng nhập thành công', ...result });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }
}
