
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, CreditCard, Heart, LayoutDashboard, LogOut, Menu, Minus, Package,
  Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles,
  Star, Truck, UserRound, X, Zap
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);

const categories = [
  {
    name: 'Electronics',
    sub: 'Smart picks for your setup',
    icon: '✳',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700'
  },
  {
    name: 'Fashion',
    sub: 'Everyday, elevated',
    icon: '◈',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700'
  },
  {
    name: 'Home',
    sub: 'Make room for good things',
    icon: '⌂',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700'
  },
  {
    name: 'Accessories',
    sub: 'The finishing touches',
    icon: '◇',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700'
  }
];

function App() {
  // Products are loaded from MongoDB, not demo data.
  const [products, setProducts] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopsphere_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('shopsphere_token') || ''
  );

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('home');
  const [selected, setSelected] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);

  const [adminForm, setAdminForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    brand: '',
    image: '',
    stock: '',
    discount: '0'
  });

  const [editingId, setEditingId] = useState(null);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Save cart.
  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cart));
  }, [cart]);

  // Save user.
  useEffect(() => {
    if (user) {
      localStorage.setItem('shopsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shopsphere_user');
    }
  }, [user]);

  // Save token.
  useEffect(() => {
    if (token) {
      localStorage.setItem('shopsphere_token', token);
    } else {
      localStorage.removeItem('shopsphere_token');
    }
  }, [token]);

  // Load actual MongoDB products and remove old demo IDs from cart.
  useEffect(() => {
    axios.get(`${API}/products`)
      .then(({ data }) => {
        const liveProducts = data.products || [];

        setProducts(liveProducts);

        const validIds = new Set(
          liveProducts.map(product => String(product._id))
        );

        setCart(currentCart =>
          currentCart.filter(item =>
            validIds.has(String(item._id))
          )
        );

        setApiOnline(true);
      })
      .catch(() => {
        setApiOnline(false);
        toast.error('Unable to load products from the server.');
      });
  }, []);

  // Load customer orders.
  useEffect(() => {
    if (user && token) {
      axios.get(`${API}/orders/mine`, {
        headers: authHeaders
      })
        .then(response => setOrders(response.data))
        .catch(() => {});
    }
  }, [user, token]);

  // Search and sorting.
  const filtered = useMemo(() => {
    let list = products.filter(product =>
      (category === 'All' || product.category === category) &&
      `${product.name} ${product.description} ${product.brand}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    }

    if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sort === 'newest') {
      list.reverse();
    }

    return list;
  }, [products, category, query, sort]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
  const total = subtotal + shipping;

  // Add product to cart.
  function addToCart(product, quantity = 1) {
    if (!/^[a-f\d]{24}$/i.test(String(product._id))) {
      toast.error('This product does not have a valid database ID.');
      return;
    }

    if ((product.stock ?? 1) <= 0) {
      toast.error('This item is currently out of stock.');
      return;
    }

    setCart(old => {
      const found = old.find(item => item._id === product._id);

      return found
        ? old.map(item =>
            item._id === product._id
              ? {
                  ...item,
                  quantity: Math.min(20, item.quantity + quantity)
                }
              : item
          )
        : [...old, { ...product, quantity }];
    });

    toast.success('Added to your bag');
  }

  function updateQty(id, delta) {
    setCart(old =>
      old.map(item =>
        item._id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(20, item.quantity + delta))
            }
          : item
      )
    );
  }

  function removeItem(id) {
    setCart(old => old.filter(item => item._id !== id));
    toast.success('Removed from bag');
  }

  // Login and registration.
  async function authenticate(e) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const { data } = await axios.post(
        `${API}/auth/${authMode === 'login' ? 'login' : 'register'}`,
        payload
      );

      setToken(data.token);
      setUser(data.user);
      setAuthOpen(false);

      toast.success(
        `Welcome${data.user.name ? `, ${data.user.name.split(' ')[0]}` : ''}!`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Could not connect to the account service. Start the backend and try again.'
      );
    }
  }

  function logout() {
    setUser(null);
    setToken('');
    setView('home');
    toast.success('You have signed out.');
  }

  // Corrected checkout function.
  async function placeOrder(e) {
    e.preventDefault();

    if (!user) {
      setCheckoutOpen(false);
      setAuthOpen(true);
      toast('Sign in to place your order.');
      return;
    }

    if (!cart.length) {
      toast.error('Your cart is empty.');
      return;
    }

    // Validate every MongoDB ObjectId before sending checkout request.
    const invalidItem = cart.find(
      item => !/^[a-f\d]{24}$/i.test(String(item._id))
    );

    if (invalidItem) {
      toast.error(
        'Your cart contains an invalid product. Remove it and add the product again.'
      );
      return;
    }

    const fd = new FormData(e.currentTarget);
    const shippingAddress = Object.fromEntries(fd.entries());

    try {
      const { data } = await axios.post(
        `${API}/orders`,
        {
          items: cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
          })),
          shippingAddress
        },
        {
          headers: authHeaders
        }
      );

      setOrders(old => [data.order, ...old]);
      setCart([]);
      setCheckoutOpen(false);
      setView('orders');

      toast.success('Your demo order has been placed!');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Checkout needs the backend and MongoDB to be running.'
      );
    }
  }

  // Admin functions.
  async function loadAdmin() {
    try {
      const [orderResponse, productResponse] = await Promise.all([
        axios.get(`${API}/orders/admin/all`, {
          headers: authHeaders
        }),
        axios.get(`${API}/products`)
      ]);

      setAdminOrders(orderResponse.data);
      setProducts(productResponse.data.products || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Admin access is unavailable.'
      );
    }
  }

  async function saveProduct(e) {
    e.preventDefault();

    const payload = {
      ...adminForm,
      price: Number(adminForm.price),
      stock: Number(adminForm.stock),
      discount: Number(adminForm.discount)
    };

    try {
      const config = { headers: authHeaders };

      if (editingId) {
        await axios.put(
          `${API}/products/${editingId}`,
          payload,
          config
        );
      } else {
        await axios.post(`${API}/products`, payload, config);
      }

      const { data } = await axios.get(`${API}/products`);
      setProducts(data.products || []);

      setAdminForm({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        brand: '',
        image: '',
        stock: '',
        discount: '0'
      });

      setEditingId(null);
      toast.success('Product saved');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Unable to save product. Check admin access.'
      );
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: authHeaders
      });

      setProducts(old => old.filter(product => product._id !== id));
      setCart(old => old.filter(item => item._id !== id));

      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await axios.patch(
        `${API}/orders/admin/${id}/status`,
        { status },
        { headers: authHeaders }
      );

      setAdminOrders(old =>
        old.map(order =>
          order._id === id ? { ...order, status } : order
        )
      );

      toast.success('Order updated');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not update order'
      );
    }
  }

  function goShop(cat = 'All') {
    setCategory(cat);
    setView('shop');
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        <span><Sparkles size={13} /> A little something for your everyday</span>
        <span className="announcement-right">
          Free shipping on orders over ₹1,500 <ArrowRight size={13} />
        </span>
      </div>

      <header className="site-header">
        <button
          className="icon-button mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>

        <button className="brand" onClick={() => setView('home')}>
          <span className="brand-mark">s.</span>
          <span>shop<span className="brand-light">sphere</span></span>
        </button>

        <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`}>
          <button
            className={view === 'home' ? 'active' : ''}
            onClick={() => {
              setView('home');
              setMobileMenu(false);
            }}
          >
            Home
          </button>
          <button
            className={view === 'shop' ? 'active' : ''}
            onClick={() => goShop()}
          >
            Shop all
          </button>
          <button onClick={() => goShop('Fashion')}>Fashion</button>
          <button onClick={() => goShop('Electronics')}>Tech & gadgets</button>
          <button onClick={() => goShop('Home')}>Home living</button>
        </nav>

        <div className="header-actions">
          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                if (e.target.value) setView('shop');
              }}
              placeholder="Search for anything..."
            />
            <kbd>⌘ K</kbd>
          </label>

          <button
            className="icon-button account-action"
            onClick={() => user ? setView('account') : setAuthOpen(true)}
            aria-label="Account"
          >
            <UserRound />
          </button>

          <button
            className="icon-button bag-action"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping bag"
          >
            <ShoppingBag />
            <span className="bag-count">{cartCount}</span>
          </button>
        </div>
      </header>

      {apiOnline && (
        <div className="connection-note">
          <span className="live-dot" /> Connected to ShopSphere API
        </div>
      )}

      {view === 'home' && (
        <main>
          <section className="hero wrap">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-line" /> THE EVERYDAY EDIT · 2026
              </div>
              <h1>Good things.<br /><em>Better everyday.</em></h1>
              <p>
                Thoughtful finds for the way you live, work and unwind.
                Meet the pieces you'll reach for on repeat.
              </p>

              <div className="hero-buttons">
                <button className="btn btn-dark" onClick={() => goShop()}>
                  Explore the collection <ArrowUpRight size={17} />
                </button>
                <button className="text-link" onClick={() => goShop('Home')}>
                  Discover home essentials <ArrowRight size={15} />
                </button>
              </div>

              <div className="hero-proof">
                <div className="avatar-stack">
                  <span>J</span><span>A</span><span>M</span><span>+</span>
                </div>
                <div>
                  <strong>Loved by 12,000+ shoppers</strong>
                  <small>Little upgrades, big everyday joy.</small>
                </div>
              </div>
            </div>

            <div className="hero-art">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200"
                alt="Curated neutral fashion and lifestyle collection"
              />
              <div className="hero-float-card">
                <span className="float-icon"><Zap size={16} /></span>
                <div>
                  <strong>The new season edit</strong>
                  <small>Fresh finds, just landed</small>
                </div>
                <ArrowUpRight size={18} />
              </div>
              <div className="hero-image-label">01 / THE GOOD LIFE COLLECTION</div>
            </div>
          </section>

          <section className="benefits wrap">
            <div><Truck /><span><strong>Free delivery</strong><small>On orders over ₹1,500</small></span></div>
            <div><ShieldCheck /><span><strong>Easy returns</strong><small>7-day return window</small></span></div>
            <div><BadgeCheck /><span><strong>Quality first</strong><small>Thoughtfully picked</small></span></div>
            <div><CircleHelp /><span><strong>Here to help</strong><small>Friendly support, always</small></span></div>
          </section>

          <section className="section wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A GOOD PLACE TO START</div>
                <h2>Find your <em>kind of thing.</em></h2>
              </div>
              <button className="text-link" onClick={() => goShop()}>
                View all categories <ArrowRight size={16} />
              </button>
            </div>

            <div className="category-grid">
              {categories.map((c, i) => (
                <button
                  className={`category-card category-${i}`}
                  key={c.name}
                  onClick={() => goShop(c.name)}
                >
                  <img src={c.image} alt="" />
                  <span className="category-overlay" />
                  <span className="category-content">
                    <small>{c.icon} &nbsp; EXPLORE</small>
                    <strong>{c.name}</strong>
                    <span>{c.sub} <ArrowUpRight size={15} /></span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="section featured-section">
            <div className="wrap">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">THE CROWD FAVOURITES</div>
                  <h2>Good picks. <em>Great taste.</em></h2>
                  <p className="section-subtitle">
                    The pieces everyone's adding to their everyday.
                  </p>
                </div>
                <button className="text-link" onClick={() => goShop()}>
                  Shop all products <ArrowRight size={16} />
                </button>
              </div>

              <ProductGrid
                products={products.filter(p => p.featured).slice(0, 4)}
                onOpen={setSelected}
                onAdd={addToCart}
              />
            </div>
          </section>

          <section className="promo wrap">
            <div className="promo-copy">
              <div className="eyebrow">A SMALL TREAT, ON US</div>
              <h2>Your next favourite<br />is <em>closer than you think.</em></h2>
              <p>
                Explore considered essentials, clever finds and feel-good
                details for every corner of your day.
              </p>
              <button className="btn btn-light" onClick={() => goShop()}>
                Find your favourites <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="promo-image">
              <img
                src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000"
                alt="Warm, thoughtfully styled home interior"
              />
              <div className="promo-stamp">
                MADE FOR<br /><strong>YOUR EVERYDAY</strong>
              </div>
            </div>
          </section>

          <section className="section wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">JUST DROPPED</div>
                <h2>New in, <em>good things.</em></h2>
              </div>
              <button className="text-link" onClick={() => goShop()}>
                See what's new <ArrowRight size={16} />
              </button>
            </div>

            <ProductGrid
              products={products.slice(4, 8)}
              onOpen={setSelected}
              onAdd={addToCart}
            />
          </section>

          <Newsletter />
        </main>
      )}

      {view === 'shop' && (
        <main className="wrap shop-page">
          <div className="breadcrumb">
            Home <ChevronRight size={13} /> Shop <ChevronRight size={13} />
            <strong>{category === 'All' ? 'All products' : category}</strong>
          </div>

          <div className="shop-heading">
            <div>
              <div className="eyebrow">THE SHOPSPHERE COLLECTION</div>
              <h1>
                {category === 'All' ? 'Find your next favourite.' : category + '.'}
                {' '}<em>Good choice.</em>
              </h1>
              <p>Considered essentials for a life well lived.</p>
            </div>

            <div className="shop-controls">
              <label className="sort-select">
                <SlidersHorizontal size={16} />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>
          </div>

          <div className="shop-layout">
            <aside className="filters">
              <h3>Categories</h3>
              {['All', 'Electronics', 'Fashion', 'Home', 'Accessories'].map(c => (
                <button
                  key={c}
                  className={category === c ? 'filter-active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {c}
                  <span>
                    {c === 'All'
                      ? products.length
                      : products.filter(p => p.category === c).length}
                  </span>
                </button>
              ))}

              <div className="filter-divider" />
              <h3>Quick note</h3>
              <p className="filter-note">
                Every product is selected with everyday usefulness,
                quality and good design in mind.
              </p>
            </aside>

            <div className="shop-results">
              <div className="results-meta">
                <span>{filtered.length} products</span>
                <span>
                  {query
                    ? `Results for “${query}”`
                    : category === 'All'
                      ? 'Showing all finds'
                      : `Showing ${category}`}
                </span>
              </div>

              {filtered.length ? (
                <ProductGrid
                  products={filtered}
                  onOpen={setSelected}
                  onAdd={addToCart}
                />
              ) : (
                <div className="empty-state">
                  <Search size={30} />
                  <h3>{apiOnline ? 'No matches just yet' : 'Loading products...'}</h3>
                  <p>
                    {apiOnline
                      ? 'Try another search or browse all products.'
                      : 'Please check that the backend is running.'}
                  </p>
                  {apiOnline && (
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        setQuery('');
                        setCategory('All');
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === 'account' && (
        <main className="wrap account-page">
          <div className="eyebrow">YOUR SHOPSPHERE</div>
          <h1>Hello, <em>{user?.name?.split(' ')[0] || 'there'}.</em></h1>

          <div className="account-card">
            <div className="account-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
              <span className="role-pill">{user?.role || 'customer'}</span>
            </div>
            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>

          <div className="account-shortcuts">
            <button onClick={() => setView('orders')}>
              <Package />
              <strong>My orders</strong>
              <span>View order history and status</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setView('admin');
                  loadAdmin();
                }}
              >
                <LayoutDashboard />
                <strong>Admin dashboard</strong>
                <span>Manage your store</span>
              </button>
            )}
          </div>
        </main>
      )}

      {view === 'orders' && (
        <main className="wrap account-page">
          <div className="eyebrow">YOUR SHOPSPHERE</div>
          <h1>Order <em>history.</em></h1>

          {orders.length ? (
            <div className="orders-list">
              {orders.map(order => (
                <div className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div>
                      <small>ORDER PLACED</small>
                      <strong>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <small>TOTAL</small>
                      <strong>{money(order.total)}</strong>
                    </div>
                    <div>
                      <small>ORDER ID</small>
                      <strong>#{order._id.slice(-7).toUpperCase()}</strong>
                    </div>
                    <span className="status-pill">{order.status}</span>
                  </div>

                  {order.items?.map(item => (
                    <div className="order-item" key={item._id || item.product}>
                      <img src={item.image} alt="" />
                      <span>
                        <strong>{item.name}</strong>
                        <small>Qty {item.quantity}</small>
                      </span>
                      <b>{money(item.price * item.quantity)}</b>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Package size={32} />
              <h3>No orders yet</h3>
              <p>Your next favourite find is waiting.</p>
              <button className="btn btn-dark" onClick={() => goShop()}>
                Start shopping <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
      )}

      {view === 'admin' && user?.role === 'admin' && (
        <main className="wrap admin-page">
          <div className="eyebrow">SHOPSPHERE CONTROL ROOM</div>
          <h1>Store <em>overview.</em></h1>

          <div className="admin-metrics">
            <div>
              <small>PRODUCTS</small>
              <strong>{products.length}</strong>
              <span>In your catalogue</span>
            </div>
            <div>
              <small>ORDERS</small>
              <strong>{adminOrders.length}</strong>
              <span>All-time orders</span>
            </div>
            <div>
              <small>REVENUE</small>
              <strong>{money(adminOrders.reduce((s, o) => s + o.total, 0))}</strong>
              <span>From recorded orders</span>
            </div>
            <div>
              <small>LOW STOCK</small>
              <strong>{products.filter(p => p.stock < 10).length}</strong>
              <span>Items to replenish</span>
            </div>
          </div>

          <div className="admin-columns">
            <section className="admin-panel">
              <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>

              <form className="admin-form" onSubmit={saveProduct}>
                <input
                  required
                  placeholder="Product name"
                  value={adminForm.name}
                  onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                />

                <textarea
                  placeholder="Description"
                  value={adminForm.description}
                  onChange={e => setAdminForm({ ...adminForm, description: e.target.value })}
                />

                <div className="form-row">
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Price (₹)"
                    value={adminForm.price}
                    onChange={e => setAdminForm({ ...adminForm, price: e.target.value })}
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={adminForm.stock}
                    onChange={e => setAdminForm({ ...adminForm, stock: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <select
                    value={adminForm.category}
                    onChange={e => setAdminForm({ ...adminForm, category: e.target.value })}
                  >
                    {['Electronics', 'Fashion', 'Home', 'Accessories'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <input
                    placeholder="Brand"
                    value={adminForm.brand}
                    onChange={e => setAdminForm({ ...adminForm, brand: e.target.value })}
                  />
                </div>

                <input
                  placeholder="Image URL"
                  value={adminForm.image}
                  onChange={e => setAdminForm({ ...adminForm, image: e.target.value })}
                />

                <input
                  type="number"
                  min="0"
                  max="90"
                  placeholder="Discount %"
                  value={adminForm.discount}
                  onChange={e => setAdminForm({ ...adminForm, discount: e.target.value })}
                />

                <div className="form-row">
                  <button className="btn btn-dark" type="submit">
                    {editingId ? 'Update product' : 'Add product'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingId(null);
                        setAdminForm({
                          name: '',
                          description: '',
                          price: '',
                          category: 'Electronics',
                          brand: '',
                          image: '',
                          stock: '',
                          discount: '0'
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-panel">
              <h2>Product catalogue</h2>

              <div className="admin-table">
                {products.map(product => (
                  <div className="admin-product" key={product._id}>
                    <img src={product.image} alt="" />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{money(product.price)} · {product.stock} in stock</small>
                    </span>

                    <button
                      onClick={() => {
                        setAdminForm({
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          category: product.category,
                          brand: product.brand,
                          image: product.image,
                          stock: product.stock,
                          discount: product.discount || 0
                        });
                        setEditingId(product._id);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-text"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="admin-panel admin-orders">
            <h2>Recent orders</h2>

            {adminOrders.length ? (
              adminOrders.map(order => (
                <div className="admin-order-row" key={order._id}>
                  <span>
                    <strong>#{order._id.slice(-7).toUpperCase()}</strong>
                    <small>
                      {order.user?.name || 'Customer'} · {money(order.total)}
                    </small>
                  </span>

                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order._id, e.target.value)}
                  >
                    {['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              ))
            ) : (
              <p className="muted">No orders recorded yet.</p>
            )}
          </section>
        </main>
      )}

      <Footer onShop={() => goShop()} />

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setCartOpen(false)} />

          <aside className="cart-drawer">
            <div className="drawer-header">
              <div>
                <small>YOUR BAG</small>
                <h2>A few good things <span>({cartCount})</span></h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)}>
                <X />
              </button>
            </div>

            {cart.length ? (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-line" key={item._id}>
                      <img src={item.image} alt="" />

                      <div className="cart-line-info">
                        <strong>{item.name}</strong>
                        <small>{item.brand}</small>
                        <b>
                          {money(item.price * (1 - (item.discount || 0) / 100))}
                        </b>

                        <div className="qty-control">
                          <button onClick={() => updateQty(item._id, -1)}>
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item._id, 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item._id)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div><span>Shipping</span><strong>{shipping === 0 ? 'FREE' : money(shipping)}</strong></div>
                  <div className="cart-total">
                    <span>Total</span><strong>{money(total)}</strong>
                  </div>

                  <small>
                    {subtotal >= 1500
                      ? 'You unlocked free shipping.'
                      : 'Add ' + money(1500 - subtotal) + ' for free shipping.'}
                  </small>

                  <button
                    className="btn btn-dark checkout-btn"
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                  >
                    Continue to checkout <ArrowRight size={17} />
                  </button>

                  <p>
                    <ShieldCheck size={14} /> Secure checkout · Demo payment only
                  </p>
                </div>
              </>
            ) : (
              <div className="cart-empty">
                <ShoppingBag size={34} />
                <h3>Your bag is taking a break.</h3>
                <p>Let's find something you'll love.</p>
                <button
                  className="btn btn-dark"
                  onClick={() => {
                    setCartOpen(false);
                    goShop();
                  }}
                >
                  Explore the shop
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Login and registration */}
      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close icon-button"
              onClick={() => setAuthOpen(false)}
            >
              <X />
            </button>

            <div className="brand modal-brand">
              <span className="brand-mark">s.</span>
              <span>shopsphere</span>
            </div>

            <div className="eyebrow">GOOD TO HAVE YOU HERE</div>
            <h2>{authMode === 'login' ? 'Welcome back.' : 'Join the good finds.'}</h2>
            <p>
              {authMode === 'login'
                ? 'Sign in to see your orders and keep your favourites close.'
                : 'Create an account and make every day a little better.'}
            </p>

            <form onSubmit={authenticate} className="auth-form">
              {authMode === 'register' && (
                <input
                  name="name"
                  placeholder="Your name"
                  required
                  minLength="2"
                />
              )}

              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password (8+ characters)"
                required
                minLength="8"
              />

              <button className="btn btn-dark" type="submit">
                {authMode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="auth-switch">
              {authMode === 'login'
                ? 'New to ShopSphere?'
                : 'Already have an account?'}
              {' '}
              <button
                onClick={() =>
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                }
              >
                {authMode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </div>

            <small className="auth-note">
              Your details are protected. We never store payment card information.
            </small>
          </div>
        </div>
      )}

      {/* Demo checkout */}
      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close icon-button"
              onClick={() => setCheckoutOpen(false)}
            >
              <X />
            </button>

            <div className="eyebrow">ALMOST YOURS</div>
            <h2>Delivery <em>details.</em></h2>
            <p>Complete your address to place this demo order.</p>

            <form onSubmit={placeOrder} className="checkout-form">
              <input
                name="name"
                placeholder="Full name"
                required
                defaultValue={user?.name || ''}
              />

              <input
                name="line1"
                placeholder="House / street address"
                required
              />

              <div className="form-row">
                <input name="city" placeholder="City" required />
                <input name="state" placeholder="State" required />
              </div>

              <div className="form-row">
                <input
                  name="postalCode"
                  placeholder="PIN code"
                  required
                  pattern="[0-9]{6}"
                />
                <input
                  name="country"
                  placeholder="Country"
                  defaultValue="India"
                  required
                />
              </div>

              <div className="payment-note">
                <CreditCard size={18} />
                <span>
                  <strong>Simulated payment</strong>
                  <small>
                    No real payment will be collected. Card details are not requested.
                  </small>
                </span>
                <span className="demo-tag">DEMO</span>
              </div>

              <div className="checkout-total">
                <span>Order total</span>
                <strong>{money(total)}</strong>
              </div>

              <button className="btn btn-dark" type="submit">
                Place demo order <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductGrid({ products, onOpen, onAdd }) {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <article className="product-card" key={product._id}>
          <button className="product-image" onClick={() => onOpen(product)}>
            <img src={product.image} alt={product.name} loading="lazy" />
            <span className="product-badge">
              {product.discount > 0
                ? `${product.discount}% OFF`
                : index === 0
                  ? 'POPULAR'
                  : 'JUST RIGHT'}
            </span>
            <span className="quick-view">
              Quick view <ArrowUpRight size={14} />
            </span>
          </button>

          <div className="product-info">
            <div className="product-brand">
              {product.brand || 'SHOPSPHERE'}
              <span>
                <Star size={12} fill="currentColor" /> {product.rating || '4.5'}
              </span>
            </div>

            <button
              className="product-name"
              onClick={() => onOpen(product)}
            >
              {product.name}
            </button>

            <div className="product-price">
              <strong>
                {money(product.price * (1 - (product.discount || 0) / 100))}
              </strong>
              {product.discount > 0 && <del>{money(product.price)}</del>}
            </div>

            <button
              className="add-button"
              onClick={() => onAdd(product)}
              disabled={product.stock === 0}
            >
              <Plus size={15} />
              {product.stock === 0 ? 'Out of stock' : 'Add to bag'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close icon-button" onClick={onClose}>
          <X />
        </button>

        <div className="product-modal-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-modal-info">
          <div className="eyebrow">
            {product.brand} · {product.category}
          </div>

          <h2>{product.name}</h2>

          <div className="modal-rating">
            <Star size={15} fill="currentColor" />
            {' '}{product.rating || '4.5'}
            <span>·</span> Thoughtfully selected
          </div>

          <div className="modal-price">
            {money(product.price * (1 - (product.discount || 0) / 100))}
            {product.discount > 0 && <del>{money(product.price)}</del>}
          </div>

          <p>{product.description}</p>

          <div className="stock-note">
            <span className="live-dot" />
            {product.stock > 0
              ? `${product.stock} available — ready to ship`
              : 'Currently unavailable'}
          </div>

          <div className="modal-qty">
            <span>Quantity</span>
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() =>
                  setQty(Math.min(20, product.stock || 1, qty + 1))
                }
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            className="btn btn-dark modal-add"
            disabled={product.stock === 0}
            onClick={() => {
              onAdd(product, qty);
              onClose();
            }}
          >
            Add to bag · {money(product.price * (1 - (product.discount || 0) / 100) * qty)}
            <ShoppingBag size={17} />
          </button>

          <div className="modal-perks">
            <span><Truck size={15} /> Free shipping over ₹1,500</span>
            <span><ShieldCheck size={15} /> Easy 7-day returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section className="newsletter">
      <div className="newsletter-inner wrap">
        <div>
          <div className="eyebrow">A NOTE FROM US TO YOU</div>
          <h2>Good things in your <em>inbox.</em></h2>
          <p>
            Fresh finds, thoughtful ideas and the occasional little surprise.
            No noise, promise.
          </p>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            setDone(true);
            setEmail('');
          }}
        >
          <label>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button aria-label="Subscribe"><ArrowRight /></button>
          </label>
          <small>
            {done
              ? 'You’re on the list. Thanks for joining!'
              : 'By subscribing, you agree to receive ShopSphere updates.'}
          </small>
        </form>
      </div>
    </section>
  );
}

function Footer({ onShop }) {
  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">s.</span>
            <span>shopsphere</span>
          </div>
          <p>
            Thoughtful finds for the way you live, work and unwind.
            Good things, made everyday.
          </p>
          <div className="social-dots">
            <span>ig</span><span>in</span><span>p</span>
          </div>
        </div>

        <div>
          <h4>EXPLORE</h4>
          <button onClick={onShop}>Shop all</button>
          <button onClick={onShop}>New arrivals</button>
          <button onClick={onShop}>Best sellers</button>
          <button onClick={onShop}>Our story</button>
        </div>

        <div>
          <h4>HELP & INFO</h4>
          <span>Shipping & delivery</span>
          <span>Returns & exchanges</span>
          <span>FAQs</span>
          <span>Contact us</span>
        </div>

        <div className="footer-promise">
          <span className="footer-star">✳</span>
          <strong>Made for your<br />everyday.</strong>
          <small>
            Good design. Useful things.<br />A little joy in the details.
          </small>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span>© 2026 ShopSphere. All good things reserved.</span>
        <span>Made with care, for everyday living.</span>
        <span>Privacy &nbsp; · &nbsp; Terms</span>
      </div>
    </footer>
  );
}

export default App;