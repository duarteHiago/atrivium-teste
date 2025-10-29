const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que o diretório existe
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Usaremos memoryStorage para poder processar com sharp antes de salvar
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Tipo de arquivo inválido. Envie JPG, PNG ou WEBP.'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: imageFileFilter,
});

module.exports = { upload, ensureDir };
