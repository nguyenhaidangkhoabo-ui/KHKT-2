import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'super-secret-key-core-v3';
const token = jwt.sign({ id: 'test', role: 'ADMIN', username: 'test' }, secret, { expiresIn: '1h' });
const headers = { Authorization: `Bearer ${token}` };

async function get(path) {
  const res = await fetch(`http://127.0.0.1:3000${path}`, { headers });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const classes = await get('/api/core/classes');
console.log('classes status', classes.status, 'count', classes.body?.data?.length);
const class102 = classes.body?.data?.find((c) => c.name === '10.2');
console.log('10.2 id', class102?._id);

for (const path of [
  '/api/core/students',
  '/api/core/students?class_id=' + class102?._id,
  '/api/core/students?class_id=__none__',
]) {
  const r = await get(path);
  const data = r.body?.data;
  console.log(path, '-> status', r.status, 'count', Array.isArray(data) ? data.length : data);
  if (Array.isArray(data)) {
    console.log('   class_names', [...new Set(data.map((s) => s.class_name || '(none)'))]);
  }
}
