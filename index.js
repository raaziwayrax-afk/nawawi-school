const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Tan waa muhiim si bogga loo arko

const app = express();
app.use(express.json());
app.use(cors());

// 1. ISKU XIDHKA DATABASE-KA
// FIIRO GAAR AH: localhost halkan kama shaqaynayo. 
// Waxaad u baahan tahay inaad MongoDB Atlas isticmaasho mustaqbalka.
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nawawi_db';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Database-kii waa diyaar!"))
  .catch(err => console.log("❌ Database Error:", err));

// 2. QAABKA XOGTA (Student Schema)
const studentSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  pass: { type: String, default: "123" },
  magaca: String,
  meel: String,
  aaboTel: String,
  hooyoTel: String,
  fasalka: String,
  fee: { type: String, default: "Ma bixin" },
  exams: { type: Object, default: {} },
  att: { type: Object, default: {} }
});

const Student = mongoose.model('Student', studentSchema);

// 3. U ADEEGIDDA FAYLASHA FRONT-END (Waxa bogga cad xallinaya)
// Tan ayaa u sheegaysa Render halka uu koodhka HTML-ka u yaallo
app.use(express.static(path.join(__dirname, 'frontend-dugsi')));

// 4. API-YADA (Endpoints)
app.post('/api/login', async (req, res) => {
  const { id, pass } = req.body;
  if (id === "admin" && pass === "admin1234") return res.json({ role: 'admin', magaca: "Maamulaha Nawawi" });
  try {
    const s = await Student.findOne({ id, pass });
    if (s) return res.json({ ...s._doc, role: 'student' });
    res.status(401).send("Khalad!");
  } catch (e) { res.status(500).send("Error"); }
});

app.get('/api/data', async (req, res) => {
  const data = await Student.find();
  res.json(data);
});

app.post('/api/update-student', async (req, res) => {
  await Student.findOneAndUpdate({ id: req.body.id }, req.body, { upsert: true });
  res.json({ ok: true });
});

app.delete('/api/student/:id', async (req, res) => {
  await Student.findOneAndDelete({ id: req.params.id });
  res.json({ ok: true });
});

// Bog kasta oo kale oo la furo, u dir index.html-ka u dambeeya
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-dugsi', 'index.html'));
});

// 5. PORT-KA SAXDAN EE RENDER
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`🚀 Server-ku wuxuu ku shaqaynayaa Port ${PORT}`));