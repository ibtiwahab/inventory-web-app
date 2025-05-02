import React, { useState, useEffect } from 'react';
import API from '../api';

export default function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Form validation
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }

      if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Format the data for API submission
      const updatedProduct = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        // Maintain the original quantity to meet backend validation
        quantity: product.quantity
      };

      // Call the API to update the product
      await API.put(`/products/${product.id}`, updatedProduct);
      
      // Notify parent component of successful update
      onUpdate();
      
      // Close the modal
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#d6305a] text-white px-4 py-2 rounded hover:bg-[#bf2a4f]"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}