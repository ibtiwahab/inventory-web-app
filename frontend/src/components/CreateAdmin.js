// components/CreateAdmin.js
import React, { useState } from 'react';
import axios from 'axios';

export default function CreateAdmin({ fetchUsers }) {
  const [newAdmin, setNewAdmin] = useState({ 
    username: '', 
    password: '', 
    role: 'admin' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/admin/create',
        newAdmin,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setSuccess('User created successfully!');
      setNewAdmin({ username: '', password: '', role: 'admin' });
      if (fetchUsers) fetchUsers(); // Refresh user list if function is provided
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Create New User</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a]"
            required
          />
        </div>
        

        
        <div>
          <label className="block text-gray-600 font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a]"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-2" htmlFor="role">Role</label>
          <select
            id="role"
            value={newAdmin.role}
            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a]"
          >
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#d6305a] text-white py-3 px-6 rounded-lg hover:bg-[#bf2a4f] transition duration-200 font-semibold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}