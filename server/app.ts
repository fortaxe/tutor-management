
import express from 'express';
import cors from 'cors';
import { connectDB } from './connectDB';
import { User } from './models/User';
import { Tutor } from './models/Tutor';
import { Student } from './models/Student';
import { StudentPaymentRecord } from './models/StudentPayment';
import { Lead } from './models/Lead';
import { loginSchema, tutorSchemaValidation, studentSchemaValidation, leadSchemaValidation } from './validators/schemas';
import { UserRole, SubscriptionStatus, PaymentStatus, TutorStatus } from './types';
import multer from 'multer';
import { uploadToR2, uploadBufferToR2 } from './utils/storage';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Student Management API is running!');
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    await connectDB();
    const user = await User.findOne({ phone: validatedData.phone, password: validatedData.password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tutors (Super Admin)
app.get('/api/tutors', async (req, res) => {
  try {
    await connectDB();
    const tutors = await Tutor.find().sort({ createdAt: -1 });
    res.json(tutors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tutors/:id', async (req, res) => {
  try {
    await connectDB();
    const tutor = await Tutor.findOne({ id: req.params.id });
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' });
    res.json(tutor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tutors', async (req, res) => {
  try {
    const { password, ...tutorData } = req.body;
    const validatedTutor = tutorSchemaValidation.parse(tutorData);
    await connectDB();

    const id = Date.now();
    const newTutor = await Tutor.create({ ...validatedTutor, id, paymentHistory: [] });

    await User.create({
      phone: validatedTutor.ownerPhone,
      name: validatedTutor.ownerName,
      password: password || 'tutor123',
      role: UserRole.TUTOR,
      tutorId: id
    });

    res.status(201).json(newTutor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/tutors/:id', upload.single('logo'), async (req, res) => {
  try {
    const { password, ...tutorData } = req.body;

    if (req.file) {
      tutorData.logo = await uploadToR2(req.file);
    }

    await connectDB();
    const tutor = await Tutor.findOneAndUpdate({ id: req.params.id }, tutorData, { new: true });

    if (password || tutorData.ownerPhone || tutorData.ownerName) {
      await User.findOneAndUpdate(
        { tutorId: req.params.id, role: UserRole.TUTOR },
        {
          ...(password ? { password } : {}),
          ...(tutorData.ownerPhone ? { phone: tutorData.ownerPhone } : {}),
          ...(tutorData.ownerName ? { name: tutorData.ownerName } : {})
        }
      );
    }
    res.json(tutor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tutors/:id', async (req, res) => {
  try {
    await connectDB();
    await Tutor.deleteOne({ id: req.params.id });
    await User.deleteMany({ tutorId: req.params.id });
    await Student.deleteMany({ tutorId: req.params.id });
    await StudentPaymentRecord.deleteMany({ tutorId: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Students
app.get('/api/students', async (req, res) => {
  try {
    const { tutorId } = req.query;
    await connectDB();
    const filter = (tutorId && tutorId !== 'undefined') ? { tutorId } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    await connectDB();
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', upload.single('photo'), async (req, res) => {
  try {
    const studentData = { ...req.body };
    if (req.file) {
      studentData.photo = await uploadToR2(req.file);
    }

    // Manual coercion (Zod handles it but safe to double check if needed, I'll rely on Zod)
    const validatedStudent = studentSchemaValidation.parse(studentData);
    await connectDB();
    const student = await Student.create({ ...validatedStudent, tutorId: req.body.tutorId });

    if (validatedStudent.paidAmount > 0) {
      await StudentPaymentRecord.create({
        studentId: student._id,
        studentName: student.name,
        tutorId: student.tutorId,
        amount: student.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: 'Initial Registration Payment',
        paymentMode: validatedStudent.paymentMode
      });
    }
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/students/:id', upload.single('photo'), async (req, res) => {
  try {
    const studentData = { ...req.body };
    if (req.file) {
      studentData.photo = await uploadToR2(req.file);
    }

    await connectDB();
    const oldStudent = await Student.findById(req.params.id);
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, studentData, { new: true });

    if (oldStudent && studentData.paidAmount > oldStudent.paidAmount) {
      await StudentPaymentRecord.create({
        studentId: updatedStudent._id,
        studentName: updatedStudent.name,
        tutorId: updatedStudent.tutorId,
        amount: studentData.paidAmount - oldStudent.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: studentData.paidAmount >= updatedStudent.feesAmount ? 'Balance Cleared' : 'Partial Payment',
        paymentMode: studentData.paymentMode
      });
    }
    res.json(updatedStudent);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/students/:id/renew', async (req, res) => {
  try {
    const { renewalData } = req.body;
    await connectDB();
    const student = await Student.findByIdAndUpdate(req.params.id, renewalData, { new: true });

    if (renewalData.paidAmount > 0) {
      await StudentPaymentRecord.create({
        studentId: student._id,
        studentName: student.name,
        tutorId: student.tutorId,
        amount: renewalData.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: `Renewal (${renewalData.planDurationMonths} months)`,
        paymentMode: renewalData.paymentMode
      });
    }
    res.json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await connectDB();
    await Student.findByIdAndDelete(req.params.id);
    await StudentPaymentRecord.deleteMany({ studentId: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments & Staff
app.get('/api/payments', async (req, res) => {
  try {
    const { tutorId } = req.query;
    await connectDB();
    const payments = await StudentPaymentRecord.find({ tutorId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const { tutorId } = req.query;
    await connectDB();
    const staff = await User.find({ tutorId }).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    await connectDB();
    const staff = await User.create({ ...req.body, role: UserRole.ASSISTANT });
    res.status(201).json(staff);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/staff/:id', async (req, res) => {
  try {
    await connectDB();
    const staff = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await connectDB();
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leads (Public & Super Admin)
app.get('/api/leads', async (req, res) => {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const validatedLead = leadSchemaValidation.parse(req.body);
    await connectDB();
    const lead = await Lead.create(validatedLead);
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  try {
    await connectDB();
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    await connectDB();
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Backup Cron
app.get('/api/cron/backup', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectDB();
    const data = {
      timestamp: new Date().toISOString(),
      users: await User.find({}),
      tutors: await Tutor.find({}),
      students: await Student.find({}),
      payments: await StudentPaymentRecord.find({}),
      leads: await Lead.find({}),
    };

    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    const fileName = `backups/backup-${new Date().toISOString().split('T')[0]}.json`;

    await uploadBufferToR2(buffer, fileName, 'application/json');

    res.json({ success: true, fileName });
  } catch (error: any) {
    console.error('Backup failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
