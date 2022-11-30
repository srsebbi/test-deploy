import { Request, Response, NextFunction } from 'express';
import { get, omit } from 'lodash';
import { reIssueAccessToken } from '../services/session.service';
import { verifyJwt } from '../utils/jwt.utils';

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken =
    get(req, 'cookies.accessToken') ||
    get(req, 'headers.authorization', '')?.replace(/^Bearer\s/, '');
  const refreshToken =
    get(req, 'cookies.refreshToken') || get(req, 'headers.x-refresh');
  if (!accessToken) {
    return next();
  }
  const { decoded, expired } = verifyJwt(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }
  if (expired && refreshToken) {
    // Checking that the refreshToken is valid
    const newAccessToken = await reIssueAccessToken({
      refreshToken: refreshToken as string,
    });

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken);

      res.cookie('accessToken', accessToken, {
        maxAge: 90000, // 15min
        httpOnly: true,
        domain: 'localhost',
        path: '/',
        sameSite: 'strict',
        secure: false,
      });
    }

    const result = verifyJwt(newAccessToken as string);

    res.locals.user = result.decoded;

    return next();
  }
  return next();
};

export default deserializeUser;