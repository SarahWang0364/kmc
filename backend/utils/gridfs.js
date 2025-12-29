const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

const initGridFS = () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, {
    bucketName: 'classNotes'
  });
  return bucket;
};

const uploadFile = (buffer, filename, metadata) => {
  return new Promise((resolve, reject) => {
    if (!bucket) initGridFS();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.on('error', reject);

    uploadStream.end(buffer);
  });
};

const downloadFile = (fileId) => {
  if (!bucket) initGridFS();
  return bucket.openDownloadStream(fileId);
};

const deleteFile = async (fileId) => {
  if (!bucket) initGridFS();
  await bucket.delete(fileId);
};

const getFileInfo = async (fileId) => {
  if (!bucket) initGridFS();
  const files = await bucket.find({ _id: fileId }).toArray();
  return files.length > 0 ? files[0] : null;
};

module.exports = {
  initGridFS,
  uploadFile,
  downloadFile,
  deleteFile,
  getFileInfo
};
