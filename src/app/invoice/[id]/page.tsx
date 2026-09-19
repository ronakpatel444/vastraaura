import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import Image from 'next/image';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 font-sans print:py-0 print:bg-white">
      {/* Action Buttons for Screen (Hidden in Print) */}
      <div className="fixed top-5 right-5 flex gap-4 print:hidden">
        <button
          className="bg-accent text-white px-6 py-2 rounded-sm text-sm tracking-widest font-medium hover:bg-black transition-colors shadow-lg"
        >
          <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
            PRINT / DOWNLOAD PDF
          </a>
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-10 shadow-xl print:shadow-none print:m-0 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-serif tracking-widest font-bold text-gray-900 mb-2">VASTRA AURA</h1>
            <p className="text-gray-500 text-sm">183 - Vijay Nagar, Yogi Chowk</p>
            <p className="text-gray-500 text-sm">Surat, Gujarat, India</p>
            <p className="text-gray-500 text-sm">Email: hello@vastraaura.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-300 mb-2">INVOICE</h2>
            <p className="text-gray-900 font-medium">Invoice No: #{order._id.toString().substring(0, 8).toUpperCase()}</p>
            <p className="text-gray-500 text-sm">Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-gray-500 text-sm">Status: <span className="uppercase font-semibold text-gray-700">{order.status}</span></p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="flex justify-between mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To:</h3>
            <p className="font-semibold text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-gray-600 text-sm mt-1">{order.customer.email}</p>
            <p className="text-gray-600 text-sm">{order.customer.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipped To:</h3>
            <p className="text-gray-600 text-sm mt-1 max-w-[200px] text-right ml-auto">{order.shippingAddress.address}</p>
            <p className="text-gray-600 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Description</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Size</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
              <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium text-gray-900">{item.name}</p>
                </td>
                <td className="py-4 text-center text-gray-600">{item.size}</td>
                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">₹{parseInt(item.price).toLocaleString('en-IN')}</td>
                <td className="py-4 text-right font-medium text-gray-900">₹{(parseInt(item.price) * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-green-600">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</span>
            </div>
            
            <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
              <span>Total Amount</span>
              <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="text-right mt-2 text-sm text-gray-500">
              Payment Method: <span className="font-medium text-gray-700">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 mt-auto text-center text-sm text-gray-400">
          <p className="font-bold text-gray-600 mb-2">Thank you for your business!</p>
          <p>For any inquiries regarding this invoice, please contact hello@vastraaura.com</p>
        </div>
      </div>
    </div>
  );
}
