const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Isku xidhka MongoDB
const uri = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";
mongoose.connect(uri).then(() => console.log("✅ Database Linked")).catch(err => console.log(err));

// --- Database Schemas ---

const StudentSchema = new mongoose.Schema({
    studentCode: { type: String, unique: true, required: true },
    fullName: String,
    class: { type: Number, min: 0, max: 12 },
    phone: String,
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    exam: {
        subjects: [{ name: String, score: Number }],
        total: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
        grade: { type: String, default: 'F' }
    }
});

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: String, // Format: YYYY-MM-DD
    status: String, // Present / Absent
    class: Number
});

const Student = mongoose.model('Student', StudentSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);

// --- API Routes ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'nawawi_admin' && password === '7209379') {
        res.json({ success: true, role: 'admin' });
    } else {
        res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
    }
});

// Student Login
app.post('/api/student/login', async (req, res) => {
    const student = await Student.findOne({ studentCode: req.body.code });
    if (student) res.json({ success: true, role: 'student', data: student });
    else res.status(404).json({ message: "Student Code not found" });
});

// Admin: Add/Update Student & Auto-calculate Grades
app.post('/api/students', async (req, res) => {
    const data = req.body;
    if (data.exam && data.exam.subjects.length > 0) {
        const total = data.exam.subjects.reduce((a, b) => a + Number(b.score), 0);
        const avg = total / data.exam.subjects.length;
        data.exam.total = total;
        data.exam.average = avg.toFixed(2);
        data.exam.grade = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : avg >= 50 ? 'D' : 'F';
    }
    const s = await Student.findOneAndUpdate({ studentCode: data.studentCode }, data, { upsert: true, new: true });
    res.json(s);
});

app.get('/api/students/:class', async (req, res) => {
    const students = await Student.find({ class: req.params.class });
    res.json(students);
});

app.delete('/api/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Attendance Management
app.post('/api/attendance', async (req, res) => {
    const { list, date } = req.body;
    for (let item of list) {
        await Attendance.findOneAndUpdate(
            { studentId: item.studentId, date: date },
            { status: item.status, class: item.class },
            { upsert: true }
        );
    }
    res.json({ success: true });
});

app.get('/api/attendance/:studentId', async (req, res) => {
    const history = await Attendance.find({ studentId: req.params.studentId });
    res.json(history);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));