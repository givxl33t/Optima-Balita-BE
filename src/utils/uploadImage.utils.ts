import cloudinary from "@/config/cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { HttpExceptionBadRequest } from "@/exceptions/HttpException";

const uploadImageToCloudinary = async (
  options: UploadApiOptions,
  image: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          reject(new HttpExceptionBadRequest(error.message));
        } else {
          resolve(result as UploadApiResponse);
        }
      })
      .end(image);
  });
};

export default uploadImageToCloudinary;
