import mongoose from 'mongoose';
import { StudentService } from './src/modules/core/services/student.service.js';
import { ClassRepository } from './src/modules/core/repositories/class.repository.js';

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const classes = await ClassRepository.findAll();
const all = await StudentService.getAll();

for (const c of classes) {
  const list = await StudentService.getAll({ class_id: String(c._id) });
  const names = [...new Set(list.map((s) => s.class_name || '(none)'))];
  console.log(`class ${c.name} (${c._id}) -> ${list.length} students; class_names=${JSON.stringify(names)}`);
}

const none = await StudentService.getAll({ class_id: '__none__' });
console.log('NO CLASS ->', none.length);

console.log('ALL ->', all.length);
console.log('ALL class distribution:', [...all.reduce((m, s) => { const k = s.class_name || '(none)'; m.set(k, (m.get(k) || 0) + 1); return m; }, new Map())]);

// Raw link/class info for current year
const current = await db.collection('academic_years').findOne({ is_current: true });
console.log('CURRENT YEAR', String(current?._id), current?.start_year, current?.end_year);
const classAYs = await db.collection('class_academic_years').find({ academic_year_id: current._id }).toArray();
for (const cay of classAYs) {
  const cls = await db.collection('classes').findOne({ _id: cay.class_id });
  const count = await db.collection('student_class_academic_years').countDocuments({ class_academic_year_id: cay._id });
  console.log('CURRENT classAY', String(cay._id), cls?.name, 'students=', count);
}

await mongoose.disconnect();
