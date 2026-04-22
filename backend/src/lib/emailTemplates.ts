export const orderConfirmationTemplate = (order: {
  order_number: string
  customer_name: string
  customer_email: string
  city: string
  items: Array<any>
  total_pkr: number
  delivery_fee: number
}) => {
  const itemsHTML = order.items.map(item => {
    const qty = item.qty || item.quantity || 1
    const price = item.sale_price || item.price_pkr || item.price || 0
    return `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #E8E2D9; vertical-align:middle;">
        <div style="display:flex; align-items:center; gap:12px;">
          <!-- Product image thumbnail -->
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.name}" width="72" height="72" style="object-fit:cover; border-radius:3px; border:1px solid #E8E2D9; flex-shrink:0;" />`
            : `<div style="width:72px; height:72px; background:#F2EDE6; border:1px solid #E8E2D9; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">🪑</div>`
          }
          <!-- Item details -->
          <div>
            <div style="font-family:sans-serif; font-size:14px; color:#1C1410; font-weight:600; line-height:1.3;">
              ${item.name}
            </div>
            <div style="font-family:sans-serif; font-size:12px; color:#6B6058; margin-top:3px;">
              Qty: ${qty}
            </div>
          </div>
        </div>
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #E8E2D9; text-align:right; vertical-align:middle;">
        <span style="font-family:sans-serif; font-size:14px; color:#4A2C6E; font-weight:700;">
          Rs. ${(price * qty).toLocaleString()}
        </span>
      </td>
    </tr>
  `
  }).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Order Confirmed - Shopkarro</title>
</head>
<body style="margin:0; padding:0; background:#FAF7F4; font-family:sans-serif;">
  
  <div style="max-width:600px; margin:0 auto; background:#ffffff; margin-top:40px; margin-bottom:40px; box-shadow:0 10px 40px rgba(28,20,16,0.08); border: 1px solid #E8E2D9;">
    
    <!-- HEADER -->
    <div style="background:#1C1410; padding:40px 40px 32px; text-align:center;">
      <h1 style="color:#ffffff; font-size:24px; font-weight:800; margin:0 0 8px 0; letter-spacing:8px; text-transform:uppercase;">
        SHOPKARRO
      </h1>
      <p style="color:rgba(255,255,255,0.4); font-size:10px; margin:0; text-transform:uppercase; letter-spacing:4px;">
        Premium Furniture · Cash on Delivery
      </p>
    </div>

    <!-- ORDER CONFIRMED BANNER -->
    <div style="background:#EBF7F0; border-bottom:1px solid #E8E2D9; padding:24px 40px; display:flex; align-items:center; gap:16px;">
      <span style="font-size:24px;">✅</span>
      <div>
        <h2 style="color:#2D6A4F; font-size:14px; font-weight:800; margin:0 0 6px 0; text-transform:uppercase; letter-spacing:2px;">
          ✅ Order Confirmed!
        </h2>
        <p style="color:#2D6A4F; font-size:13px; margin:0; opacity:0.8; line-height:1.5;">
          Thank you, ${order.customer_name}! Your order has been placed and we will call you shortly to confirm.
        </p>
      </div>
    </div>

    <!-- CONTENT -->
    <div style="padding:40px 40px;">

      <!-- ORDER NUMBER -->
      <div style="background:#FAF7F4; border:1px solid #E8E2D9; padding:20px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#6B6058; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:3px; opacity:0.6;">
          Order Number
        </span>
        <span style="color:#1C1410; font-size:18px; font-weight:800; letter-spacing:2px;">
          ${order.order_number}
        </span>
      </div>

      <!-- ITEMS -->
      <h3 style="color:#1C1410; font-size:13px; font-weight:800; margin:0 0 16px 0; text-transform:uppercase; letter-spacing:3px;">
        Items Ordered
      </h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        ${itemsHTML}
      </table>

      <!-- TOTALS -->
      <div style="border-top:2px solid #1C1410; padding-top:24px; margin-bottom:40px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6B6058; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px;">
            Subtotal
          </span>
          <span style="color:#1C1410; font-size:14px; font-weight:700;">
            Rs. ${order.total_pkr.toLocaleString()}
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
          <span style="color:#6B6058; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px;">
            Delivery
          </span>
          <span style="color:#2D6A4F; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px;">
            Free Logistics
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; background:#1C1410; padding:24px;">
          <span style="color:#ffffff; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:4px; opacity:0.6; align-self:center;">
            Total
          </span>
          <span style="color:#ffffff; font-size:24px; font-weight:800;">
            Rs. ${order.total_pkr.toLocaleString()}
          </span>
        </div>
      </div>

      <!-- COD NOTICE -->
      <div style="background:#FFF9E6; border:1px solid #F8DCA3; padding:20px; margin-bottom:32px;">
        <p style="color:#92400E; font-size:11px; font-weight:800; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:3px;">
          Cash on Delivery
        </p>
        <p style="color:#92400E; font-size:13px; margin:0; opacity:0.8; line-height:1.6;">
          Please have Rs. ${order.total_pkr.toLocaleString()} ready when your furniture arrives in ${order.city}.
        </p>
      </div>

      <!-- DELIVERY INFO -->
      <div style="background:#FAF7F4; border:1px solid #E8E2D9; padding:24px; margin-bottom:32px;">
        <p style="color:#6B6058; font-size:10px; font-weight:800; margin:0 0 12px 0; text-transform:uppercase; letter-spacing:3px; opacity:0.6;">
          Delivery Information
        </p>
        <p style="color:#1C1410; font-size:14px; font-weight:700; margin:0 0 8px 0;">
          Delivering to: <span style="text-transform:uppercase; letter-spacing:1px;">${order.city}</span>
        </p>
        <p style="color:#6B6058; font-size:12px; margin:0;">
          Estimated Delivery: 2-5 business days
        </p>
      </div>

      <!-- WHAT HAPPENS NEXT -->
      <div style="padding:24px 32px; border:1px solid #E8E2D9; margin-bottom:32px; background:#ffffff;">
        <p style="font-family:sans-serif; font-size:13px; font-weight:700; color:#1C1410; letter-spacing:1px; text-transform:uppercase; margin:0 0 16px 0;">
          What Happens Next
        </p>

        <!-- Step 1 -->
        <div style="display:flex; gap:12px; margin-bottom:12px; align-items:flex-start;">
          <div style="width:24px; height:24px; background:#4A2C6E; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0;">1</div>
          <div>
            <p style="margin:0; font-size:13px; font-weight:600; color:#1C1410; font-family:sans-serif;">
              We'll call to confirm
            </p>
            <p style="margin:2px 0 0; font-size:12px; color:#6B6058; font-family:sans-serif;">
              Our team will call within a few hours to verify your order.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div style="display:flex; gap:12px; margin-bottom:12px; align-items:flex-start;">
          <div style="width:24px; height:24px; background:#4A2C6E; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0;">2</div>
          <div>
            <p style="margin:0; font-size:13px; font-weight:600; color:#1C1410; font-family:sans-serif;">
              Your order is prepared
            </p>
            <p style="margin:2px 0 0; font-size:12px; color:#6B6058; font-family:sans-serif;">
              We carefully pack your furniture within 1–2 business days.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="width:24px; height:24px; background:#4A2C6E; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0;">3</div>
          <div>
            <p style="margin:0; font-size:13px; font-weight:600; color:#1C1410; font-family:sans-serif;">
              Delivered to your door
            </p>
            <p style="margin:2px 0 0; font-size:12px; color:#6B6058; font-family:sans-serif;">
              Pay cash when your furniture arrives. No card needed.
            </p>
          </div>
        </div>
      </div>

      <!-- SIGNUP CTA -->
      <div style="background:#FAF7F4; border:1px solid #E8E2D9; padding:32px 24px; text-align:center; margin-bottom:32px;">
        <h3 style="color:#1C1410; font-size:14px; font-weight:800; margin:0 0 12px 0; text-transform:uppercase; letter-spacing:2px;">
          Track Your Order Anytime
        </h3>
        <p style="color:#6B6058; font-size:13px; margin:0 0 24px 0; line-height:1.6;">
          Sign up with ${order.customer_email} to track your order status, view your order history, and get early access to new arrivals.
        </p>
        <a href="https://shopkarro.com/signup?email=${encodeURIComponent(order.customer_email)}&ref=order_confirm"
          style="display:inline-block; background:#1C1410; color:#ffffff; font-size:11px; font-weight:800; padding:16px 32px; text-decoration:none; text-transform:uppercase; letter-spacing:3px; box-shadow: 0 4px 15px rgba(28,20,16,0.2);">
          Create Free Account →
        </a>
      </div>

      <!-- WHATSAPP SUPPORT -->
      <div style="text-align:center; padding:32px 0 0; border-top:1px dashed #E8E2D9;">
        <p style="color:#6B6058; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; opacity:0.6; margin:0 0 16px 0;">
          Need Help?
        </p>
        <a href="https://wa.me/923706905835?text=Hi! I need help with order ${order.order_number}"
          style="display:inline-block; background:#2D6A4F; color:#ffffff; font-size:11px; font-weight:800; padding:14px 28px; text-decoration:none; text-transform:uppercase; letter-spacing:2px;">
          Chat on WhatsApp
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background:#FAF7F4; border-top:1px solid #E8E2D9; padding:24px 40px; text-align:center;">
      <p style="color:#1C1410; font-size:10px; font-weight:800; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:2px; opacity:0.4;">
        © 2026 Shopkarro. All rights reserved.
      </p>
      <p style="color:#6B6058; font-size:9px; font-weight:800; margin:0; text-transform:uppercase; letter-spacing:3px; opacity:0.3;">
        shopkarro.com · Cash on Delivery Only
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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0; background:#FAF7F4;font-family:sans-serif;">
<div style="max-width:600px;margin:40px auto; background:#ffffff; box-shadow:0 10px 40px rgba(28,20,16,0.08); border: 1px solid #E8E2D9;">

  <div style="background:#1C1410; padding:32px 40px; text-align:center;">
    <h1 style="color:#ffffff;font-size:20px; font-weight:800;margin:0; text-transform:uppercase; letter-spacing:8px;">
      SHOPKARRO
    </h1>
  </div>

  <div style="padding:48px 40px; text-align:center; border-bottom:1px solid #E8E2D9; background:#FAF7F4;">
    <div style="font-size:48px; margin-bottom:24px;">
      ${data.emoji}
    </div>
    <h2 style="color:#1C1410;font-size:18px; font-weight:800;margin:0 0 12px 0; text-transform:uppercase; letter-spacing:3px;">
      ${data.title}
    </h2>
    <p style="color:#6B6058;font-size:14px; margin:0 auto;line-height:1.6; max-width:80%;">
      ${data.message}
    </p>
  </div>

  <div style="padding:40px;">
    <div style="background:#FAF7F4; border:1px solid #E8E2D9; padding:20px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#6B6058;font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:3px; opacity:0.6;">
        Identifier
      </span>
      <span style="color:#1C1410;font-size:18px; font-weight:800; letter-spacing:2px;">
        ${data.order_number}
      </span>
    </div>

    ${data.items.map((item: any) => {
      const qty = item.qty || item.quantity || 1;
      const price = item.sale_price || item.price_pkr || item.price || 0;
      return `
      <div style="display:flex; justify-content:space-between; padding:16px 0; border-bottom:1px solid #E8E2D9;">
        <span style="color:#1C1410; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
          ${item.name} <span style="color:#6B6058; font-size:10px; letter-spacing:2px; margin-left:8px;">× ${qty}</span>
        </span>
        <span style="color:#1C1410; font-size:14px;font-weight:700;">
          Rs. ${(price * qty).toLocaleString()}
        </span>
      </div>
      `
    }).join('')}

    <div style="display:flex; justify-content:space-between; margin-top:24px;padding-top:24px; border-top:2px solid #1C1410;">
      <span style="font-size:12px; font-weight:800;color:#6B6058; text-transform:uppercase; letter-spacing:3px;">
        Total Value
      </span>
      <span style="font-size:20px; font-weight:800;color:#1C1410;">
        Rs. ${data.total_pkr.toLocaleString()}
      </span>
    </div>
  </div>

  <div style="padding:0 40px 32px; text-align:center;">
    <a href="https://shopkarro.com/my-orders"
      style="display:inline-block; background:#1C1410;color:#ffffff; font-size:11px;font-weight:800; padding:16px 36px; text-decoration:none; text-transform:uppercase; letter-spacing:3px; box-shadow:0 4px 15px rgba(28,20,16,0.2);">
      Access Your Dashboard
    </a>
  </div>

  <div style="padding:24px 40px; border-top:1px dashed #E8E2D9; text-align:center; background:#FAF7F4;">
    <a href="https://wa.me/923706905835?text=Hi Shopkarro! My identifier is ${data.order_number}"
      style="display:inline-block; background:#2D6A4F;color:#ffffff; font-size:11px;font-weight:800; padding:12px 28px; text-decoration:none; text-transform:uppercase; letter-spacing:2px;">
      WhatsApp Assistance
    </a>
  </div>

</div>
</body>
</html>
`
