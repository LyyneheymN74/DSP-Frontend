import { useState, useEffect } from 'react';

// --- Reusable Form Input ---
function FormInput({ label, type, value, onChange, name, required = false, isTextArea = false, step = "any" }) {
    const commonProps = {
        className: "w-full border p-2 rounded mt-1 text-sm shadow-sm",
        value: value,
        onChange: onChange,
        name: name,
        required: required
    };
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {isTextArea ? (
                <textarea {...commonProps} rows="3" />
            ) : (
                <input type={type} {...commonProps} step={step} />
            )}
        </div>
    );
}

// --- Main Dashboard Component (Tab Container) ---
export default function AdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'categories', 'products', 'orders'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
      
      {/* --- Tab Buttons --- */}
      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 rounded-lg bg-gray-200 p-1">
        <TabButton
          title="User Management"
          isActive={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        />
        <TabButton
          title="Category Management"
          isActive={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        />
        <TabButton
          title="Product Management"
          isActive={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        />
        {/* --- NEW TAB BUTTON --- */}
        <TabButton
          title="Order Management"
          isActive={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        />
      </div>

      {/* --- Tab Content --- */}
      <div>
        {activeTab === 'users' && <UserManagementList token={token} />}
        {activeTab === 'categories' && <CategoryManagementList token={token} />}
        {activeTab === 'products' && <AdminProductList token={token} />}
        {/* --- NEW TAB CONTENT --- */}
        {activeTab === 'orders' && <AdminOrderList token={token} />}
      </div>
    </div>
  );
}

// --- Reusable Tab Button ---
function TabButton({ title, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors text-sm ${
              isActive ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'
            }`}
        >
            {title}
        </button>
    );
}

// --- User Management Component (Unchanged) ---
function UserManagementList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        alert(err.message);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleToggleUser = (userId) => {
    fetch(`/api/admin/users/${userId}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update user status');
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        fetchUsers(); // Refresh the user list
      })
      .catch((err) => alert(err.message));
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role.name.replace('ROLE_', '')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleToggleUser(user.id)}
                  className={`font-medium ${
                    user.enabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                  }`}
                >
                  {user.enabled ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// --- Category Management Component (Unchanged) ---
function CategoryManagementList({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); 

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories') 
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (categoryId) => {
    if (!window.confirm("Are you sure? This will fail if products are using this category.")) {
        return;
    }
    fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
    })
    .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message) });
        // Handle 204 No Content
        if (res.status === 204) return {};
        return res.json();
    })
    .then(() => {
        alert("Category deleted!");
        fetchCategories(); // Refresh list
    })
    .catch(err => alert("Error: ".concat(err.message || 'Unknown error')));
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <CategoryForm
          key={isEditing ? isEditing.id : 'new'} 
          token={token}
          editingCategory={isEditing}
          onSuccess={() => {
            setIsEditing(null); 
            fetchCategories(); 
          }}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Existing Categories</h3>
        <ul className="divide-y divide-gray-200">
          {categories.map(cat => (
            <li key={cat.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-800">{cat.name}</span>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
              <div className="space-x-3">
                <button 
                    onClick={() => setIsEditing(cat)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                    Edit
                </button>
                <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                    Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Category Form (Unchanged) ---
function CategoryForm({ token, editingCategory, onSuccess }) {
  const [name, setName] = useState(editingCategory ? editingCategory.name : '');
  const [description, setDescription] = useState(editingCategory ? editingCategory.description : '');
  const isEditingMode = !!editingCategory;

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isEditingMode 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories';
        
    const method = isEditingMode ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ name, description }),
    })
    .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message) });
        return res.json();
    })
    .then(() => {
        alert(`Category ${isEditingMode ? 'updated' : 'created'} successfully!`);
        setName('');
        setDescription('');
        onSuccess(); 
    })
    .catch(err => alert("Error: " + err.message));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">
        {isEditingMode ? `Editing: ${editingCategory.name}` : 'Add New Category'}
      </h3>
      <FormInput label="Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
      <FormInput label="Description" isTextArea value={description} onChange={e => setDescription(e.target.value)} />
      <div className="flex gap-4">
        {isEditingMode && (
            <button 
                type="button" 
                onClick={onSuccess} // Re-use onSuccess to cancel
                className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 font-medium"
            >
                Cancel
            </button>
        )}
        <button 
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
        >
            {isEditingMode ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}


