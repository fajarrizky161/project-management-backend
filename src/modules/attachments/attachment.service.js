const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../../shared/utils/prisma');

// ─── Multer Config ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

class AttachmentService {
  static getUploadMiddleware(fieldName = 'file', maxCount = 1) {
    return upload.array(fieldName, maxCount);
  }

  static async create(data) {
    return prisma.attachment.create({ data });
  }

  static async findByInstanceId(instanceId) {
    return prisma.attachment.findMany({
      where: { instanceId },
      include: {
        comment: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByCommentId(commentId) {
    return prisma.attachment.findMany({
      where: { commentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id) {
    return prisma.attachment.findUnique({ where: { id } });
  }

  static async delete(id) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new Error('Attachment not found');

    // Delete physical file
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../../uploads', attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return prisma.attachment.delete({ where: { id } });
  }
}

module.exports = AttachmentService;
