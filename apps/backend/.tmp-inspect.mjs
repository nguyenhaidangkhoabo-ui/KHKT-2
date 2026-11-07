import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection.db;

const years = await db.collection('academic_years').find({}).toArray();
console.log('ACADEMIC YEARS:', years.map((y) => ({ id: String(y._id), start: y.start_year, end: y.end_year, current: y.is_current })));

const classes = await db.collection('classes').find({}).toArray();
console.log('CLASSES:', classes.map((c) => ({ id: String(c._id), name: c.name, grade: c.grade })));

const classAYs = await db.collection('class_academic_years').find({}).toArray();
console.log('CLASS_ACADEMIC_YEARS:', classAYs.map((c) => ({ id: String(c._id), year: String(c.academic_year_id), class: String(c.class_id) })));

const links = await db.collection('student_class_academic_years').find({}).toArray();
console.log('LINK COUNT:', links.length);

const byClassAY = {};
for (const l of links) {
  const k = String(l.class_academic_year_id);
  byClassAY[k] = (byClassAY[k] || 0) + 1;
}
console.log('LINKS PER CLASS_AY:', byClassAY);

const students = await db.collection('student_accounts').find({}).toArray();
console.log('STUDENT COUNT:', students.length);
console.log('SAMPLE STUDENTS:', students.slice(0, 3).map((s) => ({ id: String(s._id), code: s.student_code, name: s.full_name, status: s.academic_status })));

await mongoose.disconnect();
