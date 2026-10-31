require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 5000;
const database = process.env.MONGODB_DB || '235429_DuongQuocSon';

app.listen(port, () => {
  console.log(`API đang chạy tại cổng ${port}`);
  if (!process.env.MONGODB_URI) {
    console.error('Thiếu MONGODB_URI; API health sẽ báo database disconnected.');
    return;
  }
  mongoose.connect(process.env.MONGODB_URI, { dbName: database })
    .then(() => console.log(`Đã kết nối MongoDB database ${database}`))
    .catch((error) => console.error('Không thể kết nối MongoDB:', error.message));
});