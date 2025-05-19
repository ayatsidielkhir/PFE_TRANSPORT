import 'express';

declare global {
  namespace Express {
    export interface Request {
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

export {};
