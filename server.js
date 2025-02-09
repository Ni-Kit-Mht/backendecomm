const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Configure CORS to allow frontend requests
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"], // Add frontend URLs
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
const sendEmail = async (userEmail, transactionData, orderDetails) => {
  try {
    const mailOptions = {
      from: "anstationery1@gmail.com",
      to: [userEmail, "anstationery1@gmail.com"],
      subject: "Transaction Details and Order Summary",
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
            ${orderDetails.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>Rs ${item.price.toFixed(2)}</td>
                <td>${item.stock || 1}</td>
                <td>Rs ${(item.price * (item.stock || 1)).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p><strong>Grand Total:</strong> Rs ${orderDetails.total.toFixed(2)}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Emails sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

app.post("/send-transaction-email", async (req, res) => {
  console.log("Received request at /send-transaction-email:", req.body);
  const { userEmail, transactionData, orderDetails } = req.body;

  if (!userEmail || !transactionData || !orderDetails) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendEmail(userEmail, transactionData, orderDetails);
    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ✅ Debugging route to check if the server is running
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
