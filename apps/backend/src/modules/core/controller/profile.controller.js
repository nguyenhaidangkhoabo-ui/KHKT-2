import { ProfileService } from '../services/profile.service.js';

export class ProfileController {
  static async getMyProfile(req, res) {
    try {
      const profile = await ProfileService.getProfile(req.user.sub, req.user.is_staff);
      return res.status(200).json({ data: profile });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
