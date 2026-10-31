import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { connectDB } from '../config/db.js';
const products = [
  { name: 'Studio Wireless Headphones', description: 'Immersive sound, soft over-ear cushions and all-day comfort.', price: 5999, category: 'Electronics', brand: 'Auralab', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', rating: 4.8, stock: 24, discount: 15, featured: true },
  { name: 'Everyday Minimal Sneakers', description: 'Versatile low-top sneakers designed for everyday movement.', price: 3499, category: 'Fashion', brand: 'Northline', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900', rating: 4.6, stock: 31, discount: 10, featured: true },
  { name: 'Smart Desk Lamp', description: 'A warm, adjustable desk light for focused work and reading.', price: 2199, category: 'Home', brand: 'Luma', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900', rating: 4.5, stock: 18, discount: 0, featured: true },
  { name: 'Classic Everyday Backpack', description: 'A clean, durable backpack with a padded laptop compartment.', price: 2799, category: 'Accessories', brand: 'Fieldwork', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900', rating: 4.7, stock: 15, discount: 12 },
  { name: 'Ceramic Pour-over Set', description: 'A simple ceramic coffee set for slow weekend mornings.', price: 1599, category: 'Home', brand: 'Forma', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900', rating: 4.4, stock: 40, discount: 0 },
  { name: 'Polarized Everyday Sunglasses', description: 'Lightweight frames with polarized lenses and a timeless shape.', price: 1899, category: 'Accessories', brand: 'Solace', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900', rating: 4.3, stock: 22, discount: 20 },
  { name: 'Mechanical Keyboard', description: 'Tactile mechanical switches in a compact, desk-friendly layout.', price: 4299, category: 'Electronics', brand: 'Keycraft', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900', rating: 4.8, stock: 12, discount: 8 },
  { name: 'Cotton Everyday Shirt', description: 'A breathable cotton shirt with a relaxed, versatile fit.', price: 1299, category: 'Fashion', brand: 'Northline', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900', rating: 4.2, stock: 50, discount: 0 }
];
try { await connectDB(); await Product.deleteMany({}); await Product.insertMany(products); console.log('Demo products added.'); } catch (e) { console.error(e); process.exitCode = 1; } finally { await mongoose.disconnect(); }
