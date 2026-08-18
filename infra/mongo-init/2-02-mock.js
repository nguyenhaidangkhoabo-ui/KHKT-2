const dbName = "hvn";
const database = db.getSiblingDB(dbName);

// ============================================================
// 0. RESET
// ============================================================

[
  "student_class_academic_years",
  "class_academic_years",
  "student_accounts",
  "staff_accounts",
  "classes",
  "academic_years",
].forEach((collection) => {
  database[collection].deleteMany({});
});

// ============================================================
// 1. HELPERS
// ============================================================

const now = new Date();

function date(year, month, day) {
  return new Date(year, month - 1, day);
}

// bcrypt hash of: rootpassword - salt10
// Dùng chung cho mock account để tiện login/test API.
const MOCK_PASSWORD_HASH =
  "$2b$10$hZXVNB0vKkTuFuYOpLYaUuMzK35GIv8.xYpEix5VvDoDbVOJquOVO";

function studentCode(index) {
  return `HS${String(index).padStart(4, "0")}`;
}

function staffCode(index) {
  return `GV${String(index).padStart(3, "0")}`;
}

// ============================================================
// A. ACADEMIC YEARS
// ============================================================

const academicYears = [
  {
    _id: ObjectId(),
    start_year: 2023,
    end_year: 2024,
    is_current: false,
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    start_year: 2024,
    end_year: 2025,
    is_current: false,
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    start_year: 2025,
    end_year: 2026,
    is_current: true,
    created_at: now,
    updated_at: now,
  },
];

database.academic_years.insertMany(academicYears);

// ============================================================
// B. CLASSES
// ============================================================

const classes = [
  // GRADE 10
  {
    _id: ObjectId(),
    name: "10A1",
    grade: "GRADE_10",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "10A2",
    grade: "GRADE_10",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "10A3",
    grade: "GRADE_10",
    created_at: now,
    updated_at: now,
  },

  // GRADE 11
  {
    _id: ObjectId(),
    name: "11A1",
    grade: "GRADE_11",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "11A2",
    grade: "GRADE_11",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "11A3",
    grade: "GRADE_11",
    created_at: now,
    updated_at: now,
  },

  // GRADE 12
  {
    _id: ObjectId(),
    name: "12A1",
    grade: "GRADE_12",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "12A2",
    grade: "GRADE_12",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    name: "12A3",
    grade: "GRADE_12",
    created_at: now,
    updated_at: now,
  },
];

database.classes.insertMany(classes);

// ============================================================
// C. STAFF ACCOUNTS
// ============================================================

const teachers = [
  {
    _id: ObjectId(),
    username: "ADMIN",
    password_hash: MOCK_PASSWORD_HASH,
    role: "SYSTEM_ADMIN",
    status: "ACTIVE",
    staff_code: staffCode(1),
    full_name: "Administrator",
    email: "[EMAIL_ADDRESS]",
    phone: "0000000000",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    username: "tranthibinh",
    password_hash: MOCK_PASSWORD_HASH,
    role: "TEACHER",
    status: "ACTIVE",
    staff_code: staffCode(2),
    full_name: "Trần Thị Bình",
    email: "tranthibinh@hvn.edu.vn",
    phone: "0901000002",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    username: "levancuong",
    password_hash: MOCK_PASSWORD_HASH,
    role: "TEACHER",
    status: "ACTIVE",
    staff_code: staffCode(3),
    full_name: "Lê Văn Cường",
    email: "levancuong@hvn.edu.vn",
    phone: "0901000003",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    username: "phamthidung",
    password_hash: MOCK_PASSWORD_HASH,
    role: "TEACHER",
    status: "ACTIVE",
    staff_code: staffCode(4),
    full_name: "Phạm Thị Dung",
    email: "phamthidung@hvn.edu.vn",
    phone: "0901000004",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    username: "hoangminhduc",
    password_hash: MOCK_PASSWORD_HASH,
    role: "BGH",
    status: "ACTIVE",
    staff_code: staffCode(5),
    full_name: "Hoàng Minh Đức",
    email: "hoangminhduc@hvn.edu.vn",
    phone: "0901000005",
    created_at: now,
    updated_at: now,
  },
  {
    _id: ObjectId(),
    username: "nguyenhoamai",
    password_hash: MOCK_PASSWORD_HASH,
    role: "ADMIN",
    status: "ACTIVE",
    staff_code: staffCode(6),
    full_name: "Nguyễn Hoài Mai",
    email: "nguyenhoamai@hvn.edu.vn",
    phone: "0901000006",
    created_at: now,
    updated_at: now,
  },
];

database.staff_accounts.insertMany(teachers);

// ============================================================
// D. STUDENT ACCOUNTS
// ============================================================

