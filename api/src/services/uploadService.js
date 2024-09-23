const bucket = require("../config/firebaseConfig");
const path = require("path");

const generateRandomSuffix = () => {
  return "_" + Math.random().toString(36).substring(2, 5);
};

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file uploaded.");
    }

    const suffix = generateRandomSuffix();
    const fileName = `${
      path.parse(file.originalname).name
    }${suffix}${path.extname(file.originalname)}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      reject(err.message);
    });

    blobStream.on("finish", async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err.message);
      }
    });

    blobStream.end(file.buffer);
  });
};

const uploadFileToSubfolder = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file uploaded.");
    }

    const suffix = generateRandomSuffix();
    const fileName = `Upload_File_Attached/${
      path.parse(file.originalname).name
    }${suffix}${path.extname(file.originalname)}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      reject(err.message);
    });

    blobStream.on("finish", async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err.message);
      }
    });

    blobStream.end(file.buffer);
  });
};

module.exports = {
  uploadFile,
  uploadFileToSubfolder,
};
