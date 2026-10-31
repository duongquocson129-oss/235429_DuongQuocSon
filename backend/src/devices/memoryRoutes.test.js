const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const memoryRoutes = require('./memoryRoutes');

const app = express();
app.use(express.json());
app.use('/api/devices', memoryRoutes);

let server;
let baseUrl;

before(async () => {
  memoryRoutes.resetForTests();
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

const newDevice = {
  deviceId: 'DEMO-001', name: 'Micro không dây', deviceType: 'Thiết bị âm thanh',
  room: 'B101', brand: 'Shure', model: 'SVX288', quantity: 2,
  status: 'Đang sử dụng',
};

test('memory API seeds devices and supports create, search, update, delete', async () => {
  const initial = await send('/api/devices');
  assert.equal(initial.response.status, 200);
  assert.equal(initial.data.length, 3);

  const created = await send('/api/devices', 'POST', newDevice);
  assert.equal(created.response.status, 201);
  const id = created.data._id;

  const duplicate = await send('/api/devices', 'POST', newDevice);
  assert.equal(duplicate.response.status, 409);

  const search = await send('/api/devices?search=micro');
  assert.equal(search.response.status, 200);
  assert.equal(search.data.length, 1);

  const updated = await send(`/api/devices/${id}`, 'PUT', {
    ...newDevice,
    status: 'Đang sửa chữa',
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.status, 'Đang sửa chữa');

  const removed = await send(`/api/devices/${id}`, 'DELETE');
  assert.equal(removed.response.status, 200);
  assert.equal((await send(`/api/devices/${id}`)).response.status, 404);
});