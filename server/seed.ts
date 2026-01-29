
import { User } from './models/User';
import { UserRole } from './types';
import { connectDB } from './connectDB';
import 'dotenv/config';

const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const users = [
            {
                phone: '9999999999',
                password: 'admin',
                role: UserRole.SUPER_ADMIN,
            },
        ];

        for (const user of users) {
            const exists = await User.findOne({ phone: user.phone });
            if (!exists) {
                await User.create(user);
                console.log(`Created user: ${user.phone}`);
            } else {
                console.log(`User already exists: ${user.phone}`);
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
