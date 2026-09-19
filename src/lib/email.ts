import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendCustomerOrderEmail = async (order: any) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping customer email.');
    return;
  }

  const mailOptions = {
    from: `"RANGREZ" <${process.env.EMAIL_USER}>`,
    to: order.shippingAddress.email,
    subject: `Order Confirmation - RANGREZ #${order._id.toString().substring(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="text-align: center;">Thank You for Your Order!</h2>
        <p>Hi ${order.shippingAddress.firstName},</p>
        <p>We've received your order and are getting it ready to be shipped. We will notify you when it has been sent.</p>
        
        <h3>Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #eee;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="text-align: right; padding: 8px;">Qty</th>
              <th style="text-align: right; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td style="padding: 8px;">${item.name} ${item.size ? `(Size: ${item.size})` : ''}</td>
                <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="text-align: right; margin: 5px 0;">Subtotal: ₹${order.totalAmount.toLocaleString('en-IN')}</p>
          <p style="text-align: right; margin: 5px 0;">Shipping: ${order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</p>
          <h3 style="text-align: right; margin: 5px 0;">Total: ₹${(order.totalAmount + (order.shippingFee || 0)).toLocaleString('en-IN')}</h3>
        </div>

        <div style="margin-top: 30px;">
          <h4>Shipping Address</h4>
          <p style="margin: 0;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
          <p style="margin: 0;">${order.shippingAddress.address}</p>
          <p style="margin: 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          If you have any questions, reply to this email or contact us at hello@rangrez.com.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Customer confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending customer email:', error);
  }
};

export const sendAdminOrderEmail = async (order: any, adminEmail: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping admin email.');
    return;
  }

  const mailOptions = {
    from: `"RANGREZ System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Order Received - #${order._id.toString().substring(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>New Order Alert 🚨</h2>
        <p>A new order has been placed on RANGREZ.</p>
        
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
        <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
        <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        
        <h3>Order Value: ₹${(order.totalAmount + (order.shippingFee || 0)).toLocaleString('en-IN')}</h3>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">View Order in Admin Panel</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Error sending admin email:', error);
  }
};
