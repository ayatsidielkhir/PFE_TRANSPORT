// Assure-toi que ce fichier est dans ./src et inclus dans typeRoots de tsconfig.json
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
