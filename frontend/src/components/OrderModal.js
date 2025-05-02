import { useState } from 'react';

export default function OrderModal({ product, onClose, onOrder }) {
  const [quantity, setQuantity] = useState(1);

  const submitOrder = () => {
    if (quantity <= 0 || isNaN(quantity)) {
      alert("Please enter a valid quantity.");
      return;
    }
    onOrder(product.id, quantity);  // Pass product ID and new quantity to parent
    onClose(); // Close the modal after order is placed
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order {product.name}</h2>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2" htmlFor="quantity">Quantity to Order</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a] text-lg"
          />
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Note:</span> This order will require approval from a superadmin before the inventory is updated.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={submitOrder}
            className="px-6 py-2 bg-[#d6305a] text-white rounded-lg hover:bg-[#bf2a4f] transition duration-200"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}