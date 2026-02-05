
import express from 'express';
import cors from 'cors';
import { connectDB } from './connectDB';
import { User } from './models/User';
import { Gym } from './models/Gym';
import { Member } from './models/Member';
import { MemberPaymentRecord } from './models/MemberPayment';
import { Lead } from './models/Lead';
import { loginSchema, gymSchemaValidation, memberSchemaValidation, leadSchemaValidation } from './validators/schemas';
import { UserRole, SubscriptionStatus, PaymentStatus, GymStatus } from './types';
import multer from 'multer';
import { uploadToR2, uploadBufferToR2 } from './utils/storage';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Gym Stack API is running!');
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

// Gyms (Super Admin)
app.get('/api/gyms', async (req, res) => {
  try {
    await connectDB();
    const gyms = await Gym.find().sort({ createdAt: -1 });
    res.json(gyms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gyms/:id', async (req, res) => {
  try {
    await connectDB();
    const gym = await Gym.findOne({ id: req.params.id });
    if (!gym) return res.status(404).json({ error: 'Gym not found' });
    res.json(gym);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gyms', async (req, res) => {
  try {
    const { password, ...gymData } = req.body;
    const validatedGym = gymSchemaValidation.parse(gymData);
    await connectDB();

    const id = Date.now();
    const newGym = await Gym.create({ ...validatedGym, id, paymentHistory: [] });

    await User.create({
      phone: validatedGym.ownerPhone,
      name: validatedGym.ownerName,
      password: password || 'gym123',
      role: UserRole.GYM_OWNER,
      gymId: id
    });

    res.status(201).json(newGym);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/gyms/:id', upload.single('logo'), async (req, res) => {
  try {
    const { password, ...gymData } = req.body;

    if (req.file) {
      gymData.logo = await uploadToR2(req.file);
    }

    await connectDB();
    const gym = await Gym.findOneAndUpdate({ id: req.params.id }, gymData, { new: true });

    if (password || gymData.ownerPhone || gymData.ownerName) {
      await User.findOneAndUpdate(
        { gymId: req.params.id, role: UserRole.GYM_OWNER },
        {
          ...(password ? { password } : {}),
          ...(gymData.ownerPhone ? { phone: gymData.ownerPhone } : {}),
          ...(gymData.ownerName ? { name: gymData.ownerName } : {})
        }
      );
    }
    res.json(gym);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/gyms/:id', async (req, res) => {
  try {
    await connectDB();
    await Gym.deleteOne({ id: req.params.id });
    await User.deleteMany({ gymId: req.params.id });
    await Member.deleteMany({ gymId: req.params.id });
    await MemberPaymentRecord.deleteMany({ gymId: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Members
app.get('/api/members', async (req, res) => {
  try {
    const { gymId } = req.query;
    await connectDB();
    const filter = (gymId && gymId !== 'undefined') ? { gymId } : {};
    const members = await Member.find(filter).sort({ createdAt: -1 });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    await connectDB();
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', upload.single('photo'), async (req, res) => {
  try {
    const memberData = { ...req.body };
    if (req.file) {
      memberData.photo = await uploadToR2(req.file);
    }

    // Manual coercion for numeric fields if they come as strings (from FormData)
    // Note: Zod schema with z.coerce.number() handles this, but creating a clean object helps

    const validatedMember = memberSchemaValidation.parse(memberData);
    await connectDB();
    const member = await Member.create({ ...validatedMember, gymId: req.body.gymId });

    if (validatedMember.paidAmount > 0) {
      await MemberPaymentRecord.create({
        memberId: member._id,
        memberName: member.name,
        gymId: member.gymId,
        amount: member.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: 'Initial Registration Payment',
        paymentMode: validatedMember.paymentMode
      });
    }
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/members/:id', upload.single('photo'), async (req, res) => {
  try {
    const memberData = { ...req.body };
    if (req.file) {
      memberData.photo = await uploadToR2(req.file);
    }

    await connectDB();
    const oldMember = await Member.findById(req.params.id);
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, memberData, { new: true });

    if (oldMember && memberData.paidAmount > oldMember.paidAmount) {
      await MemberPaymentRecord.create({
        memberId: updatedMember._id,
        memberName: updatedMember.name,
        gymId: updatedMember.gymId,
        amount: memberData.paidAmount - oldMember.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: memberData.paidAmount >= updatedMember.feesAmount ? 'Balance Cleared' : 'Partial Payment',
        paymentMode: memberData.paymentMode // Assuming paymentMode is passed in the update body
      });
    }
    res.json(updatedMember);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/members/:id/renew', async (req, res) => {
  try {
    const { renewalData } = req.body;
    await connectDB();
    const member = await Member.findByIdAndUpdate(req.params.id, renewalData, { new: true });

    if (renewalData.paidAmount > 0) {
      await MemberPaymentRecord.create({
        memberId: member._id,
        memberName: member.name,
        gymId: member.gymId,
        amount: renewalData.paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: `Renewal (${renewalData.planDurationDays} days)`,
        paymentMode: renewalData.paymentMode // Assuming paymentMode is in renewalData
      });
    }
    res.json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await connectDB();
    await Member.findByIdAndDelete(req.params.id);
    await MemberPaymentRecord.deleteMany({ memberId: req.params.id });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments & Staff
app.get('/api/payments', async (req, res) => {
  try {
    const { gymId } = req.query;
    await connectDB();
    const payments = await MemberPaymentRecord.find({ gymId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const { gymId } = req.query;
    await connectDB();
    const staff = await User.find({ gymId }).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    await connectDB();
    const staff = await User.create({ ...req.body, role: UserRole.TRAINER });
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
      gyms: await Gym.find({}),
      members: await Member.find({}),
      payments: await MemberPaymentRecord.find({}),
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
