import { verrifyAccessToken } from '../../modules/core/services/token.service.js';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

export const authGuard = (req, res, next) => {
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

  if (accessToken) {
    try {
      req.access_token_payload = verrifyAccessToken(accessToken);
    } catch (err) {
      req.access_token_payload = null;
    }
  }

  next();
};

export default authGuard;
