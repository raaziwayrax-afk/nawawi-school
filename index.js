const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. ISKU-XIRKA DATABASE-KA (Kani waa wadnaha nidaamka)
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ DATABASE-KU WAA LIVE (MONGODB CONNECTED)"))
    .catch(err => console.error("❌ CILAD BAA KA JIRTA DATABASE-KA:", err));

// 2. QAAB-DHISMEEDKA ARDAYGA (Student Schema)
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "123456" },
    fullName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    attendance: [{ date: String, status: String }],
    exam: { 
        subjects: [{ name: String, score: Number }], 
        average: { type: Number, default: 0 } 
    }
});

const Student = mongoose.model('Student', StudentSchema);

// 3. ADMIN LOGIN (Nawawi Admin)
app.post('/api/login', async (req, res) => {
    const { role, id, pass } = req.body;
    if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') {
        return res.json({ success: true, role: 'admin' });
    }
    const s = await Student.findOne({ nbsCode: id, password: pass }).lean();
    if (s) res.json({ success: true, role: 'student', data: s });
    else res.status(401).json({ success: false });
});

// 4. SOO SAARISTA ARDAYDA (List Fetching)
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const list = await Student.find({ class: req.params.c, section: req.params.s }).sort({fullName: 1});
        res.json(list); // Halkan ayaa soo saaraya ardayda aad keydisay
    } catch (err) {
        res.status(500).json([]);
    }
});

// 5. KEYDINTA XOGTA (Save All: Student, Attendance, Exam)
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, attendance, exam, fees, ...rest } = req.body;
        let update = { $set: rest };

        if (attendance) update.$push = { attendance: attendance[0] };
        if (exam) update.$set.exam = exam;
        if (fees) update.$set.fees = fees;

        const result = await Student.findOneAndUpdate({ nbsCode }, update, { upsert: true, new: true });
        res.json({ success: true, data: result });
    } catch (err)