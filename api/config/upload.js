const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = {
  paymentReceipts: path.join(__dirname, "../uploads/payment-receipts"),
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for payment receipts
const paymentReceiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.paymentReceipts);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${req.params.id}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and PDF files are allowed.",
      ),
    );
  }
};

// Upload middleware for payment receipts
const uploadPaymentReceipt = multer({
  storage: paymentReceiptStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

module.exports = {
  uploadPaymentReceipt,
  uploadDirs,
};
