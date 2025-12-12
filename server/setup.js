// setup.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Pricing = require("./models/Pricing");

// 1️⃣ Connect to MongoDB (FullStackProjectDB)


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected successfully to FullStackProjectDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));


// 2️⃣ Create example data
const createExampleData = async () => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 10);


    // Example users
    const users = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: hashedPassword
      },
      {
        firstName: "Khushbu",
        lastName: "Rathva",
        email: "khushburathva607@gmail.com",
        phone: "9876543210",
        password: hashedPassword
      }
    ];
    await User.deleteMany({});
    for (const u of users) {
      const user = new User(u);
      await user.save();
      console.log("User saved:", user);
    }


    // Clear existing pricing data to avoid duplicates
    await Pricing.deleteMany({});

    // Pricing data
    const pricingData = [
      // Object Storage
      { platform: "Amazon S3", service: "Object Storage", price: 0.023 },
      { platform: "Azure Blob Storage", service: "Object Storage", price: 0.018 },
      { platform: "Cloud Storage", service: "Object Storage", price: 0.020 },
      { platform: "Object Storage", service: "Object Storage", price: 0.025 }, // Oracle Cloud
      { platform: "Object Storage", service: "Object Storage", price: 0.021 }, // IBM Cloud
      { platform: "Object Storage Service (OSS)", service: "Object Storage", price: 0.017 }, // Alibaba Cloud

      // Virtual Machines (Compute)
      { platform: "Amazon EC2", service: "Virtual Machines (Compute)", price: 0.012 },
      { platform: "Azure Virtual Machines", service: "Virtual Machines (Compute)", price: 0.008 },
      { platform: "Compute Engine", service: "Virtual Machines (Compute)", price: 0.010 },
      { platform: "Compute VM Instances", service: "Virtual Machines (Compute)", price: 0.012 }, // Oracle Cloud
      { platform: "Virtual Servers", service: "Virtual Machines (Compute)", price: 0.009 }, // IBM Cloud
      { platform: "Elastic Compute Service (ECS)", service: "Virtual Machines (Compute)", price: 0.007 }, // Alibaba Cloud

      // Relational Database Service
      { platform: "Amazon RDS", service: "Relational Database Service", price: 0.025 },
      { platform: "Azure SQL Database", service: "Relational Database Service", price: 0.021 },
      { platform: "Cloud SQL", service: "Relational Database Service", price: 0.020 },
      { platform: "Autonomous Database", service: "Relational Database Service", price: 0.030 }, // Oracle Cloud
      { platform: "Db2 on Cloud", service: "Relational Database Service", price: 0.022 }, // IBM Cloud
      { platform: "ApsaraDB RDS", service: "Relational Database Service", price: 0.019 }, // Alibaba Cloud

      // NoSQL Database (Document-oriented)
      { platform: "Amazon DynamoDB", service: "NoSQL Database (Document-oriented)", price: 0.025 },
      { platform: "Azure Cosmos DB", service: "NoSQL Database (Document-oriented)", price: 0.024 },
      { platform: "Cloud Firestore", service: "NoSQL Database (Document-oriented)", price: 0.023 },
      { platform: "Oracle NoSQL Database", service: "NoSQL Database (Document-oriented)", price: 0.022 },
      { platform: "Cloudant", service: "NoSQL Database (Document-oriented)", price: 0.021 }, // IBM Cloud
      { platform: "ApsaraDB for MongoDB", service: "NoSQL Database (Document-oriented)", price: 0.020 }, // Alibaba Cloud

      // Serverless Functions
      { platform: "AWS Lambda", service: "Serverless Functions", price: 0.00001667 },
      { platform: "Azure Functions", service: "Serverless Functions", price: 0.000016 },
      { platform: "Cloud Functions", service: "Serverless Functions", price: 0.000016 }, // GCP
      { platform: "Oracle Functions", service: "Serverless Functions", price: 0.000017 },
      { platform: "Cloud Functions", service: "Serverless Functions", price: 0.0000165 }, // IBM Cloud
      { platform: "Function Compute", service: "Serverless Functions", price: 0.000016 } // Alibaba Cloud
    ];
    for (const p of pricingData) {
      const pricing = new Pricing(p);
      await pricing.save();
      console.log("Pricing saved:", pricing);
    }

    mongoose.disconnect(); // Disconnect after saving
  } catch (err) {
    console.error(err);
  }
};

createExampleData();
