const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Import cors
require("dotenv").config();

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use any email service you prefer
  auth: {
    user: process.env.EMAIL_USER,  // Your email address
    pass: process.env.EMAIL_PASS,   // Your email password or app-specific password
  },
});

// Function to send email
const sendEmail = async (userEmail, transactionData, orderDetails) => {
  try {
    const mailOptions = {
      from: 'anstationery1@gmail.com',
      to: [userEmail, 'anstationery1@gmail.com'], // Send email to both the user and your admin email
      subject: 'Transaction Details and Order Summary',
      html: `
        <h2>Transaction Details</h2>
        <p><strong>Transaction Code:</strong> ${transactionData.transaction_code}</p>
        <p><strong>Amount:</strong> Rs ${transactionData.total_amount}</p>
        <p><strong>UUID:</strong> ${transactionData.transaction_uuid}</p>
        
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>Rs ${item.price.toFixed(2)}</td>
                <td>${item.stock || 1}</td>
                <td>Rs ${(item.price * (item.stock || 1)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><strong>Grand Total:</strong> Rs ${orderDetails.total.toFixed(2)}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Emails sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

app.post('/send-transaction-email', async (req, res) => {
  const { userEmail, transactionData, orderDetails } = req.body;
  await sendEmail(userEmail, transactionData, orderDetails);
  res.status(200).json({ message: 'Emails sent successfully!' });
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
