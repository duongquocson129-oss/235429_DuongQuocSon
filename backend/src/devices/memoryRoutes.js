const express = require('express');
const mongoose = require('mongoose');
const { validateDevicePayload } = require('./validation');

const router = express.Router();

const initialDevices = [
  {
    deviceId: 'PRJ-001', name: 'Máy chiếu Epson', deviceType: 'Máy chiếu', room: 'A101',
    brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng',
    purchaseDate: '2024-08-15', description: 'Lắp tại bục giảng.',
  },
  {
    deviceId: 'PC-014', name: 'Máy tính để bàn Dell', deviceType: 'Máy tính', room: 'Phòng Lab 2',
    brand: 'Dell', model: 'OptiPlex 7010', quantity: 24, status: 'Đang sử dụng',
    purchaseDate: '2023-09-01', description: 'Phục vụ thực hành tin học.',
  },
  {
    deviceId: 'AUD-003', name: 'Loa hội trường', deviceType: 'Thiết bị âm thanh', room: 'B203',
    brand: 'JBL', model: 'Control 28-1', quantity: 2, status: 'Đang sửa chữa',
    purchaseDate: '2022-05-20', description: 'Một loa cần thay dây tín hiệu.',
  },
];

let devices = createInitialDevices();

function createInitialDevices() {
  return initialDevices.map((device) => ({
    ...device,
    _id: new mongoose.Types.ObjectId().toString(),
  }));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findDevice(id) {
  return devices.find((device) => device._id === id);
}

router.get('/', (req, res) => {
  const search = String(req.query.search || '').trim();
  const results = search
    ? devices.filter((device) => ['deviceId', 'name', 'deviceType', 'room'].some((field) => (
        new RegExp(escapeRegex(search), 'i').test(device[field])
      )))
    : devices;
  res.json(results);
});

router.get('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  const device = findDevice(req.params.id);
  if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
  res.json(device);
});

router.post('/', (req, res) => {
  const { value, error } = validateDevicePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  if (devices.some((device) => device.deviceId === value.deviceId)) {
    return res.status(409).json({ message: 'Mã thiết bị deviceId đã tồn tại.' });
  }
  const device = { ...value, _id: new mongoose.Types.ObjectId().toString() };
  devices.unshift(device);
  res.status(201).json(device);
});

router.put('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  const { value, error } = validateDevicePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  const index = devices.findIndex((device) => device._id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
  if (devices.some((device) => device._id !== req.params.id && device.deviceId === value.deviceId)) {
    return res.status(409).json({ message: 'Mã thiết bị deviceId đã tồn tại.' });
  }
  devices[index] = { ...value, _id: req.params.id };
  res.json(devices[index]);
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  const index = devices.findIndex((device) => device._id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
  const [device] = devices.splice(index, 1);
  res.json({ message: 'Đã xóa thiết bị.', id: device._id });
});

function resetForTests() {
  devices = createInitialDevices();
}

module.exports = router;
module.exports.resetForTests = resetForTests;