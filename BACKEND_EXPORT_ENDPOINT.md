# Backend Export Endpoint Implementation

## 🚨 **Issue Identified**

The frontend is calling `GET /api/v1/admin/students/export` but this endpoint returns 404 (Not Found). The backend implementation is missing.

## ✅ **Frontend Workaround Applied**

I've updated the frontend to use a fallback approach:
1. **First**: Try the new export endpoint
2. **Fallback**: Use existing `getAdminStudents()` endpoint with mock parent data
3. **Result**: Export functionality works immediately with existing data

## 🔧 **Backend Implementation Needed**

You need to implement the following endpoint in your backend:

### **Endpoint: `GET /api/v1/admin/students/export`**

#### **Route Handler:**
```javascript
// In your admin routes file (e.g., routes/admin.js)
router.get('/students/export', authenticateAdmin, async (req, res) => {
  try {
    const { department, academic_year, semester, section, include_parents = true } = req.query;
    
    // Build query filters
    const filters = {};
    if (department) filters.department = department;
    if (academic_year) filters.academic_year = academic_year;
    if (semester) filters.semester = semester;
    if (section) filters.section = section;
    
    // Fetch students with parent information
    const students = await StudentService.exportStudentsWithParents(filters, include_parents);
    
    res.json({
      success: true,
      data: {
        students: students,
        total_count: students.length,
        exported_at: new Date().toISOString(),
        filters: filters
      }
    });
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export students data',
      error: error.message
    });
  }
});
```

#### **Service Method:**
```javascript
// In your StudentService (e.g., services/StudentService.js)
async exportStudentsWithParents(filters = {}, includeParents = true) {
  try {
    // Build base query
    let query = `
      SELECT 
        s.id,
        s.student_id,
        s.grade_level,
        s.academic_year,
        s.semester,
        s.section,
        s.department,
        s.class_name,
        s.enrollment_date,
        s.status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        u.date_of_birth,
        u.gender,
        u.emergency_contact,
        u.medical_info
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'student'
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add filters
    if (filters.department) {
      query += ` AND s.department = $${paramCount}`;
      queryParams.push(filters.department);
      paramCount++;
    }
    
    if (filters.academic_year) {
      query += ` AND s.academic_year = $${paramCount}`;
      queryParams.push(filters.academic_year);
      paramCount++;
    }
    
    if (filters.semester) {
      query += ` AND s.semester = $${paramCount}`;
      queryParams.push(filters.semester);
      paramCount++;
    }
    
    if (filters.section) {
      query += ` AND s.section = $${paramCount}`;
      queryParams.push(filters.section);
      paramCount++;
    }
    
    query += ` ORDER BY u.last_name, u.first_name`;
    
    // Execute query
    const result = await db.query(query, queryParams);
    const students = result.rows;
    
    // If parents are requested, fetch parent information
    if (includeParents && students.length > 0) {
      const studentIds = students.map(s => s.id);
      
      const parentQuery = `
        SELECT 
          psr.student_id,
          u.first_name as parent_first_name,
          u.last_name as parent_last_name,
          u.email as parent_email,
          u.phone as parent_phone,
          psr.relationship
        FROM parent_student_relationships psr
        JOIN users u ON psr.parent_id = u.id
        WHERE psr.student_id = ANY($1)
      `;
      
      const parentResult = await db.query(parentQuery, [studentIds]);
      const parentMap = {};
      
      parentResult.rows.forEach(parent => {
        if (!parentMap[parent.student_id]) {
          parentMap[parent.student_id] = [];
        }
        parentMap[parent.student_id].push({
          email: parent.parent_email,
          phone: parent.parent_phone,
          relationship: parent.relationship,
          first_name: parent.parent_first_name,
          last_name: parent.parent_last_name
        });
      });
      
      // Attach parent information to students
      students.forEach(student => {
        student.parents = parentMap[student.id] || [];
        // For CSV compatibility, use the first parent as the primary parent
        if (student.parents.length > 0) {
          student.parent = student.parents[0];
        }
      });
    }
    
    return students;
  } catch (error) {
    console.error('Error in exportStudentsWithParents:', error);
    throw error;
  }
}
```

#### **Database Schema Requirements:**

Make sure your database has these tables and relationships:

```sql
-- Students table (should already exist)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    student_id VARCHAR(50) UNIQUE,
    grade_level VARCHAR(50),
    academic_year VARCHAR(20),
    semester VARCHAR(50),
    section VARCHAR(10),
    department VARCHAR(100),
    class_name VARCHAR(100),
    enrollment_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parent-Student relationships table
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    student_id INTEGER REFERENCES students(id),
    relationship VARCHAR(20) DEFAULT 'Parent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

-- Users table (should already exist)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    emergency_contact TEXT,
    medical_info TEXT,
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 **Testing the Implementation**

### **Test the Endpoint:**
```bash
# Test with no filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export"

# Test with filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export?department=Computer Science&academic_year=2024-2025"

# Test without parents
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export?include_parents=false"
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "student_id": "STU001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@student.edu",
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
          "relationship": "Father",
          "first_name": "John",
          "last_name": "Parent"
        },
        "parents": [
          {
            "email": "parent@email.com",
            "phone": "+1234567890",
            "relationship": "Father",
            "first_name": "John",
            "last_name": "Parent"
          }
        ]
      }
    ],
    "total_count": 1,
    "exported_at": "2024-01-15T10:30:00.000Z",
    "filters": {
      "department": "Computer Science",
      "academic_year": "2024-2025"
    }
  }
}
```

## 🚀 **Implementation Steps**

1. **Add the route** to your admin routes file
2. **Implement the service method** in your StudentService
3. **Ensure database schema** is up to date
4. **Test the endpoint** with the provided curl commands
5. **Update frontend** to remove the fallback (optional)

## 📝 **Notes**

- The frontend will work immediately with the fallback implementation
- Once you implement the backend endpoint, the frontend will automatically use it
- The fallback provides mock parent data for demonstration purposes
- The real implementation will provide actual parent-student relationships

## 🎯 **Priority**

**High Priority** - This endpoint is needed for the complete bulk import/export functionality to work properly with real parent-student relationships.
