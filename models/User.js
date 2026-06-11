import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // The hashing tool we installed earlier

// 1. THE SCHEMA (The Blueprint)
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true }, // 'unique' prevents duplicate accounts
        password: { type: String, required: true },
    },
    { 
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt' dates
    }
);

// 2. THE PRE-SAVE HOOK (The Password Hasher)
userSchema.pre('save', async function (next) {
    // If the user is just updating their name, don't re-hash the password
    if (!this.isModified('password')) {
        next();
    }

    // Generate a secure "salt" (random characters added to make hashing stronger)
    const salt = await bcrypt.genSalt(10);
    // Hash the actual password with the salt
    this.password = await bcrypt.hash(this.password, salt);
});

// 3. THE VERIFICATION METHOD (For Logging In)
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Compares the plain-text password they just typed with the hashed one in the database
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;