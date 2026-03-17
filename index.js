const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Isku xidhka Database-ka (Hubi in xogtaadu sax tahay)
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("✅ NBS Database Connected: Ready for All Classes"))
    .catch(err => console.error("❌ Database Error:", err));

// Student Schema - Wax kasta oo ardayga khuseeya
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "123456" },
    fullName: { type: String, required: true },
    motherName: String,
    parentPhone1: String,
    parentPhone2: String,
    class: { type: String, required: true }, // 9, 10, 11, 12
    section: { type: String, default: "A" }, // A, B, C
    fees: { 
        paid: { type: Number, default: 0 }, 
        total: { type: Number, default: 1200 } 
    },
    attendance: [{ 
        date: { type: String }, 
        status: { type: String } 
    }],
    exam: {
        subjects: [
            { name: String, score: { type: Number, default: 0 } }
        ],
        average: { type: Number, default: 0 }
    }
});

const Student = mongoose.model('Student', StudentSchema);

// Admin & Student Login Logic
app.post('/api/login', async (req, res) => {
    try {
        const { role, id, pass } = req.body;
        if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') {
            return res.json({ success: true, role: 'admin' });
        }
        const s = await Student.findOne({ nbsCode: id, password: pass });
        if (s) {
            res.json({ success: true, role: 'student', data: s });
        } else {
            res.status(401).json({ success: false, message: "Invalid ID or Password" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Admin Power: Save, Update, Edit Subjects, Attendance & Fees
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...updateData } = req.body;
        
        // Logic-gan wuxuu hubinayaa haddii ardaygu jiro inuu Edit gareeyo, hadii kalena uu Abuuro (Upsert)
        const updatedStudent = await Student.findOneAndUpdate(
            { nbsCode: nbsCode }, 
            { $set: updateData }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        res.json({ success: true, data: updatedStudent });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Soo qaadista liiska fasallada (9, 10, 11, 12)
app.get('/api/students/:class/:section', async (req, res) => {
    try {
        const query = { class: req.params.class, section: req.params.section };
        const students = await Student.find(query).sort({ fullName: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Xogta hal arday oo kaliya (Edit-ka loo isticmaalo)
app.get('/api/student/:id', async (req, res) => {
    try {
        const s = await Student.findOne({ nbsCode: req.params.id });
        res.json(s);
    } catch (err) {
        res.status(404).json(null);
    }
});

// PORT-ka Server-ka
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NBS System running on http://localhost:${PORT}`));