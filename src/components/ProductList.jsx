import { useState, useEffect } from 'react';

export default function ProductList({ token, user, addToCart }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => setError('Could not fetch products.'));
  }, []);

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!products) return <div className="text-center text-gray-500 mt-10">Loading products...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} userRole={user.role} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, addToCart, userRole }) {
  const isCustomer = userRole === 'ROLE_CUSTOMER';
  const hasStock = product.inventory && product.inventory.quantity > 0;
  
  // --- NEW: Image Error State ---
  const [imageError, setImageError] = useState(false);
  const imageUrl = product.imageUrl;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between h-full overflow-hidden">
      
      {/* --- NEW: Image Section --- */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {imageUrl && !imageError ? (
              <img 
                  src={imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)} 
              />
          ) : (
              <span className="text-gray-400 font-medium">Product Image</span>
          )}
      </div>
      {/* --- End Image Section --- */}

      <div className="p-6 flex flex-col flex-grow">
        <div>
            {/* Added Category Tag */}
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                {product.category ? product.category.name : 'Uncategorized'}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 mt-1">{product.name}</h3>
            <p className="text-gray-600 mt-2 text-sm line-clamp-2" title={product.description}>
                {product.description || 'No description available.'}
            </p>
            <p className="text-xs text-gray-400 mt-2">Sold by: {product.supplier.businessName}</p>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {hasStock ? `${product.inventory.quantity} in stock` : 'Out of Stock'}
            </span>
            </div>

            {isCustomer && (
            <button 
                onClick={() => addToCart(product)}
                disabled={!hasStock}
                className={`w-full py-2 px-4 rounded-md font-semibold transition duration-200 ${
                hasStock 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                {hasStock ? 'Add to Cart' : 'Unavailable'}
            </button>
            )}
        </div>
      </div>
    </div>
  );
}