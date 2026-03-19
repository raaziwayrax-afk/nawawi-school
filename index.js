const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 12-ka Maaddo ee Dugsiga
const subjectsList = [
    "Tarbiya", "Carabi", "Soomaali", "English", "Math", 
    "Physics", "Chemistry", "Biology", "Geography", 
    "History", "ICT", "Business"
];

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    motherName: { type: String, required: true },
    examNumber: { type: String, unique: true }, // Roll Number (Password-ka ardayga)
    grade: { type: String, enum: ['9', '10', '11', '12'] },
    section: { type: String, enum: ['A', 'B', 'C'] },
    parentPhone1: String,
    monthlyFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    // Dhibcaha 12-ka maaddo
    examScores: [{
        subject: { type: String, enum: subjectsList },
        score: { type: Number, default: 0 },
        term: String 
    }],
    attendance: [{ date: String, status: String }]
});

const Student = mongoose.model('Student', studentSchema);

// API: Diiwaangelinta
app.post('/api/register', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ success: true, message: 'Ardayga waa la xereeyay!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: Mid-mid u beddel xogta ardayga (Edit One-by-One)
app.put('/api/student/:id', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: 'Xogta waa la cusboonaysiiyay!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// API: Ardayga keligiis (Student Login/View)
app.get('/api/student/me/:roll', async (req, res) => {
    try {
        const student = await Student.findOne({ examNumber: req.params.roll });
        res.json(student);
    } catch (error) {
        res.status(500).json(null);
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