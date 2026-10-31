import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.post('/', protect, async (req, res, next) => {
  const session = await Product.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const cartItems = req.body.items;
      const address = req.body.shippingAddress;
      if (!Array.isArray(cartItems) || !cartItems.length || !address?.line1 || !address?.city || !address?.postalCode) throw Object.assign(new Error('Add items and complete your shipping address.'), { status: 400 });
      const items = []; let subtotal = 0;
      for (const line of cartItems) {
        const qty = Math.floor(Number(line.quantity));
        if (!line.productId || qty < 1 || qty > 20) throw Object.assign(new Error('Invalid cart quantity.'), { status: 400 });
        const product = await Product.findOneAndUpdate({ _id: line.productId, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true, session });
        if (!product) throw Object.assign(new Error('A product is unavailable or has insufficient stock. Refresh your cart.'), { status: 409 });
        const price = product.price * (1 - product.discount / 100);
        subtotal += price * qty;
        items.push({ product: product._id, name: product.name, image: product.image, price, quantity: qty });
      }
      const shipping = subtotal >= 1500 ? 0 : 99;
      [created] = await Order.create([{ user: req.user._id, items, shippingAddress: address, subtotal, shipping, total: subtotal + shipping, paymentMethod: 'simulated', paymentStatus: 'simulated' }], { session });
    });
    res.status(201).json({ order: created, message: 'Demo order placed. No real payment was collected.' });
  } catch (e) { next(e); } finally { await session.endSession(); }
});
router.get('/mine', protect, async (req, res, next) => { try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.get('/admin/all', protect, adminOnly, async (_req, res, next) => { try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.patch('/admin/:id/status', protect, adminOnly, async (req, res, next) => { try { const allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' }); const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!order) return res.status(404).json({ message: 'Order not found.' }); res.json(order); } catch (e) { next(e); } });
export default router;
