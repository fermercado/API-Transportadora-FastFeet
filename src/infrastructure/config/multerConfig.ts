import multer from 'multer';
import path from 'path';
import fs from 'fs';

const tempFolder = path.resolve(__dirname, '..', '..', 'tmp');

if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: tempFolder,
  filename: (req, file, callback) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    callback(null, fileName);
  },
});

const upload = multer({ storage });

export { upload, tempFolder };
