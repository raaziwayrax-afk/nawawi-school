const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ NBS Database Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// Student Schema - Dhammaystiran
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "123456" },
    fullName: { type: String, required: true },
    class: String,
    section: String,
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    attendance: [{ date: String, status: String }], 
    exam: { 
        subjects: { type: Array, default: [] }, 
        average: { type: Number, default: 0 } 
    }
});

const Student = mongoose.model('Student', StudentSchema);

// Admin Login
app.post('/api/login', async (req, res) => {
    try {
        const { role, id, pass } = req.body;
        if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') return res.json({ success: true, role: 'admin' });
        const s = await Student.findOne({ nbsCode: id, password: pass }).lean();
        if (s) res.json({ success: true, role: 'student', data: s });
        else res.status(401).json({ success: false });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Save Data (Attendance, Exams, Fees)
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, attendance, exam, fees, ...rest } = req.body;
        let update = { $set: rest };

        if (attendance) {
            // Ku dar attendance cusub liiska (Push)
            update.$push = { attendance: attendance[0] };
        }
        if (exam) update.$set.exam = exam;
        if (fees) update.$set.fees = fees;

        const result = await Student.findOneAndUpdate({ nbsCode }, update, { upsert: true, new: true });
        res.json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Get List by Class & Section
app.get('/api/students/:c/:s', async (req, res) => {
    const list = await Student.find({ class: req.params.c, section: req.params.s }).sort({fullName: 1}).lean();
    res.json(list);
});

// Single Student Data
app.get('/api/student/:id', async (req, res) => {
    const s = await Student.findOne({ nbsCode: req.params.id }).lean();
    res.json(s);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server active on ${PORT}`));