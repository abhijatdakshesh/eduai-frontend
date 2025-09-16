# Backend Requirements for Enhanced Bulk Import/Export System

## Overview
This document outlines the backend requirements for implementing the enhanced bulk import/export functionality that supports student-parent linking with department, year, semester, and section management.

## Database Schema Requirements

### 1. Enhanced Student Table
Ensure your `students` table includes these fields:
```sql
-- Additional fields needed for enhanced functionality
ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS semester VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE;
```

### 2. Parent-Student Relationship Table
Ensure you have a proper relationship table:
```sql
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    student_id INTEGER REFERENCES students(id),
    relationship VARCHAR(20) DEFAULT 'Parent', -- Father, Mother, Guardian
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);
```

### 3. Department Management Table
```sql
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, code) VALUES 
('Computer Science', 'CS'),
('Mathematics', 'MATH'),
('Physics', 'PHY'),
('Chemistry', 'CHEM'),
('Biology', 'BIO'),
('English', 'ENG'),
('History', 'HIST'),
('Economics', 'ECON');
```

### 4. Academic Year/Semester Management
```sql
CREATE TABLE IF NOT EXISTS academic_periods (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    semester VARCHAR(50) NOT NULL,      -- e.g., "Fall 2024"
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Required

### 1. Enhanced Bulk Import Endpoint
**POST** `/admin/bulk-import/unified`

**Request Body:**
- `file`: CSV file (multipart/form-data)
- `type`: "unified"

**Enhanced CSV Format:**
```csv
type,first_name,last_name,email,password,role,student_id,department,academic_year,semester,section,grade_level,class_name,room_id,teacher_email,parent_email,parent_phone,parent_relationship,phone,address,date_of_birth,gender,emergency_contact,medical_info,enrollment_date,status
student,John,Doe,john.doe@student.edu,password123,student,STU001,Computer Science,2024-2025,Fall 2024,A,Grade 10,CS101,ROOM-101,teacher@school.edu,parent@email.com,+1234567890,Father,+1234567890,123 Main St,2005-01-15,Male,John Parent +1234567890,None,2024-01-01,active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 150,
    "errors": 5,
    "details": {
      "students_created": 120,
      "parents_created": 80,
      "relationships_linked": 120,
      "departments_created": 3,
      "errors": [
        {
          "row": 5,
          "error": "Invalid department: 'Invalid Dept'",
          "data": {...}
        }
      ]
    }
  }
}
```

### 2. Students Export Endpoint
**GET** `/admin/students/export`

**Query Parameters:**
- `department`: Filter by department
- `academic_year`: Filter by academic year
- `semester`: Filter by semester
- `section`: Filter by section
- `include_parents`: Boolean (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@student.edu",
        "student_id": "STU001",
        "department": "Computer Science",
        "academic_year": "2024-2025",
        "semester": "Fall 2024",
        "section": "A",
        "grade_level": "Grade 10",
        "class_name": "CS101",
        "phone": "+1234567890",
        "address": "123 Main St",
        "date_of_birth": "2005-01-15",
        "gender": "Male",
        "enrollment_date": "2024-01-01",
        "status": "active",
        "parent": {
          "email": "parent@email.com",
          "phone": "+1234567890",
          "relationship": "Father"
        }
      }
    ],
    "total_count": 150,
    "exported_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Validation Endpoint
**POST** `/admin/bulk-import/validate`

**Request Body:**
- `file`: CSV file (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "valid_rows": 145,
    "invalid_rows": 5,
    "validation_errors": [
      {
        "row": 3,
        "errors": ["Invalid email format", "Missing department"]
      }
    ],
    "preview": {
      "students_to_create": 120,
      "parents_to_create": 80,
      "departments_to_create": 3
    }
  }
}
```

## Business Logic Requirements

### 1. Student Creation Process
1. **Validate Required Fields**: first_name, last_name, email, student_id, department
2. **Check for Duplicates**: By email and student_id
3. **Create/Update Department**: If department doesn't exist, create it
4. **Create User Account**: Create base user with role 'student'
5. **Create Student Profile**: Link to user account with academic details
6. **Handle Parent Linking**: See parent linking logic below

### 2. Parent Creation and Linking Process
1. **Check if Parent Exists**: By email
2. **Create Parent if Not Exists**: 
   - Create user account with role 'parent'
   - Create parent profile
3. **Link Parent to Student**: Create relationship record
4. **Handle Multiple Children**: One parent can have multiple children

### 3. Department Management
1. **Auto-Create Departments**: If department doesn't exist, create it
2. **Validate Department Names**: Check against allowed departments
3. **Case-Insensitive Matching**: "computer science" matches "Computer Science"

