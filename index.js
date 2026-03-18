const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ISKU-XIRKA DATABASE-KA
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ DB Connected")).catch(err => console.log(err));

// SCHEMA-KA ARDAYGA
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true }, // NBS/100/2026
    password: { type: String, default: "1234" }, //
    fullName: { type: String, required: true },
    class: { type: String, required: true }, // 9, 10, 11, 12
    section: { type: String, required: true }, // A, B
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    attendance: [{ date: String, status: String }],
    exams: {
        exam1: [{ subject: String, score: Number }],
        exam2: [{ subject: String, score: Number }],
        exam3: [{ subject: String, score: Number }],
        exam4: [{ subject: String, score: Number }]
    }
});

const Student = mongoose.model('Student', StudentSchema);

// --- API-YADA ---

// 1. LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password, role } = req.body;
    if (role === 'admin') {
        if (username === 'admin' && password === 'admin123') return res.json({ success: true, role: 'admin' }); //
    } else {
        const student = await Student.findOne({ nbsCode: username, password: password }); //
        if (student) return res.json({ success: true, role: 'student', data: student });
    }
    res.json({ success: false, message: "Xogtu waa khaldan tahay!" });
});

// 2. SAVE (Halkan waxaa lagu saxay ciladii keydinta)
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...data } = req.body;
        // Upsert waxay hubisaa in xogta la cusubaysiiyo haddii ardaygu jiro, haddii kalena la abuuro
        await Student.findOneAndUpdate({ nbsCode }, data, { upsert: true, new: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 3. FETCH (Halkan waxaa lagu saxay ciladii soo saarista ardayda)
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        // Waxaan soo saaraynaa dhamaan ardayda fasalkaas iyo section-kaas
        const list = await Student.find({ class: req.params.c, section: req.params.s }).sort({ fullName: 1 });
        res.json(list);
    } catch (err) { res.json([]); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Running on Port ${PORT}`));