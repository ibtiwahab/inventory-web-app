import { useState, useEffect } from 'react';
import API from '../api';

export default function ProductForm({ selected, refresh, clear }) {
  const [product, setProduct] = useState({ name: '', description: '', quantity: '', price: '' });

  useEffect(() => {
    if (selected) setProduct(selected);
  }, [selected]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...product,
      quantity: parseInt(product.quantity) || 0,
      price: parseFloat(product.price) || 0,
    };

    try {
      if (product.id) {
        await API.put(`/products/${product.id}`, productData);
      } else {
        await API.post('/products', productData);
      }
      setProduct({ name: '', description: '', quantity: '', price: '' });
      refresh();
      clear();
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {product.id ? 'Edit Product' : 'Add Product'}
      </h2>

      <div className="space-y-4">
        <input
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a]"
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a]"
        />
        <input
          name="quantity"
          placeholder="Quantity"
          type="number"
          value={product.quantity}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a]"
          required
        />
        <input
          name="price"
          placeholder="Price"
          type="number"
          value={product.price}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a]"
          required
        />
        <button
          type="submit"
          className="w-32 bg-[#d6305a] text-white py-2 rounded-lg hover:bg-[#bf2a4f] transition duration-200 font-semibold"
        >
          {product.id ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
