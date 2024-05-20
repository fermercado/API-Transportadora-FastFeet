import { JwtPayload } from '../../application/interfaces/IAuthService';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    clientTimeZone?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
