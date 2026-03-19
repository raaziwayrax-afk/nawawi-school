const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ISKU-XIRKA MONGO DB (Habeysan) ---
// Waxaan isticmaaleynaa MONGO_URI-ga Render ama password-kaagii cusub
const mongoURI = process.env.MONGO_URI || "mongodb+srv://raazicadar_db_user:inicadar1234.@cluster0.z93llyc.mongodb.net/NawawiDB?retryWrites=true&w=majority&appName=Cluster0";

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

// 3. Root Route (Si loo hubiyo inuu Live yahay)
app.get('/', (req, res) => {
    res.send("Nawawi School System Server is Live!");
});

// PORT-ka Render uu u baahan yahay
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server wuxuu ka shaqaynayaa Port: ${PORT}`));