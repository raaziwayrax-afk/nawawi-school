const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Isku xidhka MongoDB (NawawiDB)
const uri = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";
mongoose.connect(uri).then(() => console.log("✅ Database NBS Connected")).catch(err => console.log("❌ DB Error:", err));

// --- Database Schemas ---

const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true }, // Format: NBS/1000/2026
    fullName: String,
    motherName: String,
    class: { type: String, enum: ['9', '10', '11', '12'] },
    section: { type: String, enum: ['A', 'B', 'C', 'D'] },
    parent1: String,
    parent2: String,
    fees: { 
        paid: { type: Number, default: 0 }, 
        total: { type: Number, default: 1000 } 
    },
    attendance: {
        totalDays: { type: Number, default: 100 },
        presentDays: { type: Number, default: 100 }
    },
    exam: {
        january: [{ subject: String, score: Number }],
        midterm: [{ subject: String, score: Number }],
        february: [{ subject: String, score: Number }],
        final: [{ subject: String, score: Number }],
        summary: { total: Number, average: Number, grade: String }
    }
});

const Student = mongoose.model('Student', StudentSchema);

// --- API Routes ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'nawawi_admin' && password === '7209379') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Username ama Password waa khalad" });
    }
});

// Student Login (Using NBS Code)
app.post('/api/student/login', async (req, res) => {
    const student = await Student.findOne({ 
        $or: [{ nbsCode: req.body.loginId }, { parent1: req.body.loginId }] 
    });
    if (student) res.json({ success: true, data: student });
    else res.status(404).json({ message: "Ardayga lama helin. Hubi NBS Code ama Tel" });
});

// Admin: Manage Students
app.post('/api/students', async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { nbsCode: req.body.nbsCode },
            req.body,
            { upsert: true, new: true }
        );
        res.json({ success: true, data: student });
    } catch (e) { res.status(500).json(e); }
});

app.get('/api/students/:class/:section', async (req, res) => {
    const students = await Student.find({ 
        class: req.params.class, 
        section: req.params.section 
    });
    res.json(students);
});

app.delete('/api/students/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Update Attendance (Boqolleyda Automatic)
app.post('/api/attendance/update', async (req, res) => {
    const { id, type } = req.body; // type: 'absent'
    const s = await Student.findById(id);
    if (type === 'absent') s.attendance.presentDays -= 1;
    await s.save();
    res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NBS System Live on Port ${PORT}`));