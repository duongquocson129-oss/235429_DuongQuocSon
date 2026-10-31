const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const mongoose = require('mongoose');
const { Device } = require('../models/Device');

const records = [];

Device.find = (filter) => ({
  sort: async () => {
    if (!filter.$or) return [...records];
    return records.filter((record) => filter.$or.some((condition) => {
      const [field, matcher] = Object.entries(condition)[0];
      return new RegExp(matcher.$regex, matcher.$options).test(String(record[field]));
    }));
  },
});

Device.findById = async (id) => records.find((record) => record._id === id) || null;
Device.create = async (value) => {
  if (records.some((record) => record.deviceId === value.deviceId)) {
    const error = new Error('Duplicate deviceId');
    error.code = 11000;
    throw error;
  }
  const record = { ...value, _id: new mongoose.Types.ObjectId().toString() };
  records.push(record);
  return record;
};
Device.findByIdAndUpdate = async (id, value) => {
  const index = records.findIndex((record) => record._id === id);
  if (index < 0) return null;
  records[index] = { ...records[index], ...value };
  return records[index];
};
Device.findByIdAndDelete = async (id) => {
  const index = records.findIndex((record) => record._id === id);
  if (index < 0) return null;
  return records.splice(index, 1)[0];
};

const app = require('../app');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function send(path, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { response, data: await response.json() };
}

const validDevice = {
  deviceId: 'API-001',
  name: 'Máy chiếu kiểm thử',
  deviceType: 'Máy chiếu',
  room: 'Lab 01',
  brand: 'Epson',
  model: 'EB-X06',
  quantity: 1,
  status: 'Đang sử dụng',
};

test('health and device CRUD/search endpoints', async () => {
  records.length = 0;

  const health = await send('/health');
  assert.equal(health.response.status, 503);
  assert.equal(health.data.database, 'disconnected');

  const invalid = await send('/api/devices', 'POST', { ...validDevice, quantity: 0 });
  assert.equal(invalid.response.status, 400);

  const created = await send('/api/devices', 'POST', validDevice);
  assert.equal(created.response.status, 201);
  const id = created.data._id;

  const duplicate = await send('/api/devices', 'POST', validDevice);
  assert.equal(duplicate.response.status, 409);

  const list = await send('/api/devices');
  assert.equal(list.response.status, 200);
  assert.equal(list.data.length, 1);

  const search = await send('/api/devices?search=lab');
  assert.equal(search.response.status, 200);
  assert.equal(search.data[0].deviceId, validDevice.deviceId);

  const detail = await send(`/api/devices/${id}`);
  assert.equal(detail.response.status, 200);

  const updated = await send(`/api/devices/${id}`, 'PUT', {
    ...validDevice,
    status: 'Hư hỏng',
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.status, 'Hư hỏng');

  const removed = await send(`/api/devices/${id}`, 'DELETE');
  assert.equal(removed.response.status, 200);
  assert.equal((await send(`/api/devices/${id}`)).response.status, 404);
  assert.equal((await send('/api/devices/not-an-object-id')).response.status, 400);
});