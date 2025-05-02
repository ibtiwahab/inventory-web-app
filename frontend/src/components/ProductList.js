import React, { useState } from 'react';
import EditProductModal from './EditProductModal';

export default function ProductList({
  products,
  select,
  remove,
  handleOrder,
  refresh
}) {
  const [productToEdit, setProductToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (product) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProductToEdit(null);
  };

  const handleUpdateSuccess = () => {
    refresh(); // Refresh the product list after successful update
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Product Inventory</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-left">Qty</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">{p.description || '-'}</td>
                  <td className="py-2 px-4">{p.quantity}</td>
                  <td className="py-2 px-4">${p.price.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    {p.quantity <= p.lowStockAlert && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-[#d6305a] text-white px-3 py-1 rounded hover:bg-[#bf2a4f] transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleOrder(p)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-sm"
                    >
                      Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && productToEdit && (
        <EditProductModal
          product={productToEdit}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
}