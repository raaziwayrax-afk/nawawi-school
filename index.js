const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Schema-ka oo la ballaariyey (Full School Management)
const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    motherName: { type: String, required: true },
    examNumber: { type: String, unique: true },
    grade: { type: String, enum: ['9', '10', '11', '12'] },
    section: { type: String, enum: ['A', 'B', 'C'] },
    parentPhone1: String,
    // --- QAYBTA MAALIYADDA ---
    monthlyFee: { type: Number, default: 0 }, // Lacagta bishii
    paidAmount: { type: Number, default: 0 }, // Inta la bixiyey
    // --- QAYBTA IMTIXAANKA ---
    examScores: [{
        subject: String,
        score: Number,
        term: String // Tusaale: Semester 1
    }],
    attendance: [{
        date: String,
        status: String
    }]
});

const Student = mongoose.model('Student', studentSchema);

// API: Diiwaangelinta (Lagu daray Fee)
app.post('/api/register', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ success: true, message: 'Ardayga iyo xogta maaliyadda waa la kaydiyay!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: Cusboonaysiinta Lacagta (Fees)
app.post('/api/pay-fee', async (req, res) => {
    const { studentId, amount } = req.body;
    try {
        await Student.findByIdAndUpdate(studentId, { $inc: { paidAmount: amount } });
        res.json({ success: true, message: 'Lacagta waa laga guddoomay!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// API: Gelinta Dhibcaha (Exam Scores)
app.post('/api/add-score', async (req, res) => {
    const { studentId, subject, score, term } = req.body;
    try {
        await Student.findByIdAndUpdate(studentId, {
            $push: { examScores: { subject, score, term } }
        });
        res.json({ success: true, message: 'Dhibcaha waa la kaydiyay!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/filter', async (req, res) => {
    const { grade, section } = req.query;
    try {
        const students = await Student.find({ grade, section });
        res.json(students);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));