### 4. Academic Period Management
1. **Validate Academic Year Format**: YYYY-YYYY (e.g., "2024-2025")
2. **Validate Semester Format**: "Fall 2024", "Spring 2025", etc.
3. **Auto-Create Academic Periods**: If period doesn't exist, create it

### 5. Section Management
1. **Validate Section Format**: Single letter (A, B, C) or alphanumeric
2. **Check Section Capacity**: Ensure section doesn't exceed capacity limits

## Error Handling

### 1. Validation Errors
- **Missing Required Fields**: Return specific field names
- **Invalid Email Format**: Validate email format
- **Duplicate Student IDs**: Check for existing student_id
- **Invalid Department**: Check against allowed departments
- **Invalid Academic Year**: Validate format and range

### 2. Database Errors
- **Foreign Key Violations**: Handle missing references gracefully
- **Unique Constraint Violations**: Handle duplicate emails/student_ids
- **Transaction Rollback**: Rollback entire import on critical errors

### 3. Partial Import Handling
- **Continue on Non-Critical Errors**: Log errors but continue processing
- **Return Detailed Error Report**: Include row numbers and specific errors
- **Provide Retry Mechanism**: Allow re-import of failed rows

## Performance Considerations

### 1. Batch Processing
- **Process in Batches**: Handle large CSV files in chunks (e.g., 100 rows at a time)
- **Database Transactions**: Use transactions for each batch
- **Memory Management**: Stream large files instead of loading entirely into memory

### 2. Caching
- **Department Cache**: Cache department lookups
- **Academic Period Cache**: Cache active academic periods
- **User Cache**: Cache existing user lookups

### 3. Async Processing
- **Background Jobs**: For very large imports, use background job processing
- **Progress Tracking**: Provide real-time progress updates
- **Webhook Notifications**: Notify when import is complete

## Security Considerations

### 1. File Validation
- **File Type Validation**: Only allow CSV files
- **File Size Limits**: Set reasonable file size limits
- **Content Validation**: Scan for malicious content

### 2. Data Validation
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize all input data
- **Email Validation**: Validate email formats and domains

### 3. Access Control
- **Admin Only**: Restrict bulk import to admin users
- **Rate Limiting**: Prevent abuse of import endpoints
- **Audit Logging**: Log all import/export activities

## Testing Requirements

### 1. Unit Tests
- **CSV Parsing**: Test CSV parsing with various formats
- **Validation Logic**: Test all validation rules
- **Database Operations**: Test CRUD operations

### 2. Integration Tests
- **End-to-End Import**: Test complete import flow
- **Error Scenarios**: Test various error conditions
- **Performance Tests**: Test with large CSV files

### 3. Sample Data
- **Valid CSV Files**: Provide sample valid CSV files
- **Invalid CSV Files**: Provide sample invalid CSV files for testing
- **Edge Cases**: Test with empty files, malformed data, etc.

## Implementation Priority

### Phase 1 (High Priority)
1. Enhanced database schema
2. Basic bulk import with new fields
3. Parent-student linking
4. Export functionality

### Phase 2 (Medium Priority)
1. Advanced validation
2. Error handling improvements
3. Performance optimizations
4. Background job processing

### Phase 3 (Low Priority)
1. Advanced reporting
2. Import history tracking
3. Advanced filtering options
4. API rate limiting

## Sample Implementation (Node.js/Express)

```javascript
// Example route handler for unified bulk import
app.post('/admin/bulk-import/unified', upload.single('file'), async (req, res) => {
  try {
    const results = await bulkImportService.processUnifiedCSV(req.file);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: { errors: error.details || [] }
    });
  }
});

// Example service method
async processUnifiedCSV(file) {
  const csvData = await parseCSV(file.buffer);
  const results = {
    imported: 0,
    errors: 0,
    details: {
      students_created: 0,
      parents_created: 0,
      relationships_linked: 0,
      departments_created: 0,
      errors: []
    }
  };

  for (let i = 0; i < csvData.length; i++) {
    try {
      const row = csvData[i];
      if (row.type === 'student') {
        await this.processStudentRow(row, results);
      } else if (row.type === 'parent') {
        await this.processParentRow(row, results);
      }
      results.imported++;
    } catch (error) {
      results.errors++;
      results.details.errors.push({
        row: i + 1,
        error: error.message,
        data: csvData[i]
      });
    }
  }

  return results;
}
```

This comprehensive backend implementation will support the enhanced bulk import/export functionality with proper student-parent linking and academic management.
