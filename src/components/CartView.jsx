export default function CartView({ cart, removeFromCart, updateQuantity, placeOrder }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-400">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Go back to products to add items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={item.id} className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Unit Price: ${item.price.toFixed(2)}</p>
                
                {/* --- QUANTITY CONTROLS --- */}
                <div className="flex items-center">
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-l border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                        disabled={item.quantity <= 1} // Disable minus if 1 (or let it remove, see App.jsx logic)
                    >
                        -
                    </button>
                    <div className="h-8 w-12 border-t border-b border-gray-300 flex items-center justify-center text-gray-700 font-medium">
                        {item.quantity}
                    </div>
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-r border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                        +
                    </button>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className="text-lg font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-200">
          <div>
            <span className="text-gray-600">Total:</span>
            <span className="ml-2 text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={placeOrder}
            className="bg-green-600 text-white py-3 px-8 rounded-md font-bold hover:bg-green-700 transition duration-200 shadow-lg"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}