// --- Component: ADMIN'S PRODUCT LIST ---
// (Includes Delete Function)
function AdminProductList({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/products', { // Admin fetches ALL products
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(res => res.json())
        .then(data => {
            setProducts(data);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };

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
            fetchProducts();
        })
        .catch(err => alert(err.message));
    };

    const handleDeleteProduct = (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }
        fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { 
                    throw new Error(err.message || 'Failed to delete product') 
                });
            }
            if (res.status === 204) return {};
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res.json();
            } else {
                return {};
            }
        })
        .then(() => {
            alert("Product deleted successfully!");
            fetchProducts();
        })
        .catch(err => {
            console.error(err);
            alert("Error: " + err.message);
        });
    };

    if (loading) return <div className="text-gray-500">Loading all products...</div>;
    if (products.length === 0) return <div className="text-gray-500">There are no products in the store.</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {products.map(product => (
                <ProductStockItem 
                    key={product.id} 
                    product={product} 
                    token={token}
                    categories={categories}
                    onStockUpdate={handleStockUpdate} 
                    onProductUpdated={fetchProducts} 
                    onProductDelete={handleDeleteProduct} // Pass delete handler
                />
            ))}
        </div>
    );
}

// --- Component: Product List Item (for Admin) ---
// (Includes Delete Button)
function ProductStockItem({ product, token, categories, onStockUpdate, onProductUpdated, onProductDelete }) {
    const [stock, setStock] = useState(product.inventory ? product.inventory.quantity : 0);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.category.id
    });

    useEffect(() => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.category.id
        });
        setStock(product.inventory ? product.inventory.quantity : 0);
    }, [product]);


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditProduct = (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId)
        };

        fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if(!res.ok) return res.json().then(err => { throw new Error(err.message) });
            return res.json();
        })
        .then(() => {
            alert("Product updated successfully!");
            setIsEditing(false);
            onProductUpdated(); 
        })
        .catch(err => alert("Error: " + err.message));
    };

    if (isEditing) {
        // --- RENDER THE EDIT FORM ---
        return (
            <div className="p-4 border rounded-lg bg-gray-50">
                <form onSubmit={handleEditProduct} className="space-y-4">
                    <h4 className="text-lg font-semibold">Editing: {product.name}</h4>
                    <p className="text-xs text-gray-500 -mt-4"> (Owned by: {product.supplier.businessName})</p>
                    <FormInput label="Name" type="text" name="name" value={formData.name} onChange={handleFormChange} required />
                    <FormInput label="Description" isTextArea name="description" value={formData.description} onChange={handleFormChange} />
                    <FormInput label="Price" type="number" name="price" value={formData.price} onChange={handleFormChange} required step="0.01" />
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select 
                            name="categoryId" 
                            className="w-full border p-2 rounded mt-1 text-sm" 
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
        <div className="flex flex-col md:flex-row items-start justify-between p-4 border rounded-lg">
            <div className="mb-4 md:mb-0">
                <h4 className="text-lg font-semibold">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.category.name} - ${product.price}</p>
                <p className="text-xs text-gray-400 mt-1"> (Owned by: {product.supplier.businessName})</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Stock:</label>
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
                    Edit Details
                </button>
                {/* --- DELETE BUTTON --- */}
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


// --- NEW COMPONENT: ADMIN'S ORDER LIST ---
function AdminOrderList({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        setLoading(true);
        // Admin fetches ALL orders from a new endpoint
        fetch('/api/admin/orders', {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        })
        .then(data => {
            setOrders(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
            alert(err.message);
        });
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    if (loading) return <div className="text-gray-500 text-center">Loading all orders...</div>;
    if (orders.length === 0) return <div className="text-gray-500 text-center bg-white p-6 rounded-lg shadow-md">No orders found in the database.</div>;

    return (
        <div className="space-y-6">
            {orders.map(order => (
                <AdminOrderItemCard key={order.id} order={order} />
            ))}
        </div>
    );
}

// --- NEW COMPONENT: ADMIN'S ORDER ITEM CARD ---
function AdminOrderItemCard({ order }) {
    // Determine status color
    const statusColor = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'SHIPPED': 'bg-blue-100 text-blue-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800',
    };
    const color = statusColor[order.status] || 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Header: Order ID, User, Total, Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                    <p className="text-sm font-medium text-gray-600">
                        User: <span className="font-normal">{order.user?.username || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Ship to: <span className="font-normal">{order.shippingAddress}</span>
                    </p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                    <p className="text-lg font-bold text-gray-800">${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold h-fit ${color}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Body: Items & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Items */}
                <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2 uppercase">Items:</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                        {order.orderItems.map(item => (
                            <li key={item.id} className="border-b border-gray-100 pb-1">
                                {item.product.name} (Quantity: {item.quantity})
                                <span className="text-xs text-gray-500 block">
                                    Sold by: {item.product.supplier.businessName}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Column 2: Shipping (if applicable) */}
                <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2 uppercase">Shipping:</h4>
                    {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                        <div className="text-sm">
                            <p className="text-gray-700">
                                Carrier: <span className="font-medium">{order.shipping?.shippingCompany || 'N/A'}</span>
                            </p>
                            <p className="text-gray-700">
                                Tracking: <span className="font-medium">{order.shipping?.trackingNumber || 'N/A'}</span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Not yet shipped.</p>
                    )}
                </div>
            </div>
        </div>
    );
}