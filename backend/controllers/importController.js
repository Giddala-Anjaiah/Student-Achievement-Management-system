const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { sendAchievementApprovedEmail } = require('../utils/emailService');

// Helper to parse Excel file
function parseExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error('First sheet is empty or corrupted');
    }
    
    const results = xlsx.utils.sheet_to_json(worksheet, { 
      defval: '',
      header: 1,
      raw: true,
      dateNF: 'yyyy-mm-dd'
    });
    
    // Convert array format to object format
    if (results.length > 0) {
      const headers = results[0];
      const dataRows = results.slice(1);
      
      return dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[header] = row[index] || '';
          }
        });
        return obj;
      });
    }
    
    return [];
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

// Import achievements from CSV or Excel file
const importAchievementsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let results = [];
    let errors = [];
    let successCount = 0;

    if (ext === '.csv') {
      // Read CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (ext === '.xls' || ext === '.xlsx') {
      // Read Excel file
      try {
        results = parseExcelFile(req.file.path);
        console.log('Excel file parsed successfully');
      } catch (excelError) {
        console.error('Excel parsing error:', excelError);
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: 'Error parsing Excel file. Please check the file format and try again.',
          error: excelError.message 
        });
      }
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Unsupported file type. Please upload a CSV or Excel file.' });
    }

    console.log(`File type: ${ext}, Total rows: ${results.length}`);
    if (results.length > 0) {
      console.log('Sample row:', results[0]);
    }

    // Process each row (same as before)
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      try {
        // Validate required fields
        if (!row.title || !row.description || !row.category || !row.studentEmail) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Find student by email
        let student = await User.findOne({ 
          email: row.studentEmail.trim(),
          role: 'student'
        });

        // If student doesn't exist, create them automatically
        if (!student) {
          try {
            // Generate student name from email if not provided
            const emailPrefix = row.studentEmail.split('@')[0];
            const studentName = row.studentName || `Student ${emailPrefix}`;
            // Generate student ID from email
            const studentId = emailPrefix.toUpperCase();
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('password123', saltRounds);
            // Create new student
            student = new User({
              name: studentName,
              email: row.studentEmail.trim(),
              password: hashedPassword,
              role: 'student',
              studentId: studentId,
              department: row.department || 'Computer Science'
            });
            await student.save();
            console.log(`Auto-created student: ${studentName} (${row.studentEmail})`);
          } catch (createError) {
            errors.push(`Row ${i + 1}: Failed to create student ${row.studentEmail} - ${createError.message}`);
            continue;
          }
        }

                // Create achievement with enhanced date parsing
        let parsedDate = new Date(); // Default to current date
        
        if (row.date) {
          console.log(`Processing date for row ${i + 1}:`, row.date, `Type: ${typeof row.date}`);
          
          // Handle actual Date objects from Excel
          if (row.date instanceof Date) {
            parsedDate = row.date;
            console.log(`Excel Date object: ${parsedDate.toISOString()}`);
          }
          // Handle Excel date numbers (serial numbers)
          else if (typeof row.date === 'number' && row.date > 1000) {
            parsedDate = new Date((row.date - 25569) * 86400 * 1000);
            console.log(`Excel serial number converted: ${parsedDate.toISOString()}`);
          }
          // Handle string dates
          else if (typeof row.date === 'string') {
            const dateStr = row.date.trim();
            console.log(`Processing string date: "${dateStr}"`);
            
            // Handle DD-MM-YYYY format (like "15-01-2024")
            if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              console.log(`Date parts: [${parts.join(', ')}]`);
              if (parts.length === 3) {
                if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                  // DD-MM-YYYY format
                  const day = parseInt(parts[0]);
                  const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                  const year = parseInt(parts[2]);
                  console.log(`Parsing DD-MM-YYYY: day=${day}, month=${month}, year=${year}`);
                  parsedDate = new Date(year, month, day);
                  console.log(`DD-MM-YYYY parsed: ${parsedDate.toISOString()}`);
                  console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
                } else if (parts[0].length === 4) {
                  // YYYY-MM-DD format
                  const year = parseInt(parts[0]);
                  const month = parseInt(parts[1]) - 1;
                  const day = parseInt(parts[2]);
                  console.log(`Parsing YYYY-MM-DD: year=${year}, month=${month}, day=${day}`);
                  parsedDate = new Date(year, month, day);
                  console.log(`YYYY-MM-DD parsed: ${parsedDate.toISOString()}`);
                  console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
                }
              }
            }
            
            // Try standard parsing as fallback
            if (isNaN(parsedDate.getTime())) {
              console.log(`Trying standard date parsing for: "${dateStr}"`);
              parsedDate = new Date(dateStr);
              console.log(`Standard parsing result: ${parsedDate.toISOString()}`);
              console.log(`Is valid: ${!isNaN(parsedDate.getTime())}`);
            }
          }
          
          // Final fallback to current date
          if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date: "${row.date}", using current date`);
            parsedDate = new Date();
          }
        }
        
        // Ensure we have a valid date before creating achievement
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Date still invalid after parsing, using current date`);
          parsedDate = new Date();
        }
        
        console.log(`Final parsed date for row ${i + 1}: ${parsedDate.toISOString()}`);
        
        let achievement = null;
        
        try {
          // Double-check date validity before creating achievement
          if (isNaN(parsedDate.getTime())) {
            console.error(`Date is still invalid: ${parsedDate}`);
            parsedDate = new Date();
          }
          
          console.log(`Creating achievement with date: ${parsedDate.toISOString()}`);
          console.log(`Date type: ${typeof parsedDate}`);
          console.log(`Date instanceof Date: ${parsedDate instanceof Date}`);
          console.log(`Date value: ${parsedDate}`);
          
          // Create achievement object
          const achievementData = {
            title: row.title.trim(),
            description: row.description.trim(),
            category: row.category.trim().toLowerCase(),
            level: row.level ? row.level.trim().toLowerCase() : 'university',
            date: parsedDate,
            organization: row.organization ? row.organization.trim() : '',
            studentId: student._id,
            studentName: student.name,
            status: row.status ? row.status.trim().toLowerCase() : 'pending',
            points: row.points ? parseInt(row.points) : 0
          };
          
          console.log(`Achievement data prepared:`, JSON.stringify(achievementData, null, 2));
          
          achievement = new Achievement(achievementData);

          console.log(`Achievement object created, attempting to save...`);
          console.log(`Achievement date before save: ${achievement.date}`);
          console.log(`Achievement date type: ${typeof achievement.date}`);
          
          await achievement.save();
          console.log(`Achievement saved successfully for row ${i + 1}`);
          successCount++;
        } catch (error) {
          console.error(`Error creating achievement for row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error.message}`);
          continue;
        }

        // If status is approved, send email notification
        if (achievement && achievement.status === 'approved') {
          try {
            await sendAchievementApprovedEmail(
              student.email,
              student.name,
              achievement.title
            );
          } catch (emailError) {
            console.error('Email notification failed:', emailError);
          }
        }
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import completed',
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10), // Limit error display
      totalRows: results.length,
      processedRows: results.length
    });
  } catch (error) {
    console.error('Import error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Server error during import.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Import achievements manually (bulk)
const importAchievementsManually = async (req, res) => {
  try {
    const { achievements } = req.body;

    if (!achievements || !Array.isArray(achievements)) {
      return res.status(400).json({ message: 'Invalid achievements data.' });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < achievements.length; i++) {
      const achievementData = achievements[i];
      
      try {
        // Validate required fields
        if (!achievementData.title || !achievementData.description || !achievementData.category || !achievementData.studentEmail) {
          errors.push(`Achievement ${i + 1}: Missing required fields`);
          continue;
        }

        // Find student by email
        let student = await User.findOne({ 
          email: achievementData.studentEmail.trim(),
          role: 'student'
        });

        // If student doesn't exist, create them automatically
        if (!student) {
          try {
            // Generate student name from email if not provided
            const emailPrefix = achievementData.studentEmail.split('@')[0];
            const studentName = achievementData.studentName || `Student ${emailPrefix}`;
            
            // Generate student ID from email
            const studentId = emailPrefix.toUpperCase();
            
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('password123', saltRounds);
            
            // Create new student
            student = new User({
              name: studentName,
              email: achievementData.studentEmail.trim(),
              password: hashedPassword,
              role: 'student',
              studentId: studentId,
              department: achievementData.department || 'Computer Science'
            });
            
            await student.save();
            console.log(`Auto-created student: ${studentName} (${achievementData.studentEmail})`);
          } catch (createError) {
            errors.push(`Achievement ${i + 1}: Failed to create student ${achievementData.studentEmail} - ${createError.message}`);
            continue;
          }
        }

        // Create achievement
        const achievement = new Achievement({
          title: achievementData.title.trim(),
          description: achievementData.description.trim(),
          category: achievementData.category.trim().toLowerCase(),
          level: achievementData.level ? achievementData.level.trim().toLowerCase() : 'university',
          date: (() => {
            if (!achievementData.date) {
              return new Date();
            }
            
            const dateStr = achievementData.date.toString().trim();
            
            // Handle Excel date numbers (Excel stores dates as numbers)
            if (!isNaN(dateStr) && dateStr > 1000) {
              // Convert Excel date number to JavaScript date
              const excelDate = parseFloat(dateStr);
              const date = new Date((excelDate - 25569) * 86400 * 1000);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
            
            // Handle DD-MM-YYYY format
            if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                // Check if it's DD-MM-YYYY or YYYY-MM-DD
                if (parts[0].length === 4) {
                  // YYYY-MM-DD format
                  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  if (!isNaN(date.getTime())) {
                    return date;
                  }
                } else {
                  // DD-MM-YYYY format
                  const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                  if (!isNaN(date.getTime())) {
                    return date;
                  }
                }
              }
            }
            
            // Handle MM/DD/YYYY format
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  // YYYY/MM/DD format
                  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  if (!isNaN(date.getTime())) {
                    return date;
                  }
                } else {
                  // MM/DD/YYYY format
                  const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                  if (!isNaN(date.getTime())) {
                    return date;
                  }
                }
              }
            }
            
            // Try standard date parsing
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date;
            }
            
            // Try converting DD-MM-YYYY to YYYY-MM-DD format
            if (dateStr.includes('-') && dateStr.split('-').length === 3) {
              const parts = dateStr.split('-');
              if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                // Convert DD-MM-YYYY to YYYY-MM-DD
                const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                const date = new Date(convertedDate);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
            
            // If all else fails, return current date
            console.warn(`Invalid date format: "${dateStr}", using current date`);
            return new Date();
          })(),
          organization: achievementData.organization ? achievementData.organization.trim() : '',
          studentId: student._id,
          studentName: student.name,
          status: achievementData.status ? achievementData.status.trim().toLowerCase() : 'pending',
          points: achievementData.points ? parseInt(achievementData.points) : 0
        });

        await achievement.save();
        successCount++;

        // If status is approved, send email notification
        if (achievement.status === 'approved') {
          try {
            await sendAchievementApprovedEmail(
              student.email,
              student.name,
              achievement.title
            );
          } catch (emailError) {
            console.error('Email notification failed:', emailError);
          }
        }

      } catch (rowError) {
        errors.push(`Achievement ${i + 1}: ${rowError.message}`);
      }
    }

    res.json({
      message: 'Manual import completed',
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10) // Limit error display
    });

  } catch (error) {
    console.error('Manual import error:', error);
    res.status(500).json({ message: 'Server error during manual import.' });
  }
};

// Get import template (CSV format)
const getImportTemplate = async (req, res) => {
  try {
    const template = [
      'title,description,category,level,date,organization,studentEmail,studentName,department,status,points',
      'Sample Achievement,This is a sample achievement description,academic,university,2024-01-15,Sample University,student@example.com,John Doe,Computer Science,pending,10'
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=achievements_template.csv');
    res.send(template);

  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({ message: 'Error generating template.' });
  }
};

// Get import statistics
const getImportStats = async (req, res) => {
  try {
    const totalAchievements = await Achievement.countDocuments();
    const pendingAchievements = await Achievement.countDocuments({ status: 'pending' });
    const approvedAchievements = await Achievement.countDocuments({ status: 'approved' });
    const rejectedAchievements = await Achievement.countDocuments({ status: 'rejected' });

    const categoryStats = await Achievement.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentImports = await Achievement.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name email');

    res.json({
      totalAchievements,
      pendingAchievements,
      approvedAchievements,
      rejectedAchievements,
      categoryStats,
      recentImports
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching import statistics.' });
  }
};

module.exports = {
  importAchievementsFromCSV,
  importAchievementsManually,
  getImportTemplate,
  getImportStats
}; 