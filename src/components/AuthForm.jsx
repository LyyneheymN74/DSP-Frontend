import { useState } from 'react';

export default function AuthForm({ title, onSubmit, isLoginView, toggleView }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer'); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginView) {
      onSubmit(username, password);
    } else {
      onSubmit(username, email, password, role);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        {!isLoginView && (
          <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
        <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {!isLoginView && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Register as:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-200">
          {title}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {isLoginView ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={toggleView} className="font-medium text-blue-600 hover:text-blue-500">
          {isLoginView ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
}

function FormInput({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
  );
}