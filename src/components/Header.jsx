export default function Header({ user, onLogout, setPage, cartCount }) {
  // --- THIS IS THE FIX ---
  // Check if user exists *before* trying to read its properties
  const isCustomer = user && user.role === 'ROLE_CUSTOMER';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        {/* --- THIS BLOCK IS UPDATED --- */}
        <div 
          className="cursor-pointer" 
          // Clicking the logo always goes to the main view
          onClick={() => setPage(isCustomer ? 'products' : 'home')}
        >
          {/* Place your logo (e.g., "logo.png") in the "public" folder 
            of your React project.
          */}
          <img src="/logo.png" alt="Dropshipping App Logo" className="h-10 w-auto" />
        </div>
        {/* --- END OF UPDATE --- */}

        <div className="flex items-center space-x-6">
          
          {/* Show these links only for customers */}
          {isCustomer && (
            <>
              <button onClick={() => setPage('products')} className="text-gray-600 hover:text-blue-600 font-medium">Products</button>
              <button onClick={() => setPage('orders')} className="text-gray-600 hover:text-blue-600 font-medium">Orders</button>
              
              {/* Cart Button */}
              <button onClick={() => setPage('cart')} className="relative text-gray-600 hover:text-blue-600 font-medium flex items-center">
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
          
          {/* --- NEW AUTH LOGIC --- */}
          {/* If user is logged in, show their info and logout */}
          {user ? (
            <div className="flex items-center space-x-2 border-l pl-6">
              <span className="text-sm text-gray-500">
                {user.username} <span className="text-xs font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-700">{user.role.replace('ROLE_', '')}</span>
              </span>
              <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 font-semibold">Logout</button>
            </div>
          ) : (
            // If user is a GUEST, show Login and Register
            <div className="flex items-center space-x-4">
              <button onClick={() => setPage('login')} className="text-gray-600 hover:text-blue-600 font-medium">Login</button>
              <button onClick={() => setPage('register')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                Register
              </button>
            </div>
          )}
          {/* --- END OF NEW LOGIC --- */}

        </div>
      </nav>
    </header>
  );
}