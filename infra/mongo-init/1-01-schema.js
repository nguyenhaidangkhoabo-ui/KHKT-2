const dbName = "hvn";
const database = db.getSiblingDB(dbName);

// ============================================================
// A. ACADEMIC YEARS
// ============================================================

database.createCollection("academic_years", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "start_year",
        "end_year"
      ],
      properties: {
        start_year: {
          bsonType: "int"
        },
        end_year: {
          bsonType: "int"
        },
        is_current: {
          bsonType: "bool"
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});


// ============================================================
// B. CLASSES
// ============================================================

database.createCollection("classes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "grade"
      ],
      properties: {
        name: {
          bsonType: "string"
        },
        grade: {
          enum: [
            "GRADE_10",
            "GRADE_11",
            "GRADE_12"
          ]
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});


// ============================================================
// C. STAFF ACCOUNTS
// ============================================================

database.createCollection("staff_accounts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "username",
        "password_hash",
        "role",
        "staff_code",
        "full_name"
      ],
      properties: {
        username: {
          bsonType: "string"
        },
        password_hash: {
          bsonType: "string"
        },
        role: {
          enum: [
            "TEACHER",
            "BGH",
            "ADMIN",
            "SYSTEM_ADMIN"
          ]
        },
        status: {
          enum: [
            "ACTIVE",
            "DISABLED"
          ]
        },
        staff_code: {
          bsonType: "string"
        },
        full_name: {
          bsonType: "string"
        },
        email: {
          bsonType: "string"
        },
        phone: {
          bsonType: "string"
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});


// ============================================================
// D. STUDENT ACCOUNTS
// ============================================================

database.createCollection("student_accounts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "username",
        "password_hash",
        "student_code",
        "full_name",
        "birthdate",
        "enrollment_year"
      ],
      properties: {
        username: {
          bsonType: "string"
        },
        password_hash: {
          bsonType: "string"
        },
        role: {
          enum: [
            "GUEST",
            "STUDENT",
            "TEACHER",
            "BGH",
            "ADMIN",
            "SYSTEM_ADMIN"
          ]
        },
        status: {
          enum: [
            "ACTIVE",
            "DISABLED"
          ]
        },
        student_code: {
          bsonType: "string"
        },
        full_name: {
          bsonType: "string"
        },
        birthdate: {
          bsonType: "date"
        },
        gender: {
          bsonType: "string"
        },
        email: {
          bsonType: "string"
        },
        phone: {
          bsonType: "string"
        },
        father_phone: {
          bsonType: "string"
        },
        mother_phone: {
          bsonType: "string"
        },
        enrollment_year: {
          bsonType: "int"
        },
        academic_status: {
          enum: [
            "ACTIVE",
            "SUSPENDED",
            "DROPOUT",
            "TRANSFERRED",
            "GRADUATED"
          ]
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});


// ============================================================
// E. CLASS ACADEMIC YEARS
// ============================================================

database.createCollection("class_academic_years", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "academic_year_id",
        "class_id"
      ],
      properties: {
        academic_year_id: {
          bsonType: "objectId"
        },
        class_id: {
          bsonType: "objectId"
        },
        homeroom_teacher_id: {
          bsonType: "objectId"
        }
      }
    }
  }
});


// ============================================================
// F. STUDENT CLASS ACADEMIC YEARS
// ============================================================

database.createCollection("student_class_academic_years", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "class_academic_year_id",
        "student_id"
      ],
      properties: {
        class_academic_year_id: {
          bsonType: "objectId"
        },
        student_id: {
          bsonType: "objectId"
        }
      }
    }
  }
  
});

// ===================== MODULE DIPLOMA =====================

// 1. diplomas — bằng tốt nghiệp
db.createCollection('diplomas', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['student_id', 'graduation_academic_year_id', 'status'],
      properties: {
        student_id: { bsonType: 'objectId' },
        graduation_academic_year_id: { bsonType: 'objectId' },
        status: { enum: ['NOT_STORED', 'STORED', 'HANDED_OVER'] },
        diploma_number: { bsonType: ['string', 'null'] },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});
db.diplomas.createIndex({ student_id: 1 }, { unique: true });
db.diplomas.createIndex({ graduation_academic_year_id: 1, status: 1 });

// 2. diploma_pickup_schedules — lịch phát bằng theo tuần
db.createCollection('diploma_pickup_schedules', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['academic_year_id', 'year_week', 'week_start_date', 'week_end_date', 'days'],
      properties: {
        academic_year_id: { bsonType: 'objectId' },
        year_week: { bsonType: 'string' },
        week_start_date: { bsonType: 'date' },
        week_end_date: { bsonType: 'date' },
        days: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['day_of_week', 'enabled', 'start_time', 'end_time', 'capacity', 'registered_count'],
            properties: {
              day_of_week: { enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] },
              enabled: { bsonType: 'bool' },
              start_time: { bsonType: 'string' },
              end_time: { bsonType: 'string' },
              capacity: { bsonType: 'int' },
              registered_count: { bsonType: 'int' }
            }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});
db.diploma_pickup_schedules.createIndex({ year_week: 1 }, { unique: true });
db.diploma_pickup_schedules.createIndex({ week_start_date: 1, week_end_date: 1 });

// 3. diploma_pickup_registrations — phiếu đăng ký nhận bằng
db.createCollection('diploma_pickup_registrations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['student_id', 'diploma_id', 'schedule_id', 'pickup_date', 'status'],
      properties: {
        student_id: { bsonType: 'objectId' },
        diploma_id: { bsonType: 'objectId' },
        schedule_id: { bsonType: 'objectId' },
        pickup_date: { bsonType: 'string' },
        status: { enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
        note: { bsonType: 'string' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});
db.diploma_pickup_registrations.createIndex({ schedule_id: 1, pickup_date: 1, student_id: 1 }, { unique: true });
db.diploma_pickup_registrations.createIndex({ student_id: 1, pickup_date: 1 });
db.diploma_pickup_registrations.createIndex({ pickup_date: 1 });