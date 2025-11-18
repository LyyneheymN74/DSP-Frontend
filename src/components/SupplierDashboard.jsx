import { useState, useEffect } from 'react';

// Reusable Form Input (Updated to include 'name' prop for edit form)
function FormInput({ label, type, value, onChange, name, required = false, isTextArea = false }) {
    const commonProps = {
        className: "w-full border p-2 rounded mt-1 text-sm", // Added text-sm
        value: value,
        onChange: onChange,
        name: name, // Added name prop
        required: required
    };
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            {isTextArea ? (
                <textarea {...commonProps} rows="3" />
            ) : (
                <input type={type} {...commonProps} step="0.01" />
            )}
        </div>
    );
}


export default function SupplierDashboard({ token, user }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'myProducts', or 'addProduct'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Supplier Dashboard</h2>
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Incoming Orders
          </button>
          
          <button
            onClick={() => setActiveTab('myProducts')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'myProducts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Products
          </button>

          <button
            onClick={() => setActiveTab('addProduct')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'addProduct' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Add New Product
          </button>
        </div>
      </div>

      {activeTab === 'orders' && <SupplierOrderList token={token} />}
      {activeTab === 'myProducts' && <SupplierProductList token={token} />}
      {activeTab === 'addProduct' && (
        <AddProductForm token={token} onSuccess={() => {
            alert("Product Added!"); 
            setActiveTab('myProducts'); // Switch to product list after adding
        }} />
      )}
    </div>
  );
}

// --- Component: Add Product Form ---
function AddProductForm({ token, onSuccess }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  // --- NEW STATE FOR IMAGE URL ---
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState('');

  // Fetch categories on load
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCatId(data[0].id); // Set default
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- UPDATED PAYLOAD ---
    const payload = {
      name,
      description: desc,
      price: parseFloat(price),
      categoryId: parseInt(catId),
      imageUrl: imageUrl // Send the new field
    };

    fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(payload), // Send updated payload
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add product');
        return res.json();
      })
      .then(() => onSuccess())
      .catch((err) => alert(err.message));
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Name" type="text" required value={name} onChange={e => setName(e.target.value)} />
        <FormInput label="Description" isTextArea value={desc} onChange={e => setDesc(e.target.value)} />
        {/* --- NEW INPUT FIELD --- */}
        <FormInput label="Image URL" type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <FormInput label="Price" type="number" required value={price} onChange={e => setPrice(e.target.value)} />
        <div>
            <label className="block text-sm font-medium">Category</label>
            <select className="w-full border p-2 rounded mt-1" value={catId} onChange={e => setCatId(e.target.value)}>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Create Product</button>
      </form>
    </div>
  );
}


// --- Component: List Orders & Ship Them ---
function SupplierOrderList({ token }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    console.log("Fetching orders with token:", token); // --- DEBUG LOG ---

    fetch('/api/orders', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => {
        if (!res.ok) {
            // --- BETTER ERROR HANDLING ---
            if (res.status === 401) {
                throw new Error("Unauthorized: Please log in again.");
            }
            return res.json().then(err => { throw new Error(err.message) });
        }
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => {
          console.error("Error fetching orders:", err);
          // Don't alert every time, maybe just log it or show a UI message
      });
  };

  useEffect(() => {
    if (token) {
        fetchOrders();
    } else {
        console.warn("No token available for SupplierOrderList");
    }
  }, [token]);

  const handleShip = (orderId, tracking, company) => {
    fetch(`/api/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ trackingNumber: tracking, shippingCompany: company }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to ship');
        return res.json();
      })
      .then(() => {
        alert('Order Shipped!');
        fetchOrders(); // Reload list
      })
      .catch((err) => alert(err.message));
  };

  if (!orders || orders.length === 0) return <div className="text-gray-500">No incoming orders.</div>;

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between border-b pb-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
              <p className="text-sm text-gray-500">To: {order.shippingAddress}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold h-fit ${
                order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Items to Fulfill:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {order.orderItems.map((item) => (
                <li key={item.id}>
                  {item.product.name} (Qty: {item.quantity})
                </li>
              ))}
            </ul>
          </div>

          {order.status === 'PENDING' && (
            <ShippingForm onSubmit={(t, c) => handleShip(order.id, t, c)} />
          )}
        </div>
      ))}
    </div>
  );
}

function ShippingForm({ onSubmit }) {
  const [tracking, setTracking] = useState('');
  const [company, setCompany] = useState('');

  return (
    <div className="bg-gray-50 p-4 rounded-md flex items-end gap-4">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 uppercase">Tracking #</label>
        <input type="text" value={tracking} onChange={e => setTracking(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="e.g. TRK-123456"/>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 uppercase">Carrier</label>
        <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="e.g. FedEx"/>
      </div>
      <button onClick={() => onSubmit(tracking, company)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Ship Order
      </button>
    </div>
  );
}

// --- NEW COMPONENT: STOCK ALERTS ---
function StockAlerts({ lowStockProducts }) {
    if (lowStockProducts.length === 0) {
        return null; // Don't show anything if stock is fine
    }

    return (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6">
            <div className="flex">
                <div className="py-1">
                    {/* Inline SVG for alert icon */}
                    <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold">Stock Alerts</p>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                        {lowStockProducts.map(p => (
                            <li key={p.id}>
                                <strong>{p.name}</strong> has {p.inventory.quantity} items left.
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

// --- THIS COMPONENT IS NOW UPDATED ---
function SupplierProductList({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Define the threshold for low stock
    const LOW_STOCK_THRESHOLD = 10;

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/products/myproducts', {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(res => res.json())
        .then(data => {
            setProducts(data);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };

    // Fetch categories to pass to the edit form
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to fetch categories", err));
            
        fetchProducts();
    }, [token]);

    const handleStockUpdate = (productId, newQuantity) => {
        fetch(`/api/inventory/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        })
        .then(res => {
            if(!res.ok) throw new Error("Failed to update stock");
            return res.json();
        })
        .then(() => {
            alert("Stock updated!");
            fetchProducts(); // Refresh the list
        })
        .catch(err => alert(err.message));
    };

    const handleDeleteProduct = (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { 
                    throw new Error(err.message || 'Failed to delete product') 
                });
            }
            if (res.status === 204) return {}; // Handle No Content
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res.json();
            } else {
                return {};
            }
        })
        .then(() => {
            alert("Product deleted successfully!");
            fetchProducts(); // Refresh the list
        })
        .catch(err => {
            console.error(err);
            alert("Error: " + err.message);
        });
    };

    if (loading) return <div className="text-gray-500">Loading your products...</div>;
    if (products.length === 0) return <div className="text-gray-500">You have not added any products yet.</div>;

    // --- NEW: Filter for low stock products ---
    const lowStockProducts = products.filter(p => 
        p.inventory && p.inventory.quantity <= LOW_STOCK_THRESHOLD
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {/* --- NEW: Render the StockAlerts component --- */}
            <StockAlerts lowStockProducts={lowStockProducts} />
            
            {products.map(product => (
                <ProductStockItem 
                    key={product.id} 
                    product={product} 
                    token={token}
                    categories={categories}
                    onStockUpdate={handleStockUpdate} 
                    onProductUpdated={fetchProducts}
                    onProductDelete={handleDeleteProduct} // <-- Pass delete handler
                />
            ))}
        </div>
    );
}

