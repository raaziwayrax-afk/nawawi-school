const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const uri = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";
mongoose.connect(uri)
    .then(() => console.log("✅ NBS Database Connected Successfully"))
    .catch(err => console.error("❌ Database Connection Error:", err));

// Student Schema - Dhamaan Fields-ka waan ku daray
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "123456" },
    fullName: { type: String, required: true },
    motherName: String,
    parentPhone1: String,
    parentPhone2: String,
    class: String,
    section: String,
    fees: { 
        paid: { type: Number, default: 0 }, 
        total: { type: Number, default: 1200 } 
    },
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

// Admin & Student Login
app.post('/api/login', async (req, res) => {
    const { role, id, pass } = req.body;
    if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') {
        return res.json({ success: true, role: 'admin' });
    }
    const s = await Student.findOne({ nbsCode: id, password: pass });
    if (s) {
        res.json({ success: true, role: 'student', data: s });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Admin Save/Update (Dhamaan functions halkan bay soo maraan)
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...updateData } = req.body;
        // Upsert: true waxay ka dhigaysaa hadii uu jiro inuu Update gareeyo, hadii kalena uu Abuuro
        const s = await Student.findOneAndUpdate(
            { nbsCode: nbsCode }, 
            { $set: updateData }, 
            { upsert: true, new: true }
        );
        res.json({ success: true, data: s });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Load Class List
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const list = await Student.find({ class: req.params.c, section: req.params.s });
        res.json(list);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Single Student Detail
app.get('/api/student/:id', async (req, res) => {
    const s = await Student.findOne({ nbsCode: req.params.id });
    res.json(s);
});

// Delete Student
app.delete('/api/admin/delete/:id', async (req, res) => {
    await Student.findOneAndDelete({ nbsCode: req.params.id });
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NBS Server running on port ${PORT}`));