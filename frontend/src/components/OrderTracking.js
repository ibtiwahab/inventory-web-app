import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrderTracking({ onOrderStatusChange, socket }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async (page = 1, status = activeTab) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/orders`, {
        params: { page, limit: 10, status },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, activeTab);
  }, [activeTab]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleApprove = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: 'APPROVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh orders
      fetchOrders(currentPage, activeTab);
      
      // Call the callback to notify parent component
      if (onOrderStatusChange) {
        onOrderStatusChange();
      }
    } catch (err) {
      console.error('Failed to approve order:', err);
      alert('Failed to approve order');
    }
  };

  const handleReject = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: 'REJECTED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh orders
      fetchOrders(currentPage, activeTab);
      
      // Call the callback to notify parent component
      if (onOrderStatusChange) {
        onOrderStatusChange();
      }
    } catch (err) {
      console.error('Failed to reject order:', err);
      alert('Failed to reject order');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.products.some(p =>
      p.product?.name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role === 'superadmin';

  return (
    <div className="mt-4 md:mt-6 bg-white p-3 md:p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Order Tracking</h2>

      {/* Tab navigation - scrollable on mobile */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-3 md:mb-4 pb-1">
        <button
          onClick={() => handleTabChange('PENDING')}
          className={`py-2 px-3 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap ${
            activeTab === 'PENDING'
              ? 'border-b-2 border-[#d6305a] text-[#d6305a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => handleTabChange('APPROVED')}
          className={`py-2 px-3 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap ${
            activeTab === 'APPROVED'
              ? 'border-b-2 border-[#d6305a] text-[#d6305a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => handleTabChange('REJECTED')}
          className={`py-2 px-3 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap ${
            activeTab === 'REJECTED'
              ? 'border-b-2 border-[#d6305a] text-[#d6305a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by product name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 md:p-3 mb-4 md:mb-6 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a]"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-6 md:my-8">
          <div className="spinner">Loading...</div>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-6 md:py-8">No orders found.</p>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
              {/* Order header with metadata */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div className="text-xs md:text-sm text-gray-600">
                  <p><span className="font-semibold">Order ID:</span> #{order.id}</p>
                  <p><span className="font-semibold">Created by:</span> {order.createdBy?.username || 'Unknown'}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                  {order.approvedBy && (
                    <p>
                      <span className="font-semibold">
                        {order.status === 'APPROVED' ? 'Approved' : 'Rejected'} by:
                      </span> 
                      {order.approvedBy.username}
                    </p>
                  )}
                </div>
                
                {/* Action buttons - only show for pending orders and superadmins */}
                {activeTab === 'PENDING' && isSuperAdmin && (
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs md:text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs md:text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Order products */}
              <div className="mt-3">
                <h4 className="font-medium text-sm md:text-base text-gray-800 mb-1 md:mb-2">Products:</h4>
                <ul className="space-y-1 pl-2">
                  {order.products.map((p, i) => (
                    p.product && (
                      <li key={i} className="text-xs md:text-sm text-gray-800">
                        <strong>{p.product.name}</strong> — Quantity: {p.quantity}
                      </li>
                    )
                  ))}
                </ul>
              </div>

              {/* Status badge */}
              <div className="mt-3">
                <span 
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    order.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'REJECTED' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - simplified on mobile */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-4 md:mt-6">
          <nav className="flex items-center space-x-1">
            <button 
              onClick={() => fetchOrders(currentPage - 1, activeTab)}
              disabled={currentPage === 1}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Prev
            </button>
            
            {/* Page numbers - Show fewer on mobile */}
            <div className="hidden md:flex space-x-1">
              {[...Array(Math.min(5, pagination.pages)).keys()]
                .map(i => {
                  // Calculate page number based on current page (center current page when possible)
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => fetchOrders(pageNum, activeTab)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? 'bg-[#d6305a] text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
            </div>
            
            {/* On mobile, just show current page indicator */}
            <span className="md:hidden text-xs">
              Page {currentPage} of {pagination.pages}
            </span>
            
            <button 
              onClick={() => fetchOrders(currentPage + 1, activeTab)}
              disabled={currentPage === pagination.pages}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                currentPage === pagination.pages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}