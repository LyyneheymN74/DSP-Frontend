import { useState, useEffect } from 'react';

// --- Product Card Component ---
// A self-contained component to display a single product.
function ProductCard({ product, onAddToCart }) {
    // Check for inventory data, default to 0 if not present
    const stock = product.inventory ? product.inventory.quantity : 0;
    const isOutOfStock = stock === 0;

    // --- SAFELY ACCESS DATA WITH OPTIONAL CHAINING ---
    const categoryName = product.category?.name || 'Uncategorized';
    const supplierName = product.supplier?.businessName || 'Unknown Supplier';
    const price = product.price?.toFixed(2) || '0.00';
    const description = product.description || 'No description available.';

    // --- NEW: State for image error ---
    const [imageError, setImageError] = useState(false);
    const imageUrl = product.imageUrl;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
            
            {/* --- UPDATED IMAGE BLOCK --- */}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* If we have an image URL and it hasn't failed to load, show it */}
                {imageUrl && !imageError ? (
                    <img 
                        src={imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        // If the image fails to load, set imageError to true
                        onError={() => setImageError(true)} 
                    />
                ) : (
                    // Otherwise, show the placeholder
                    <span className="text-gray-400">Product Image</span>
                )}
            </div>
            {/* --- END OF UPDATE --- */}
            
            <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-blue-600 uppercase">{categoryName}</span>
                <h3 className="text-lg font-bold text-gray-800 mt-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">
                    {description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Sold by: {supplierName}
                </p>

                <div className="flex-grow"></div> {/* Pushes content to bottom */}

                <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-bold text-gray-900">${price}</p>
                    {isOutOfStock ? (
                        <span className="text-sm font-medium text-red-500">Out of Stock</span>
                    ) : (
                         <span className="text-xs text-gray-500">{stock} in stock</span>
                    )}
                </div>

                <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`w-full px-4 py-2 rounded-md font-semibold text-white mt-3 transition-colors
                        ${isOutOfStock 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}

// --- Home Page Component ---
// This is the main component for your homepage.
export default function HomePage({ onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Fetch products and categories on component mount
    useEffect(() => {
        const fetchProducts = fetch('/api/products').then(res => {
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        });
        
        const fetchCategories = fetch('/api/categories').then(res => {
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        });

        Promise.all([fetchProducts, fetchCategories])
            .then(([productData, categoryData]) => {
                setProducts(productData);
                setCategories(categoryData);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Filter products based on selected category
    const filteredProducts = products.filter(product => {
        if (selectedCategory === 'all') return true;
        // --- ADDED OPTIONAL CHAINING TO FILTER ---
        return product.category?.id?.toString() === selectedCategory;
    });

    if (loading) {
        return <div className="text-center text-gray-500 mt-10">Loading products...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* --- Hero Section --- */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-10 md:p-16 rounded-lg shadow-lg mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Haven</h1>
                <p className="text-lg md:text-xl text-blue-100">Find the best products supplied by our network of partners.</p>
            </div>

            {/* --- Category Filter Bar --- */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Browse by Category</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors
                            ${selectedCategory === 'all' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All Products
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id.toString())}
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors
                                ${selectedCategory === category.id.toString() 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Product Grid --- */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={onAddToCart} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-10 p-6 bg-white rounded-lg shadow-sm">
                    No products found in this category.
                </div>
            )}
        </div>
    );
}