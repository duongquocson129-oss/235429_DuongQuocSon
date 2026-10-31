const mongoose = require('mongoose');

const DEVICE_STATUSES = [
  'Đang sử dụng',
  'Hư hỏng',
  'Đang sửa chữa',
  'Ngừng sử dụng',
];

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    deviceType: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, enum: DEVICE_STATUSES },
    purchaseDate: { type: Date, default: null },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'devices' },
);

module.exports = {
  Device: mongoose.model('Device', deviceSchema),
  DEVICE_STATUSES,
};