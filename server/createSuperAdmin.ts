
import { connectDB } from './connectDB';
import { User } from './models/User';
import { UserRole } from './types';

const createSuperAdmin = async () => {
    try {
        await connectDB();
        const phone = '9999999999';
        const password = 'admin';
        const name = 'Super Admin';
        const role = UserRole.SUPER_ADMIN;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            console.log('User already exists, updating password and role...');
            existingUser.password = password;
            existingUser.role = role;
            existingUser.name = name;
            await existingUser.save();
            console.log('Super Admin updated successfully!');
        } else {
            await User.create({
                phone,
                password,
                name,
                role
            });
            console.log('Super Admin created successfully!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
