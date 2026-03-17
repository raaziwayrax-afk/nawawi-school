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
mongoose.connect(uri).then(() => console.log("✅ NBS Connected")).catch(err => console.error(err));

// --- Schema Sax ah (Xal u ah ciladda sawirka) ---
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true },
    password: { type: String, default: "123456" },
    fullName: String,
    class: { type: String, enum: ['9', '10', '11', '12'] },
    section: { type: String, enum: ['A', 'B', 'C', 'D'] },
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
        total: Number, average: Number, grade: String
    }
});

const Student = mongoose.model('Student', StudentSchema);

// Admin & Student Logic
app.post('/api/login', async (req, res) => {
    const { role, id, pass } = req.body;
    if (role === 'admin' && id === 'nawawi_admin' && pass === '7209379') return res.json({ success: true, role: 'admin' });
    const s = await Student.findOne({ nbsCode: id, password: pass });
    if (s) res.json({ success: true, role: 'student', data: s });
    else res.status(401).send("Xog khaldan");
});

app.post('/api/students', async (req, res) => {
    let d = req.body;
    if (d.exam && d.exam.subjects) {
        let total = d.exam.subjects.reduce((a, b) => a + Number(b.score || 0), 0);
        d.exam.total = total;
        d.exam.average = (total / 12).toFixed(2);
        d.exam.grade = d.exam.average >= 50 ? 'Pass' : 'Fail';
    }
    const s = await Student.findOneAndUpdate({ nbsCode: d.nbsCode }, d, { upsert: true, new: true });
    res.json(s);
});

app.get('/api/students/:c/:s', async (req, res) => {
    res.json(await Student.find({ class: req.params.c, section: req.params.s }));
});

app.listen(process.env.PORT || 3000);