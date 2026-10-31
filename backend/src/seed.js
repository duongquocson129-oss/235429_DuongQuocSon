require('dotenv').config();
const mongoose = require('mongoose');
const { Device } = require('./models/Device');

const samples = [
  {
    deviceId: 'PRJ-001', name: 'Máy chiếu Epson', deviceType: 'Máy chiếu', room: 'A101',
    brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng',
    purchaseDate: new Date('2024-08-15'), description: 'Lắp tại bục giảng.',
  },
  {
    deviceId: 'PC-014', name: 'Máy tính để bàn Dell', deviceType: 'Máy tính', room: 'Phòng Lab 2',
    brand: 'Dell', model: 'OptiPlex 7010', quantity: 24, status: 'Đang sử dụng',
    purchaseDate: new Date('2023-09-01'), description: 'Phục vụ thực hành tin học.',
  },
  {
    deviceId: 'AUD-003', name: 'Loa hội trường', deviceType: 'Thiết bị âm thanh', room: 'B203',
    brand: 'JBL', model: 'Control 28-1', quantity: 2, status: 'Đang sửa chữa',
    purchaseDate: new Date('2022-05-20'), description: 'Một loa cần thay dây tín hiệu.',
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('Vui lòng cấu hình MONGODB_URI trong backend/.env.');
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || '235429_DuongQuocSon',
  });
  for (const sample of samples) {
    await Device.updateOne({ deviceId: sample.deviceId }, { $setOnInsert: sample }, { upsert: true });
  }
  console.log(`Đã đảm bảo ${samples.length} thiết bị mẫu có trong collection devices.`);
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());