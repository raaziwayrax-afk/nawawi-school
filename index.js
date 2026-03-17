const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Isku xidhka Database-ka NBS
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ NBS Database is Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Ardayga Schema - Dhammaan xogta waa tan
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "123456" },
    fullName: { type: String, required: true },
    motherName: String,
    parentPhone1: String,
    class: String, 
    section: String,
    fees: { 
        paid: { type: Number, default: 0 }, 
        total: { type: Number, default: 1200 } 
    },
    attendance: [{ date: String, status: String }],
    exam: {
        subjects: { type: Array, default: [] },
        average: { type: Number, default: 0 }
    }
});

const Student = mongoose.model('Student', StudentSchema);

// Admin & Student Login
app.post('/api/login', async (req, res) => {
    try {
        const { role, id, pass } = req.body;
        if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') {
            return res.json({ success: true, role: 'admin' });
        }
        const s = await Student.findOne({ nbsCode: id, password: pass });
        if (s) res.json({ success: true, role: 'student', data: s });
        else res.status(401).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Admin Save Power - Wax kasta halkan ayaa lagu keydiyaa
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...updateData } = req.body;
        const s = await Student.findOneAndUpdate(
            { nbsCode: nbsCode }, 
            { $set: updateData }, 
            { upsert: true, new: true }
        );
        res.json({ success: true, data: s });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Soo qaadista liiska fasallada (9-12)
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const list = await Student.find({ class: req.params.c, section: req.params.s });
        res.json(list);
    } catch (err) {
        res.json([]);
    }
});

// Xogta hal arday
app.get('/api/student/:id', async (req, res) => {
    try {
        const s = await Student.findOne({ nbsCode: req.params.id });
        res.json(s);
    } catch (err) {
        res.json(null);
    }
});

// PORT-ka Render (Status 1 Fix)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));