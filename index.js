const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Isku xidhka Database-ka
mongoose.connect("mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority")
.then(() => console.log("✅ NBS System Online"))
.catch(err => console.log("❌ DB Error:", err));

// Schema-ga Ardayga (Dhammaan Xogta)
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true },
    password: { type: String, default: "123456" },
    fullName: String,
    motherName: String,
    parentPhone1: String,
    parentPhone2: String,
    class: String,
    section: String,
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    attendance: [{ date: String, status: String }],
    exam: {
        subjects: [
            { name: { type: String, default: "Math" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "English" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Arabic" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Islamic" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Physics" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Chemistry" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Biology" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "History" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Geography" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Somali" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "ICT" }, score: { type: Number, default: 0 } },
            { name: { type: String, default: "Business" }, score: { type: Number, default: 0 } }
        ],
        average: { type: Number, default: 0 }
    }
});

const Student = mongoose.model('Student', StudentSchema);

// Login Logic
app.post('/api/login', async (req, res) => {
    const { role, id, pass } = req.body;
    if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') {
        return res.json({ success: true, role: 'admin' });
    }
    const s = await Student.findOne({ nbsCode: id, password: pass });
    if (s) res.json({ success: true, role: 'student', data: s });
    else res.status(401).json({ success: false });
});

// Admin Save/Update (Wax kasta ayuu beddeli karaa)
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...data } = req.body;
        const s = await Student.findOneAndUpdate({ nbsCode }, { $set: data }, { upsert: true, new: true });
        res.json({ success: true, data: s });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Soo qaadista liiska ardayda
app.get('/api/students/:c/:s', async (req, res) => {
    const list = await Student.find({ class: req.params.c, section: req.params.s });
    res.json(list);
});

// Hal arday macluumaadkiisa
app.get('/api/student/:id', async (req, res) => {
    const s = await Student.findOne({ nbsCode: req.params.id });
    res.json(s);
});

// Tirtirista ardayga
app.delete('/api/admin/delete/:id', async (req, res) => {
    await Student.findOneAndDelete({ nbsCode: req.params.id });
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));