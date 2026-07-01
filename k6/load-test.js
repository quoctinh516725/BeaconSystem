import http from 'k6/http';
import { sleep, check } from 'k6';

// Cấu hình kịch bản test tải
export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Tăng tải lên 20 virtual users (VUs) trong 30s
    { duration: '1m', target: 100 },  // Giữ tải ổn định 20 VUs trong 1 phút
    { duration: '30s', target: 0 },  // Giảm tải về 0 VUs trong 30s
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Tỉ lệ lỗi phải nhỏ hơn 1%
    http_req_duration: ['p(95)<500'], // 95% số requests phải hoàn thành dưới 500ms
  },
};

// Lấy host mục tiêu từ biến môi trường TARGET_HOST hoặc mặc định localhost:3001
const TARGET_HOST = __ENV.TARGET_HOST || 'http://160.30.20.64:3001';

export default function () {
  // 1. Kiểm tra Endpoint chính "/"
  const resRoot = http.get(`${TARGET_HOST}/`);
  check(resRoot, {
    'status is 200': (r) => r.status === 200,
    'body contains welcome': (r) => r.body && r.body.includes('WELCOME'),
  });

  sleep(0.5); // Nghỉ 500ms

  // 2. Kiểm tra Endpoint "/api/posts"
  const resPosts = http.get(`${TARGET_HOST}/api/posts`);
  check(resPosts, {
    'status is 200 or 401 or 404': (r) => r.status === 200 || r.status === 401 || r.status === 404,
  });

  sleep(1); // Nghỉ 1s
}
