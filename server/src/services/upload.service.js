import cloudinary from "../config/cloudinary.js";

export function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "fashionhub/products", resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url.replace("/upload/", "/upload/f_auto,q_auto/"),
          publicId: result.public_id
        });
      }
    );
    stream.end(buffer);
  });
}

export function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}
