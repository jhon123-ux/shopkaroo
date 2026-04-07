export const orderConfirmationTemplate = (order: {
  order_number: string
  customer_name: string
  customer_email: string
  city: string
  items: Array<{name: string, qty: number, price_pkr: number}>
  total_pkr: number
  delivery_fee: number
}) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #E5E0F5;">
        <span style="font-family:sans-serif; font-size:14px; color:#1A1A2E; font-weight:600;">
          ${item.name}
        </span>
        <br/>
        <span style="font-family:sans-serif; font-size:12px; color:#6B7280;">
          Qty: ${item.qty}
        </span>
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #E5E0F5; text-align:right;">
        <span style="font-family:sans-serif; font-size:14px; color:#6C3FC5; font-weight:700;">
          Rs. ${(item.price_pkr * item.qty).toLocaleString()}
        </span>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Order Confirmed - Shopkaroo</title>
</head>
<body style="margin:0; padding:0; background:#F7F5FF; font-family:sans-serif;">
  
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; margin-top:40px; margin-bottom:40px; box-shadow:0 4px 24px rgba(108,63,197,0.10);">
    
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#6C3FC5,#5530A8); padding:40px 40px 32px;">
      <h1 style="color:#ffffff; font-size:28px; font-weight:800; margin:0 0 4px 0; letter-spacing:-0.5px;">
        Shopkaroo
      </h1>
      <p style="color:rgba(255,255,255,0.75); font-size:14px; margin:0;">
        Premium Furniture for Pakistani Homes
      </p>
    </div>

    <!-- ORDER CONFIRMED BANNER -->
    <div style="background:#F0FDF4; border-bottom:1px solid #BBF7D0; padding:24px 40px; display:flex; align-items:center; gap:12px;">
      <span style="font-size:32px;">✅</span>
      <div>
        <h2 style="color:#166534; font-size:20px; font-weight:700; margin:0 0 4px 0;">
          Order Confirmed!
        </h2>
        <p style="color:#166534; font-size:14px; margin:0; opacity:0.8;">
          Thank you ${order.customer_name}! Your order has been received.
        </p>
      </div>
    </div>

    <!-- CONTENT -->
    <div style="padding:32px 40px;">

      <!-- ORDER NUMBER -->
      <div style="background:#F7F5FF; border:1px solid #E5E0F5; border-radius:12px; padding:16px 20px; margin-bottom:28px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#6B7280; font-size:13px; font-weight:500;">
          Order Number
        </span>
        <span style="color:#6C3FC5; font-size:18px; font-weight:800; letter-spacing:1px;">
          ${order.order_number}
        </span>
      </div>

      <!-- ITEMS -->
      <h3 style="color:#1A1A2E; font-size:16px; font-weight:700; margin:0 0 16px 0;">
        Items Ordered
      </h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        ${itemsHTML}
      </table>

      <!-- TOTALS -->
      <div style="border-top:2px solid #E5E0F5; padding-top:16px; margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="color:#6B7280; font-size:14px;">
            Subtotal
          </span>
          <span style="color:#1A1A2E; font-size:14px;">
            Rs. ${order.total_pkr.toLocaleString()}
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
          <span style="color:#6B7280; font-size:14px;">
            Delivery
          </span>
          <span style="color:#4CAF7D; font-size:14px; font-weight:600;">
            Free
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; background:#F7F5FF; padding:16px; border-radius:12px;">
          <span style="color:#1A1A2E; font-size:16px; font-weight:700;">
            Total
          </span>
          <span style="color:#6C3FC5; font-size:20px; font-weight:800;">
            Rs. ${order.total_pkr.toLocaleString()}
          </span>
        </div>
      </div>

      <!-- COD NOTICE -->
      <div style="background:#FFF9E6; border:1px solid #FDE68A; border-radius:12px; padding:16px 20px; margin-bottom:28px;">
        <p style="color:#92400E; font-size:14px; font-weight:700; margin:0 0 4px 0;">
          💰 Cash on Delivery
        </p>
        <p style="color:#92400E; font-size:13px; margin:0; opacity:0.8;">
          Please keep Rs. ${order.total_pkr.toLocaleString()} ready when your order arrives in ${order.city}.
        </p>
      </div>

      <!-- DELIVERY INFO -->
      <div style="background:#F7F5FF; border:1px solid #E5E0F5; border-radius:12px; padding:16px 20px; margin-bottom:32px;">
        <p style="color:#6C3FC5; font-size:13px; font-weight:600; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:1px;">
          Delivery Information
        </p>
        <p style="color:#1A1A2E; font-size:14px; margin:0 0 4px 0;">
          📍 Delivering to: <strong>${order.city}</strong>
        </p>
        <p style="color:#6B7280; font-size:13px; margin:0;">
          🚚 Estimated delivery: 2-5 business days
        </p>
      </div>

      <!-- SIGNUP CTA -->
      <div style="background:linear-gradient(135deg,#6C3FC5,#5530A8); border-radius:16px; padding:28px; text-align:center; margin-bottom:28px;">
        <h3 style="color:#ffffff; font-size:18px; font-weight:800; margin:0 0 8px 0;">
          Track Your Order Anytime
        </h3>
        <p style="color:rgba(255,255,255,0.80); font-size:13px; margin:0 0 20px 0; line-height:1.6;">
          Create a free account with this email address (${order.customer_email}) to track your order, view order history, and get exclusive member discounts on future purchases.
        </p>
        <a href="https://shopkaroo.com/signup?email=${encodeURIComponent(order.customer_email)}&ref=order_confirm"
          style="display:inline-block; background:#ffffff; color:#6C3FC5; font-size:14px; font-weight:700; padding:12px 32px; border-radius:12px; text-decoration:none;">
          Create Free Account →
        </a>
      </div>

      <!-- WHATSAPP SUPPORT -->
      <div style="text-align:center; padding:20px 0; border-top:1px solid #E5E0F5;">
        <p style="color:#6B7280; font-size:13px; margin:0 0 12px 0;">
          Questions about your order?
        </p>
        <a href="https://wa.me/923706905835?text=Hi! My order number is ${order.order_number}"
          style="display:inline-block; background:#4CAF7D; color:#ffffff; font-size:14px; font-weight:700; padding:12px 28px; border-radius:12px; text-decoration:none;">
          💬 Chat on WhatsApp
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background:#1A1A2E; padding:24px 40px; text-align:center;">
      <p style="color:rgba(255,255,255,0.50); font-size:12px; margin:0 0 4px 0;">
        © 2026 Shopkaroo. All rights reserved.
      </p>
      <p style="color:rgba(255,255,255,0.35); font-size:11px; margin:0;">
        shopkaroo.com · Cash on Delivery Only
      </p>
    </div>

  </div>
