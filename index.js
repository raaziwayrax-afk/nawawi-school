const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Hubi in MONGO_URI uu ku jiro Render Settings
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // Waxay soo tuuraysaa error haddii DB la waayo 5 ilbiriqsi gudahood
})
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.error('Connection Error:', err));

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    examNumber: { type: String, unique: true, required: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    motherName: { type: String, default: 'Lama sheegin' },
    examScores: [{
        subject: String,
        score: { type: Number, default: 0 }
    }]
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

// API: Mid-mid u beddel dhibcaha (Edit)
app.put('/api/student/:id', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { examScores: req.body.examScores });
        res.json({ success: true, message: 'Dhibcaha waa la cusboonaysiiyay!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: Filter (Admin View)
app.get('/api/filter', async (req, res) => {
    try {
        const students = await Student.find({ grade: req.query.grade });
        res.json(students);
    } catch (error) {
        res.status(500).json([]);
    }
});

// API: Student Login/Me
app.get('/api/student/me/:roll', async (req, res) => {
    try {
        const student = await Student.findOne({ examNumber: req.params.roll });
        res.json(student);
    } catch (error) {
        res.status(500).json(null);
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));