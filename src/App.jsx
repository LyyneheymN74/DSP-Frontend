import { useState, useEffect } from 'react';
// --- UPDATED ALL IMPORTS TO INCLUDE .jsx ---
import Header from './components/Header.jsx';
import AuthForm from './components/AuthForm.jsx';
import ProductList from './components/ProductList.jsx'; // This is your old product list
import OrderList from './components/OrderList.jsx';
import CartView from './components/CartView.jsx';
import SupplierDashboard from './components/SupplierDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx'; 
import HomePage from './components/HomePage.jsx'; // --- 1. IMPORT THE NEW HOMEPAGE ---

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  // 'home', 'login', 'register', 'products', 'orders', 'cart', 'adminDashboard', 'supplierDashboard'
  // --- 2. SET DEFAULT PAGE TO 'home' ---
  const [page, setPage] = useState('home'); 
  
  const [cart, setCart] = useState([]);

  // Load token/user from local storage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // --- If user is already logged in, send them to their dashboard or homepage ---
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'ROLE_ADMIN') {
          setPage('adminDashboard');
      } else if (parsedUser.role === 'ROLE_SUPPLIER') {
          setPage('supplierDashboard');
      } else {
          setPage('home'); // Customers just see the homepage
      }

    }
  }, []);

  // --- Cart Functions ---
  const addToCart = (product) => {
    // --- 3. ADDED AUTH CHECK TO CART ---
    if (!token) {
        alert("Please log in to add items to your cart.");
        setPage('login'); // Send to login page
        return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    alert(`${product.name} added to cart!`);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent going below 1
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    // ... (rest of your placeOrder function is good) ...
    const orderItems = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));
    const orderPayload = {
      shippingAddress: "123 Main St, React Town", // You may want a form for this
      items: orderItems
    };
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(orderPayload)
    })
    .then(res => {
      if (!res.ok) return res.json().then(err => { throw new Error(err.message || "Order failed") });
      return res.json();
    })
    .then(data => {
      alert(`Order #${data.id} placed successfully!`);
      setCart([]); 
      setPage('orders'); 
    })
    .catch(err => {
      console.error(err);
      alert("Failed to place order: " + err.message);
    });
  };

  // --- Auth Functions ---
  const handleLogin = (username, password) => {
    fetch('/api/auth/login', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Login failed!');
        return res.json();
      })
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        // Set default page based on role
        if (data.role === 'ROLE_ADMIN') {
          setPage('adminDashboard');
        } else if (data.role === 'ROLE_SUPPLIER') {
          setPage('supplierDashboard');
        } else {
          setPage('home'); // --- 4. Send customers to 'home' after login ---
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error: ' + err.message);
      });
  };

  const handleRegister = (username, email, password, role) => {
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Registration failed!');
        return res.json();
      })
      .then(() => {
        setPage('login'); // --- 5. Switch to login page on success ---
        alert('Registration successful! Please log in.');
      })
      .catch((err) => {
        console.error(err);
        alert('Error: ' + err.message);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCart([]);
    setPage('home'); // --- 6. Send user to 'home' on logout ---
  };


  // --- 7. REMOVED THE OLD `if (!token)` BLOCK ---
  // The Header and main content will ALWAYS render.
  // The `renderPage` function now controls everything.

  // This function will decide which page to show
  const renderPage = () => {
    // Public pages (visible to everyone)
    switch(page) {
      case 'home':
        return <HomePage onAddToCart={addToCart} />;
      case 'login':
        return (
          <div className="flex justify-center">
            {/* --- THIS BLOCK WAS BROKEN AND IS NOW FIXED --- */}
            <AuthForm
              title="Login"
              onSubmit={handleLogin}
              isLoginView={true}
              toggleView={() => setPage('register')}
            />
          </div>
        );
      case 'register':
        return (
          <div className="flex justify-center">
            <AuthForm
              title="Register"
              onSubmit={handleRegister}
              isLoginView={false}
              toggleView={() => setPage('login')}
            />
          </div>
        );
    }

    // --- Protected Pages (require login) ---
    // If we're not logged in, redirect to the login page
    if (!token || !user) {
        // --- THIS BLOCK WAS BROKEN AND IS NOW FIXED ---
        // DO NOT call setPage here. Just return the login component.
        // This prevents an infinite render loop.
        return (
          <div className="flex justify-center">
            <AuthForm
              title="Login"
              onSubmit={handleLogin}
              isLoginView={true}
              toggleView={() => setPage('register')}
            />
          </div>
        );
    }
    
    // --- User is logged in, show protected pages ---
    
    // Admin Pages
    if (user.role === 'ROLE_ADMIN') {
      if (page === 'adminDashboard') {
        return <AdminDashboard token={token} />;
      }
      // Admins fall back to their dashboard
      setPage('adminDashboard');
      return <AdminDashboard token={token} />;
    }

    // Supplier Pages
    if (user.role === 'ROLE_SUPPLIER') {
      if (page === 'supplierDashboard') {
        return <SupplierDashboard token={token} user={user} />;
      }
      // Suppliers fall back to their dashboard
      setPage('supplierDashboard');
      return <SupplierDashboard token={token} user={user} />;
    }

    // Customer Pages
    if (user.role === 'ROLE_CUSTOMER') {
      switch(page) {
        case 'orders':
          return <OrderList token={token} user={user} />;
        case 'cart':
          return <CartView cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} placeOrder={placeOrder} />;
        case 'products': // This is your old customer page
          return <ProductList token={token} user={user} addToCart={addToCart} />;
        default:
          // If a customer is logged in and on 'home', show homepage
          return <HomePage onAddToCart={addToCart} />;
      }
    }

    // Default fallback (shouldn't be reached)
    return <HomePage onAddToCart={addToCart} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your Header component now needs to be smart:
        - If `user` is null, show "Login" and "Register" buttons (that call setPage)
        - If `user` exists, show "Logout", "My Cart", "My Orders", etc.
      */}
      <Header user={user} onLogout={handleLogout} setPage={setPage} cartCount={cart.length} />
      <main className="p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}