const studentNames = [
  ["Nguyễn Minh Anh", "FEMALE"],
  ["Trần Quốc Bảo", "MALE"],
  ["Lê Hoàng Châu", "FEMALE"],
  ["Phạm Gia Huy", "MALE"],
  ["Võ Minh Khang", "MALE"],
  ["Đặng Ngọc Lan", "FEMALE"],
  ["Bùi Đức Long", "MALE"],
  ["Nguyễn Hà My", "FEMALE"],
  ["Trần Minh Nhật", "MALE"],
  ["Phạm Khánh Ngân", "FEMALE"],

  ["Lê Anh Duy", "MALE"],
  ["Nguyễn Thùy Dương", "FEMALE"],
  ["Hoàng Gia Hân", "FEMALE"],
  ["Trần Đức Huy", "MALE"],
  ["Võ Thanh Hằng", "FEMALE"],
  ["Đỗ Minh Khôi", "MALE"],
  ["Nguyễn Phương Linh", "FEMALE"],
  ["Phạm Nhật Minh", "MALE"],
  ["Lê Quang Nam", "MALE"],
  ["Trần Ngọc Phương", "FEMALE"],

  ["Nguyễn Thành Đạt", "MALE"],
  ["Hoàng Minh Khoa", "MALE"],
  ["Phạm Ngọc Mai", "FEMALE"],
  ["Trần Anh Quân", "MALE"],
  ["Lê Thu Trang", "FEMALE"],
  ["Nguyễn Quốc Việt", "MALE"],
  ["Võ Hải Yến", "FEMALE"],
  ["Đặng Minh Tuấn", "MALE"],
  ["Bùi Khánh Vy", "FEMALE"],
  ["Nguyễn Đức Thịnh", "MALE"],
];

const students = studentNames.map(([full_name, gender], index) => {
  const number = index + 1;

  // Học sinh vào lớp 10 trong khoảng 2023-2025.
  const enrollment_year = 2023 + (index % 3);

  let academic_status = "ACTIVE";

  if (number === 27) academic_status = "SUSPENDED";
  if (number === 28) academic_status = "DROPOUT";
  if (number === 29) academic_status = "TRANSFERRED";
  if (number === 30) academic_status = "GRADUATED";

  const username = `hs${String(number).padStart(4, "0")}`;

  return {
    _id: ObjectId(),
    username,
    password_hash: MOCK_PASSWORD_HASH,
    role: "STUDENT",
    status: academic_status === "DROPOUT" ? "DISABLED" : "ACTIVE",

    student_code: studentCode(number),
    full_name,

    birthdate: date(
      enrollment_year - 15,
      (index % 12) + 1,
      (index % 27) + 1
    ),

    gender,

    email: `${username}@student.hvn.edu.vn`,
    phone: `091${String(1000000 + number).slice(-7)}`,

    father_phone: `092${String(1000000 + number).slice(-7)}`,
    mother_phone: `093${String(1000000 + number).slice(-7)}`,

    enrollment_year,
    academic_status,

    created_at: now,
    updated_at: now,
  };
});

database.student_accounts.insertMany(students);

// ============================================================
// E. CLASS ACADEMIC YEARS
// ============================================================
//
// Mỗi năm học có 9 lớp.
// Mỗi lớp được gán một giáo viên chủ nhiệm.
//
// ============================================================

const classAcademicYears = [];

academicYears.forEach((academicYear, yearIndex) => {
  classes.forEach((classItem, classIndex) => {
    const teacher = teachers[
      (classIndex + yearIndex) % 4
    ];

    classAcademicYears.push({
      _id: ObjectId(),

      academic_year_id: academicYear._id,
      class_id: classItem._id,

      homeroom_teacher_id: teacher._id,
    });
  });
});

database.class_academic_years.insertMany(classAcademicYears);

// ============================================================
// F. STUDENT CLASS ACADEMIC YEARS
// ============================================================
//
// Phân học sinh vào lớp theo từng năm học.
//
// Mock logic:
//   - Mỗi học sinh xuất hiện trong 1 lớp / năm.
//   - Học sinh chuyển cấp theo từng năm.
//   - Một số học sinh có trạng thái đặc biệt.
// ============================================================

const studentClassAcademicYears = [];

students.forEach((student, studentIndex) => {
  academicYears.forEach((academicYear, yearIndex) => {
    const studentStartYear = student.enrollment_year;

    // Không phân học sinh vào năm trước khi nhập học.
    if (academicYear.start_year < studentStartYear) {
      return;
    }

    // Sau khi tốt nghiệp thì không tiếp tục phân lớp.
    if (
      student.academic_status === "GRADUATED" &&
      academicYear.start_year > 2024
    ) {
      return;
    }

    // Học sinh bỏ học từ 2025 thì không phân lớp năm 2025.
    if (
      student.academic_status === "DROPOUT" &&
      academicYear.start_year >= 2025
    ) {
      return;
    }

    // Xác định khối dựa trên số năm đã học.
    const gradeLevel =
      10 + (academicYear.start_year - studentStartYear);

    if (gradeLevel < 10 || gradeLevel > 12) {
      return;
    }

    const grade =
      gradeLevel === 10
        ? "GRADE_10"
        : gradeLevel === 11
          ? "GRADE_11"
          : "GRADE_12";

    // Chọn lớp tương ứng với grade.
    const gradeClasses = classes.filter(
      (classItem) => classItem.grade === grade
    );

    const selectedClass =
      gradeClasses[studentIndex % gradeClasses.length];

    const classAcademicYear =
      classAcademicYears.find(
        (item) =>
          item.academic_year_id.equals(academicYear._id) &&
          item.class_id.equals(selectedClass._id)
      );

    if (!classAcademicYear) {
      return;
    }

    studentClassAcademicYears.push({
      _id: ObjectId(),

      class_academic_year_id: classAcademicYear._id,
      student_id: student._id,
    });
  });
});

