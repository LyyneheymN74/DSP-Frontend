import { useState, useEffect } from 'react';

export default function OrderList({ token, user }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/orders', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token, 
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not fetch orders.');
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!orders) return <div className="text-center text-gray-500 mt-10">Loading orders...</div>;
  if (orders.length === 0) return <div className="text-center text-gray-500 mt-10">You have no orders yet.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">My Orders</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">Placed: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">${order.totalPrice.toFixed(2)}</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
                <ul className="space-y-2">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span>{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}