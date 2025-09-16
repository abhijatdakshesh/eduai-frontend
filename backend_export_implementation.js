// ========================================
// BACKEND EXPORT ENDPOINT IMPLEMENTATION
// ========================================
// Add this code to your backend project

// 1. ADMIN ROUTES - Add to your admin routes file (e.g., routes/admin.js)
// ========================================

const express = require('express');
const router = express.Router();
const StudentService = require('../services/StudentService');
const { authenticateAdmin } = require('../middleware/auth');

// Export students endpoint
router.get('/students/export', authenticateAdmin, async (req, res) => {
  try {
    console.log('Export students request received:', req.query);
    
    const { 
      department, 
      academic_year, 
      semester, 
      section, 
      include_parents = 'true' 
    } = req.query;
    
    // Build query filters
    const filters = {};
    if (department) filters.department = department;
    if (academic_year) filters.academic_year = academic_year;
    if (semester) filters.semester = semester;
    if (section) filters.section = section;
    
    const includeParents = include_parents === 'true';
    
    // Fetch students with parent information
    const students = await StudentService.exportStudentsWithParents(filters, includeParents);
    
    console.log(`Export completed: ${students.length} students found`);
    
    res.json({
      success: true,
      data: {
        students: students,
        total_count: students.length,
        exported_at: new Date().toISOString(),
        filters: filters,
        include_parents: includeParents
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

module.exports = router;

// 2. STUDENT SERVICE - Add to your StudentService (e.g., services/StudentService.js)
// ========================================

const db = require('../config/database'); // Adjust path to your database config

class StudentService {
  // ... existing methods ...

  /**
   * Export students with their parent information
   * @param {Object} filters - Filter criteria
   * @param {boolean} includeParents - Whether to include parent data
   * @returns {Array} Array of students with parent information
   */
  static async exportStudentsWithParents(filters = {}, includeParents = true) {
    try {
      console.log('Exporting students with filters:', filters, 'includeParents:', includeParents);
      
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
          s.created_at,
          s.updated_at,
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
        WHERE u.role = 'student' AND u.status = 'active'
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
      
      console.log('Executing query:', query);
      console.log('Query params:', queryParams);
      
      // Execute query
      const result = await db.query(query, queryParams);
      const students = result.rows;
      
      console.log(`Found ${students.length} students`);
      
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
          WHERE psr.student_id = ANY($1) AND u.status = 'active'
          ORDER BY psr.relationship, u.last_name, u.first_name
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
          } else {
            // If no parent found, create empty parent object for CSV compatibility
            student.parent = {
              email: '',
              phone: '',
              relationship: '',
              first_name: '',
              last_name: ''
            };
          }
        });
        
        console.log(`Attached parent data to ${students.length} students`);
      } else if (includeParents) {
        // If no students found but parents were requested, add empty parent objects
        students.forEach(student => {
          student.parent = {
            email: '',
            phone: '',
            relationship: '',
            first_name: '',
            last_name: ''
          };
          student.parents = [];
        });
      }
      
      return students;
    } catch (error) {
      console.error('Error in exportStudentsWithParents:', error);
      throw error;
    }
  }
}

module.exports = StudentService;

// 3. DATABASE MIGRATION - Run this SQL to ensure your database has the required tables
// ========================================

/*
-- Run this SQL in your database to ensure all required tables exist

-- Students table (enhanced with new fields)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(20) DEFAULT 'Parent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON parent_student_relationships(student_id);

-- Add new columns to existing students table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'department') THEN
        ALTER TABLE students ADD COLUMN department VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'academic_year') THEN
        ALTER TABLE students ADD COLUMN academic_year VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'semester') THEN
        ALTER TABLE students ADD COLUMN academic_year VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'section') THEN
        ALTER TABLE students ADD COLUMN section VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'class_name') THEN
        ALTER TABLE students ADD COLUMN class_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'enrollment_date') THEN
        ALTER TABLE students ADD COLUMN enrollment_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'status') THEN
        ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;
*/

// 4. TESTING SCRIPT - Use this to test the endpoint
// ========================================

/*
// Test the endpoint with curl commands:

// Test with no filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export"

// Test with filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export?department=Computer Science&academic_year=2024-2025"

// Test without parents
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export?include_parents=false"

// Test with all filters
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/v1/admin/students/export?department=Computer Science&academic_year=2024-2025&semester=Fall 2024&section=A&include_parents=true"
*/

// 5. INTEGRATION INSTRUCTIONS
// ========================================

/*
To integrate this into your backend:

1. Add the route to your admin routes file (routes/admin.js or similar)
2. Add the StudentService method to your StudentService class
3. Run the database migration SQL
4. Restart your backend server
5. Test the endpoint with the provided curl commands

The frontend will automatically start using the real endpoint instead of the fallback.
*/
