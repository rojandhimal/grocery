const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { envConfig } = require("../config/env.config");
// Configure AWS SDK with AWS4-HMAC-SHA256 for signing requests
AWS.config.update({
  signatureVersion: "v4",
});

const s3 = new AWS.S3({
  accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
  secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
});

const uploadImageToS3 = async (file, imagePath = "public/images") => {
  try {
    const { createReadStream, filename, mimetype } = await file;
    const key = `${imagePath}/${uuidv4()}-${filename}`;

    const uploadParams = {
      Bucket: envConfig.S3_BUCKET_NAME,
      Key: key,
      Body: createReadStream(),
      ContentType: mimetype,
    };

    await s3.upload(uploadParams).promise();

    // // Get a signed URL for the uploaded image
    // const signedUrlParams = {
    //   Bucket: envConfig.S3_BUCKET_NAME,
    //   Key: key,
    //   Expires: null, // or undefined
    // };
    // const signedUrl = await s3.getSignedUrlPromise(
    //   'getObject',
    //   signedUrlParams
    // );

    // return signedUrl;
    return `https://${envConfig.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};

const uploadImagesToS3 = async (files, imagePath = "public/images") => {
  const uploadedImageUrls = [];

  try {
    for (const file of files) {
      const { createReadStream, filename, mimetype } = await file;
      const key = `${imagePath}/${uuidv4()}-${filename}`;

      const uploadParams = {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: key,
        Body: createReadStream(),
        ContentType: mimetype,
      };

      await s3.upload(uploadParams).promise();

      // // Get a signed URL for the uploaded image
      // const signedUrlParams = {
      //   Bucket: envConfig.S3_BUCKET_NAME,
      //   Key: key,
      //   Expires: null, // or undefined
      // };
      // const signedUrl = await s3.getSignedUrlPromise(
      //   'getObject',
      //   signedUrlParams
      // );

      // uploadedImageUrls.push(signedUrl);
      uploadedImageUrls.push(
        `https://${envConfig.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
      );
    }

    return uploadedImageUrls;
  } catch (error) {
    console.error("Error uploading images to S3:", error);
    throw new Error("Failed to upload images to S3");
  }
};

const uploadCsvToS3 = async (file, filePath = "public/files") => {
  try {
    const key = `${filePath}`;
    const uploadParams = {
      Bucket: envConfig.S3_BUCKET_NAME,
      Key: key,
      Body: file,
      Expires: 600, // URL expiration time in seconds (10 minutes)
      ContentType: "text/csv", // Set the content type of the file
    };

    await s3.upload(uploadParams).promise();

    // Get a signed URL for the uploaded image
    const signedUrlParams = {
      Bucket: envConfig.S3_BUCKET_NAME,
      Key: key,
      Expires: null, // or undefined
    };
    const signedUrl = await s3.getSignedUrlPromise(
      "getObject",
      signedUrlParams
    );

    return signedUrl;
  } catch (error) {
    console.error("Error uploading csv to S3:", error);
    throw new Error("Failed to upload csv to S3");
  }
};
module.exports = {
  uploadImageToS3,
  uploadImagesToS3,
  uploadCsvToS3,
};
