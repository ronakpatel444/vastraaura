import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_PORT === '465' ? true : false,
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
    from: `"VASTRA AURA" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmation - VASTRA AURA #${order._id.toString().substring(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="text-align: center; margin-bottom: 5px;">TAX INVOICE</h2>
        <p style="text-align: center; color: #666; margin-top: 0;">Order #${order._id.toString().substring(0, 8).toUpperCase()}</p>
        <p>Hi ${order.customer.firstName},</p>
        <p>We've received your order and are getting it ready to be shipped. We will notify you when it has been sent.</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vastraaura.com'}/invoice/${order._id}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Official Invoice</a>
        </div>
        
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
            ${order.items.map((item: any) => {
              const itemPrice = parseInt(String(item.price).replace(/[^\d]/g, ''), 10) || 0;
              return `
              <tr>
                <td style="padding: 8px;">${item.name} ${item.size ? `(Size: ${item.size})` : ''}</td>
                <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px;">₹${(itemPrice * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="text-align: right; margin: 5px 0;">Subtotal: ₹${order.totalAmount.toLocaleString('en-IN')}</p>
          <p style="text-align: right; margin: 5px 0;">Shipping: ${order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</p>
          <h3 style="text-align: right; margin: 5px 0;">Total: ₹${(order.totalAmount + (order.shippingFee || 0)).toLocaleString('en-IN')}</h3>
        </div>

        <div style="margin-top: 30px;">
          <h4>Shipping Address</h4>
          <p style="margin: 0;">${order.customer.firstName} ${order.customer.lastName}</p>
          <p style="margin: 0;">${order.shippingAddress.address}</p>
          <p style="margin: 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          If you have any questions, reply to this email or contact us at hello@vastraaura.com.
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
    from: `"VASTRA AURA System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Order Received - #${order._id.toString().substring(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>New Order Alert 🚨</h2>
        <p>A new order has been placed on VASTRA AURA.</p>
        
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        
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

export const sendSellerApprovalEmail = async (email: string, name: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping seller approval email.');
    return;
  }
  const mailOptions = {
    from: `"VASTRA AURA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to VastraAura - Your Seller Account is Approved!`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">VASTRA AURA</h1>
          <p style="color: #aaa; margin-top: 5px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Premium Marketplace</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #000; margin-top: 0;">Congratulations, ${name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We are thrilled to inform you that your seller application has been officially <strong>approved</strong> by the VastraAura administration team.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You can now log in to your dedicated Seller Dashboard to start listing your premium products, managing your inventory, and tracking your sales.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vastraaura.com'}/login" style="display: inline-block; padding: 14px 32px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-size: 14px;">Access Seller Dashboard</a>
          </div>
          
          <p style="font-size: 14px; color: #777; border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 40px;">
            If you need any assistance getting started, please reply directly to this email. Welcome to the VastraAura family!
          </p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} VastraAura. All rights reserved.
        </div>
      </div>
    `
  };
  try { await transporter.sendMail(mailOptions); } catch (e) {}
};

export const sendSellerRejectionEmail = async (email: string, name: string, reason: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping seller rejection email.');
    return;
  }
  const mailOptions = {
    from: `"VASTRA AURA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update on your VastraAura Seller Application`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">VASTRA AURA</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #000; margin-top: 0;">Application Status Update</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">Dear ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for your interest in becoming a premium seller on VastraAura. Our team has carefully reviewed your application and business details.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Unfortunately, we are unable to approve your application at this time. The administration team has provided the following reason for this decision:
          </p>
          
          <div style="background-color: #fdf5f5; border-left: 4px solid #d9534f; padding: 20px; margin: 30px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; color: #d9534f; font-style: italic; font-size: 15px;">"${reason}"</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            We appreciate the time you took to apply. If you believe this was a mistake or you have updated your business details to align with our platform guidelines, you may reach out to our support team.
          </p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} VastraAura. All rights reserved.
        </div>
      </div>
    `
  };
  try { await transporter.sendMail(mailOptions); } catch (e) {}
};

export const sendOTPEmail = async (email: string, name: string, otp: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[OTP EMULATED FOR ${email}]: ${otp}`);
    return;
  }
  const mailOptions = {
    from: `"VASTRA AURA Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your VastraAura Login Code: ${otp}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 25px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 20px; letter-spacing: 2px;">VASTRA AURA</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #000; margin-top: 0; font-size: 18px;">Login Verification</h2>
          <p style="font-size: 15px; color: #555;">Hi ${name},</p>
          <p style="font-size: 15px; color: #555;">Please use the following 6-digit code to securely log in to your Seller Dashboard:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background-color: #f5f5f5; border: 2px dashed #ccc; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 13px; color: #777;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      </div>
    `
  };
  try { await transporter.sendMail(mailOptions); } catch (e) {}
};
