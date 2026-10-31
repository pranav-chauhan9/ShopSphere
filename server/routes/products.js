import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const { q, category, sort, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q) filter.$text = { $search: q };
    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
    const safeLimit = Math.min(48, Math.max(1, Number(limit) || 12));
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || { featured: -1, createdAt: -1 }).skip((Math.max(1, Number(page)) - 1) * safeLimit).limit(safeLimit),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
  } catch (e) { next(e); }
});
router.get('/categories', async (_req, res, next) => { try { res.json(await Product.distinct('category')); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { const p = await Product.findById(req.params.id); if (!p) return res.status(404).json({ message: 'Product not found.' }); res.json(p); } catch (e) { next(e); } });
router.post('/', protect, adminOnly, async (req, res, next) => { try { const p = await Product.create(req.body); res.status(201).json(p); } catch (e) { next(e); } });
router.put('/:id', protect, adminOnly, async (req, res, next) => { try { const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!p) return res.status(404).json({ message: 'Product not found.' }); res.json(p); } catch (e) { next(e); } });
router.delete('/:id', protect, adminOnly, async (req, res, next) => { try { const p = await Product.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ message: 'Product not found.' }); res.json({ message: 'Product deleted.' }); } catch (e) { next(e); } });
export default router;
