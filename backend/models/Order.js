// const mongoose = require('mongoose');
// const OrderSchema = new mongoose.Schema({
//     products: [{
//       product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//       quantity: Number
//     }],
//     status: { type: String, enum: ['pending', 'shipped'], default: 'pending' },
//     invoiceNumber: String,
//     createdAt: { type: Date, default: Date.now }
//   });
  
//   module.exports = mongoose.model('Order', OrderSchema);