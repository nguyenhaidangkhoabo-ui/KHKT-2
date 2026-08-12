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
// C. TEACHER ACCOUNTS
// ============================================================

database.createCollection("teacher_accounts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "username",
        "password_hash",
        "role",
        "teacher_code",
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
        teacher_code: {
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