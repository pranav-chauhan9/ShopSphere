import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{ label: String, line1: String, city: String, state: String, postalCode: String, country: String }]
}, { timestamps: true });

userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.passwordHash); };
export default mongoose.model('User', userSchema);
