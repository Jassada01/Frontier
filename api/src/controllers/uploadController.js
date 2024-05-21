const { uploadFile } = require('../services/uploadService');

const upload = async (req, res) => {
  try {
    const fileUrl = await uploadFile(req.file);
    res.status(200).send({ fileUrl });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  upload,
};
