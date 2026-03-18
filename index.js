const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. ISKU-XIRKA DATABASE-KA (MongoDB)
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected - Ready to work!"))
    .catch(err => console.error("❌ Database Connection Error:", err));

// 2. SCHEMA-KA ARDAYGA (Qaabka xogta u kaydsamayso)
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    class: { type: String, required: true },   // Tusaale: "9aad"
    section: { type: String, required: true }, // Tusaale: "A"
    fees: { 
        paid: { type: Number, default: 0 }, 
        total: { type: Number, default: 1200 } 
    },
    attendance: [{ 
        date: { type: String }, 
        status: { type: String } 
    }],
    exam: { 
        subjects: [{ name: String, score: Number }], 
        average: { type: Number, default: 0 } 
    }
});

const Student = mongoose.model('Student', StudentSchema);

// 3. API-YADA (Dhammman qaybaha nidaamka)

// --- A. KEYDINTA ARDAYGA (Save/Update) ---
app.post('/api/admin/save', async (req, res) => {
    try {
        const { nbsCode, ...data } = req.body;
        // Upsert waxay hubinaysaa in xogta la cusubaysiiyo haddii ardaygu jiro
        const student = await Student.findOneAndUpdate(
            { nbsCode }, 
            { $set: data }, 
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Ardayga waa la keydiyey!" });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ success: false, message: "Cillad ayaa ka dhacday keydinta." });
    }
});

// --- B. SOO SAARISTA ARDAYDA (Fetch by Class/Section) ---
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const { c, s } = req.params;
        // Waxaan raadinaynaa xog isku mid ah (9aad iyo A)
        const list = await Student.find({ class: c, section: s }).sort({ fullName: 1 });
        res.json(list);
    } catch (err) {
        res.status(500).json([]);
    }
});

// --- C. KEYDINTA ATTENDANCE-KA ---
app.post('/api/admin/attendance', async (req, res) => {
    try {
        const { nbsCode, date, status } = req.body;
        await Student.updateOne(
            { nbsCode },
            { $push: { attendance: { date, status } } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. KICINTA SERVER-KA
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});