// --- THIS COMPONENT IS NOW UPDATED ---
function ProductStockItem({ product, token, categories, onStockUpdate, onProductUpdated, onProductDelete }) {
    const [stock, setStock] = useState(product.inventory ? product.inventory.quantity : 0);
    const [isEditing, setIsEditing] = useState(false); 
    
    // Define the threshold for low stock
    const LOW_STOCK_THRESHOLD = 10;
    
    // --- NEW: Check if stock is low ---
    const isLowStock = product.inventory && product.inventory.quantity <= LOW_STOCK_THRESHOLD;

    // Form state for editing
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.category.id,
        imageUrl: product.imageUrl || '' // --- ADDED IMAGE URL ---
    });

    // --- ADDED: Update local state if product prop changes ---
    useEffect(() => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.category.id,
            imageUrl: product.imageUrl || '' // --- ADDED IMAGE URL ---
        });
        setStock(product.inventory ? product.inventory.quantity : 0);
    }, [product]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditProduct = (e) => {
        e.preventDefault();
        
        // --- UPDATED PAYLOAD ---
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId),
            imageUrl: formData.imageUrl // Send the new field
        };

        fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify(payload) // Send updated payload
        })
        .then(res => {
            if(!res.ok) return res.json().then(err => { throw new Error(err.message) });
            return res.json();
        })
        .then(() => {
            alert("Product updated successfully!");
            setIsEditing(false); // Close edit form
            onProductUpdated(); // Refresh the main product list
        })
        .catch(err => alert(err.message));
    };

    if (isEditing) {
        // --- RENDER THE EDIT FORM ---
        return (
            <div className="p-4 border rounded-lg bg-gray-50">
                <form onSubmit={handleEditProduct} className="space-y-4">
                    <h4 className="text-lg font-semibold">Editing: {product.name}</h4>
                    {/* These inputs require the 'name' prop */}
                    <FormInput label="Name" type="text" name="name" value={formData.name} onChange={handleFormChange} required />
                    <FormInput label="Description" isTextArea name="description" value={formData.description} onChange={handleFormChange} />
                    {/* --- NEW INPUT FIELD --- */}
                    <FormInput label="Image URL" type="text" name="imageUrl" value={formData.imageUrl} onChange={handleFormChange} />
                    <FormInput label="Price" type="number" name="price" value={formData.price} onChange={handleFormChange} required />
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select 
                            name="categoryId" 
                            className="w-full border p-2 rounded mt-1" 
                            value={formData.categoryId} 
                            onChange={handleFormChange}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // --- RENDER THE STOCK ITEM (DEFAULT VIEW) ---
    return (
        // --- UPDATED: Added dynamic border and background for low stock ---
        <div className={`flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg
            ${isLowStock ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
        >
            <div className="mb-4 md:mb-0">
                <h4 className="text-lg font-semibold">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.category.name} - ${product.price}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                {/* --- UPDATED: Added "LOW!" badge --- */}
                <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${isLowStock ? 'text-red-700' : ''}`}>Stock:</label>
                    {isLowStock && <span className="text-xs font-bold text-red-600 animate-pulse">LOW!</span>}
                    <input 
                        type="number" 
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-24 p-2 border rounded"
                    />
                    <button 
                        onClick={() => onStockUpdate(product.id, stock)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium text-sm"
                    >
                        Update
                    </button>
                </div>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium text-sm"
                >
                    Edit
                </button>
                {/* --- NEW DELETE BUTTON --- */}
                <button 
                    onClick={() => onProductDelete(product.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}