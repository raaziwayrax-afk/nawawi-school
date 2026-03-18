const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Tani waa lagama maarmaan si xogtu u gudubto
app.use(express.static(path.join(__dirname, 'public')));

// ISKU-XIRKA DATABASE-KA
const mongoURI = "mongodb+srv://raaziwayrax_db_user:raasi1234@cluster0.cvcctca.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Isku-xirkiisu waa sax!"))
    .catch(err => console.error("❌ MongoDB Cilad ayaa jirta:", err));

// SCHEMA-KA ARDAYGA
const StudentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    password: { type: String, default: "1234" },
    fullName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    fees: { paid: { type: Number, default: 0 }, total: { type: Number, default: 1200 } },
    attendance: { type: Array, default: [] },
    exams: { type: Object, default: {} }
});

const Student = mongoose.model('Student', StudentSchema);

// API-GA KEYDINTA (SAVE)
app.post('/api/admin/save', async (req, res) => {
    console.log("Xogta soo gaartay Server-ka:", req.body); // Tani waxay terminal-ka ku tusaysaa xogta
    try {
        const { nbsCode } = req.body;
        // findOneAndUpdate oo leh upsert:true waxay xallisaa in xogtu had iyo jeer gasho
        const result = await Student.findOneAndUpdate(
            { nbsCode: nbsCode },
            req.body,
            { upsert: true, new: true, runValidators: true }
        );
        console.log("Xogtii si sax ah ayaa loo keydiyey:", result.nbsCode);
        res.json({ success: true, message: "Waa la keydiyey!" });
    } catch (err) {
        console.error("❌ Cilad keydinta ah:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API-GA SOO SAARISTA (FETCH)
app.get('/api/students/:c/:s', async (req, res) => {
    try {
        const students = await Student.find({ class: req.params.c, section: req.params.s }).sort({ fullName: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json([]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server-ku wuxuu ka shaqaynayaa Port ${PORT}`));