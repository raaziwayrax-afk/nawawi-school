const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DATABASE CONNECTION
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB is Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));

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
    const { role, id, pass } = req.body;
    if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') return res.json({ success: true, role: 'admin' });
    const s = await Student.findOne({ nbsCode: id, password: pass });
    if (s) res.json({ success: true, role: 'student', data: s });
    else res.status(401).json({ success: false });
});

// GET STUDENTS - Tan ayaa keenaysa in ardaydu soo muuqdaan
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const list = await Student.find({ class: req.params.c, section: req.params.s }).sort({fullName: 1});
        res.json(list);
    } catch (err) { res.status(500).json([]); }
});

// SAVE DATA - Tan ayaa xallinaysa in "Options-ka" ay wax keydiyaan
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, attendance, exam, fees, ...rest } = req.body;
        let update = { $set: rest };
        if (attendance) update.$push = { attendance: attendance[0] };
        if (exam) update.$set.exam = exam;
        if (fees) update.$set.fees = fees;
        await Student.findOneAndUpdate({ nbsCode }, update, { upsert: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));