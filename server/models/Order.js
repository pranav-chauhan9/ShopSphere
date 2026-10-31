import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, price: Number, quantity: Number }],
  shippingAddress: { name: String, line1: String, city: String, state: String, postalCode: String, country: String },
  subtotal: Number, shipping: Number, total: Number,
  paymentMethod: { type: String, default: 'simulated' },
  paymentStatus: { type: String, enum: ['simulated', 'paid', 'failed'], default: 'simulated' },
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
