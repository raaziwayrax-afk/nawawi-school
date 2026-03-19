const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ISKU-XIRKA MONGO DB ---
const mongoURI = "mongodb+srv://raazicadar_db_user:inicadar7209379.@cluster0.z93llyc.mongodb.net/NawawiDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Xiriirka NawawiDB waa guul!"))
    .catch(err => console.error("❌ Cilad baa ka jirta xiriirka:", err.message));

// Student Schema
const studentSchema = new mongoose.Schema({
    nbsCode: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    class: String,
    section: String,
    fees: {
        paid: { type: Number, default: 0 },
        total: { type: Number, default: 1200 }
    }
});

const Student = mongoose.model('Student', studentSchema);

// --- API ROUTES ---

// 1. Keydi Arday
app.post('/api/admin/save', async (req, res) => {
    try {
        await Student.findOneAndUpdate(
            { nbsCode: req.body.nbsCode },
            req.body,
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Xogta waa la keydiyey!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error: " + err.message });
    }
});

// 2. Soo saar liiska ardayda
app.get('/api/students/:class/:section', async (req, res) => {
    try {
        const list = await Student.find({ 
            class: req.params.class, 
            section: req.params.section 
        });
        res.json(list);
    } catch (err) {
        res.status(500).json([]);
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server wuxuu ka shaqaynayaa: http://localhost:${PORT}`));