database.student_class_academic_years.insertMany(
  studentClassAcademicYears
);

// ============================================================
// 7. INDEXES
// ============================================================

database.academic_years.createIndex(
  { start_year: 1, end_year: 1 },
  { unique: true }
);

database.classes.createIndex(
  { name: 1 },
  { unique: true }
);

database.staff_accounts.createIndex(
  { username: 1 },
  { unique: true }
);

database.staff_accounts.createIndex(
  { staff_code: 1 },
  { unique: true }
);

database.student_accounts.createIndex(
  { username: 1 },
  { unique: true }
);

database.student_accounts.createIndex(
  { student_code: 1 },
  { unique: true }
);

database.class_academic_years.createIndex(
  { academic_year_id: 1, class_id: 1 },
  { unique: true }
);

database.student_class_academic_years.createIndex(
  { class_academic_year_id: 1, student_id: 1 },
  { unique: true }
);

// ============================================================
// 8. SUMMARY
// ============================================================

print("========================================");
print("HVN MOCK DATA SEEDED");
print("========================================");

print(`academic_years: ${database.academic_years.countDocuments()}`);
print(`classes: ${database.classes.countDocuments()}`);
print(`staff_accounts: ${database.staff_accounts.countDocuments()}`);
print(`student_accounts: ${database.student_accounts.countDocuments()}`);
print(
  `class_academic_years: ${database.class_academic_years.countDocuments()}`
);
print(
  `student_class_academic_years: ${database.student_class_academic_years.countDocuments()}`
);

print("========================================");
print("MOCK LOGIN");
print("========================================");
print("Student     : hs0001 / rootpassword");
print("Teacher     : tranthibinh / rootpassword");
print("BGH         : hoangminhduc / rootpassword");
print("Admin       : nguyenhoamai / rootpassword");
print("System Admin: ADMIN / rootpassword");
print("========================================");

// ===================== MODULE DIPLOMA (SEED MẪU) =====================

const graduatedStudents = db.student_accounts.find({ academic_status: 'GRADUATED' }).toArray();
const currentYear = db.academic_years.findOne({ is_current: true }) || db.academic_years.findOne();

// 1. Tạo bằng tốt nghiệp cho tối đa 3 học sinh đã tốt nghiệp
if (graduatedStudents.length > 0 && currentYear) {
  const sampleStudents = graduatedStudents.slice(0, 3);
  const existingDiplomas = db.diplomas.countDocuments({});
  sampleStudents.forEach((s, i) => {
    const hasDiploma = db.diplomas.findOne({ student_id: s._id });
    if (!hasDiploma) {
      db.diplomas.insertOne({
        student_id: s._id,
        graduation_academic_year_id: currentYear._id,
        status: i === 0 ? 'NOT_STORED' : 'STORED',
        diploma_number: i === 0 ? null : `HVN-${currentYear.start_year}-${String(existingDiplomas + i + 1).padStart(4, '0')}`,
        created_at: now,
        updated_at: now
      });
    }
  });
}

// 2. Tạo lịch phát bằng tuần sau (Thứ 2 → Chủ nhật)
const today = new Date();
const dow = today.getDay() === 0 ? -6 : 1 - today.getDay();
const monday = new Date(today);
monday.setDate(today.getDate() + dow + 7);
monday.setHours(0, 0, 0, 0);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);

const yearStart = new Date(monday.getFullYear(), 0, 1);
const weekNumber = Math.ceil((((monday - yearStart) / 86400000) + 1) / 7);
const yearWeek = `${monday.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

const hasSchedule = db.diploma_pickup_schedules.findOne({ year_week: yearWeek });
if (!hasSchedule && currentYear) {
  db.diploma_pickup_schedules.insertOne({
    academic_year_id: currentYear._id,
    year_week: yearWeek,
    week_start_date: monday,
    week_end_date: sunday,
    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d, idx) => ({
      day_of_week: d,
      enabled: idx < 5, // T2–T6 bật, T7–CN tắt
      start_time: '07:30',
      end_time: '17:00',
      capacity: 100,
      registered_count: 0
    })),
    created_at: now,
    updated_at: now
  });
}