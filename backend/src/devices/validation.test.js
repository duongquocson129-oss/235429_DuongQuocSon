const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDevicePayload } = require('./validation');

const validDevice = {
  deviceId: 'PRJ-001',
  name: 'Máy chiếu Epson',
  deviceType: 'Máy chiếu',
  room: 'A101',
  brand: 'Epson',
  model: 'EB-X06',
  quantity: 1,
  status: 'Đang sử dụng',
};

test('chuẩn hóa dữ liệu thiết bị hợp lệ', () => {
  const result = validateDevicePayload({ ...validDevice, name: '  Máy chiếu Epson  ' });
  assert.equal(result.error, undefined);
  assert.equal(result.value.name, 'Máy chiếu Epson');
  assert.equal(result.value.purchaseDate, null);
});

test('từ chối số lượng không hợp lệ', () => {
  const result = validateDevicePayload({ ...validDevice, quantity: 0 });
  assert.match(result.error, /quantity/);
});

test('từ chối trạng thái ngoài danh sách', () => {
  const result = validateDevicePayload({ ...validDevice, status: 'Không xác định' });
  assert.match(result.error, /status/);
});