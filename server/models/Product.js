import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: 'text' },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  brand: { type: String, default: 'ShopSphere' },
  image: { type: String, default: '' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  stock: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 90 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
export default mongoose.model('Product', productSchema);
