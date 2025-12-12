// utils/next-api-request-types.ts
import { NextApiRequest } from "next";

// Custom interface that extends the NextApiRequest from Next.js
export interface NextApiRequestWithFiles extends NextApiRequest {
  files: Express.Multer.File[]; // Files property will be an array of Express.Multer.File
}
