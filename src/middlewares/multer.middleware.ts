import multer from "multer";
import { Request } from "express";
import { CLOUDINARY_MAX_FILESIZE } from "@/utils/constant.utils";

export const uploadImage = multer({
  limits: {
    files: 6,
    fileSize: Number(CLOUDINARY_MAX_FILESIZE),
  },
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
      return callback(new Error("Only JPEG, JPG, and PNG files are allowed"));
    }
    callback(null, true);
  },
});
