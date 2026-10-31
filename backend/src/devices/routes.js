const express = require('express');
const mongoose = require('mongoose');
const { Device } = require('../models/Device');
const { validateDevicePayload } = require('./validation');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search
      ? {
          $or: ['deviceId', 'name', 'deviceType', 'room'].map((field) => ({
            [field]: { $regex: escapeRegex(search), $options: 'i' },
          })),
        }
      : {};
    const devices = await Device.find(filter).sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
    res.json(device);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { value, error } = validateDevicePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const device = await Device.create(value);
    res.status(201).json(device);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Mã thiết bị deviceId đã tồn tại.' });
    }
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  const { value, error } = validateDevicePayload(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
    res.json(device);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Mã thiết bị deviceId đã tồn tại.' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
  }
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
    res.json({ message: 'Đã xóa thiết bị.', id: device._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;