</body>
</html>
  `
}

export const orderStatusTemplate = (data: {
  order_number: string
  customer_name: string
  status: string
  title: string
  message: string
  emoji: string
  city: string
  total_pkr: number
  items: any[]
}) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0; background:#F7F5FF;font-family:sans-serif;">
<div style="max-width:600px;margin:40px auto; background:#fff;border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(108,63,197,.10);">

  <div style="background:linear-gradient( 135deg,#6C3FC5,#5530A8); padding:32px 40px;">
    <h1 style="color:#fff;font-size:24px; font-weight:800;margin:0;">
      Shopkaroo
    </h1>
  </div>

  <div style="padding:32px 40px; text-align:center; border-bottom:1px solid #E5E0F5;">
    <div style="font-size:56px; margin-bottom:16px;">
      ${data.emoji}
    </div>
    <h2 style="color:#1A1A2E;font-size:22px; font-weight:800;margin:0 0 8px 0;">
      ${data.title}
    </h2>
    <p style="color:#6B7280;font-size:14px; margin:0;line-height:1.6;">
      ${data.message}
    </p>
  </div>

  <div style="padding:24px 40px;">
    <div style="background:#F7F5FF; border-radius:12px;padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#6B7280;font-size:13px;">
        Order Number
      </span>
      <span style="color:#6C3FC5;font-size:18px; font-weight:800; letter-spacing:1px;">
        ${data.order_number}
      </span>
    </div>

    ${data.items.map((item: any) => `
      <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #E5E0F5;">
        <span style="color:#1A1A2E; font-size:13px;">
          ${item.name} × ${item.qty}
        </span>
        <span style="color:#6C3FC5; font-size:13px;font-weight:700;">
          Rs. ${(item.price_pkr * item.qty).toLocaleString()}
        </span>
      </div>
    `).join('')}

    <div style="display:flex; justify-content:space-between; margin-top:16px;padding-top:16px; border-top:2px solid #E5E0F5;">
      <span style="font-size:15px; font-weight:700;color:#1A1A2E;">
        Total
      </span>
      <span style="font-size:20px; font-weight:800;color:#6C3FC5;">
        Rs. ${data.total_pkr.toLocaleString()}
      </span>
    </div>
  </div>

  <div style="padding:0 40px 28px; text-align:center;">
    <a href="https://shopkaroo.com/my-orders"
      style="display:inline-block; background:#6C3FC5;color:#fff; font-size:14px;font-weight:700; padding:14px 36px;border-radius:12px; text-decoration:none;">
      View My Orders →
    </a>
  </div>

  <div style="padding:16px 40px; border-top:1px solid #E5E0F5; text-align:center;">
    <a href="https://wa.me/923706905835?text=Hi Shopkaroo! My order number is ${data.order_number}"
      style="display:inline-block; background:#4CAF7D;color:#fff; font-size:13px;font-weight:700; padding:10px 24px;border-radius:10px; text-decoration:none;">
      💬 WhatsApp Support
    </a>
  </div>

  <div style="background:#1A1A2E; padding:20px 40px;text-align:center;">
    <p style="color:rgba(255,255,255,.4); font-size:12px;margin:0;">
      © 2026 Shopkaroo · shopkaroo.com
    </p>
  </div>
</div>
</body>
</html>
`
