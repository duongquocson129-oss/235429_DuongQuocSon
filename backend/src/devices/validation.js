const { DEVICE_STATUSES } = require('../models/Device');

const requiredTextFields = ['deviceId', 'name', 'deviceType', 'room', 'brand', 'model'];

function validateDevicePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'Dữ liệu gửi lên phải là một object JSON.' };
  }

  const value = {};
  for (const field of requiredTextFields) {
    if (typeof payload[field] !== 'string' || !payload[field].trim()) {
      return { error: `Trường ${field} là bắt buộc và phải là chuỗi không rỗng.` };
    }
    value[field] = payload[field].trim();
  }

  const quantity = Number(payload.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: 'quantity phải là số nguyên lớn hơn hoặc bằng 1.' };
  }
  value.quantity = quantity;

  if (!DEVICE_STATUSES.includes(payload.status)) {
    return { error: `status phải thuộc một trong các giá trị: ${DEVICE_STATUSES.join(', ')}.` };
  }
  value.status = payload.status;

  if (payload.purchaseDate) {
    const purchaseDate = new Date(payload.purchaseDate);
    if (Number.isNaN(purchaseDate.getTime())) {
      return { error: 'purchaseDate không phải ngày hợp lệ.' };
    }
    value.purchaseDate = purchaseDate;
  } else {
    value.purchaseDate = null;
  }

  if (payload.description !== undefined && typeof payload.description !== 'string') {
    return { error: 'description phải là chuỗi.' };
  }
  value.description = (payload.description || '').trim();
  return { value };
}

module.exports = { validateDevicePayload };