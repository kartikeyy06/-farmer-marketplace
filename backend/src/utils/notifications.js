// Notification utility - Email and SMS
// In development mode, notifications are logged to console
// In production, integrate with Twilio (SMS) and SendGrid (Email)

const { Twilio } = require('twilio');

// Email notifications (using SendGrid in production)
async function sendOrderEmail({ to, subject, html }) {
  console.log(`\n📧 EMAIL NOTIFICATION`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   ---`);
  // In production, use SendGrid or similar:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@farmfresh.com', subject, html });
}

// SMS notifications (using Twilio in production)
async function sendOrderSMS({ to, message }) {
  console.log(`\n📱 SMS NOTIFICATION`);
  console.log(`   To: ${to}`);
  console.log(`   Message: ${message}`);
  console.log(`   ---`);
  // In production, use Twilio:
  // if (process.env.TWILIO_ACCOUNT_SID) {
  //   const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  //   await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
  // }
}

// Notification templates for order status changes
const templates = {
  // Consumer notifications
  orderPlaced: (orderNumber, farmName) => ({
    emailSubject: `Order #${orderNumber} Placed Successfully`,
    emailHtml: `
      <h2>Order Confirmed</h2>
      <p>Your order #${orderNumber} from ${farmName} has been placed successfully.</p>
      <p>We'll notify you when the farmer confirms your order.</p>
      <p>Thank you for supporting local farmers! 🌾</p>
    `,
    sms: `Order #${orderNumber} placed with ${farmName}. You'll be notified when confirmed.`
  }),

  orderConfirmed: (orderNumber, farmName) => ({
    emailSubject: `Order #${orderNumber} Confirmed by ${farmName}`,
    emailHtml: `
      <h2>Order Confirmed</h2>
      <p>Great news! ${farmName} has confirmed your order #${orderNumber}.</p>
      <p>You'll be notified when it's ready for ${'{fulfillment}'}. 🎉</p>
    `,
    sms: `Great news! ${farmName} confirmed order #${orderNumber}.`
  }),

  orderReady: (orderNumber, farmName) => ({
    emailSubject: `Order #${orderNumber} Ready for Pickup/Delivery`,
    emailHtml: `
      <h2>Order Ready</h2>
      <p>Your order #${orderNumber} from ${farmName} is ready!</p>
      <p>Please proceed with pickup or expect delivery soon.</p>
    `,
    sms: `Order #${orderNumber} from ${farmName} is ready! 🎉`
  }),

  orderCompleted: (orderNumber, farmName) => ({
    emailSubject: `Order #${orderNumber} Completed`,
    emailHtml: `
      <h2>Order Complete</h2>
      <p>Your order #${orderNumber} from ${farmName} has been completed.</p>
      <p>We hope you enjoy your fresh produce! Please leave a review to help other customers.</p>
      <p>Thank you for supporting local farmers! 🌾</p>
    `,
    sms: `Order #${orderNumber} completed. Enjoy your fresh produce! 🌾`
  }),

  orderCancelled: (orderNumber, farmName, reason) => ({
    emailSubject: `Order #${orderNumber} Cancelled`,
    emailHtml: `
      <h2>Order Cancelled</h2>
      <p>Unfortunately, your order #${orderNumber} from ${farmName} has been cancelled.</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ''}
      <p>If you have any questions, please contact the farmer.</p>
    `,
    sms: `Order #${orderNumber} from ${farmName} has been cancelled. ${reason || ''}`
  }),

  // Farmer notifications
  newOrder: (orderNumber, consumerName) => ({
    emailSubject: `New Order #${orderNumber} Received`,
    emailHtml: `
      <h2>New Order Received</h2>
      <p>You have a new order #${orderNumber} from ${consumerName}.</p>
      <p>Please review and confirm the order in your dashboard.</p>
    `,
    sms: `New order #${orderNumber} from ${consumerName}. Please confirm.`
  }),
};

// Send notification for order status change
async function sendOrderNotification({ type, order, farmerPhone, consumerPhone }) {
  const { order_number } = order;
  const farmName = order.farm_name || 'the farm';
  const consumerName = order.consumer_name || 'Customer';

  let template;

  switch (type) {
    case 'placed':
      // Notify farmer about new order
      template = templates.newOrder(order_number, consumerName);
      await Promise.all([
        sendOrderEmail({ to: farmerPhone, ...template }),
        sendOrderSMS({ to: farmerPhone, message: template.sms }),
      ]);
      break;

    case 'confirmed':
      // Notify consumer that order is confirmed
      template = templates.orderConfirmed(order_number, farmName);
      await Promise.all([
        sendOrderEmail({ to: consumerPhone, ...template }),
        sendOrderSMS({ to: consumerPhone, message: template.sms }),
      ]);
      break;

    case 'ready':
      // Notify consumer that order is ready
      template = templates.orderReady(order_number, farmName);
      await Promise.all([
        sendOrderEmail({ to: consumerPhone, ...template }),
        sendOrderSMS({ to: consumerPhone, message: template.sms }),
      ]);
      break;

    case 'completed':
      // Notify consumer that order is complete
      template = templates.orderCompleted(order_number, farmName);
      await Promise.all([
        sendOrderEmail({ to: consumerPhone, ...template }),
        sendOrderSMS({ to: consumerPhone, message: template.sms }),
      ]);
      break;

    case 'cancelled':
      // Notify the other party
      template = templates.orderCancelled(order_number, farmName, order.cancelled_reason);
      await Promise.all([
        sendOrderEmail({ to: consumerPhone, ...template }),
        sendOrderSMS({ to: consumerPhone, message: template.sms }),
      ]);
      break;

    default:
      console.log(`Unknown notification type: ${type}`);
  }
}

module.exports = { sendOrderNotification, sendOrderEmail, sendOrderSMS };
