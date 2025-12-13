// setup.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { PricingClient, GetProductsCommand } = require("@aws-sdk/client-pricing");
const axios = require('axios');

// Early startup log and global error handlers to surface why logs may be missing
console.log('setup.js: starting script');
process.on('unhandledRejection', (reason, promise) => {
  console.error('setup.js: Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('setup.js: Uncaught Exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});
// Import models
const User = require("./models/User");
const Pricing = require("./models/Pricing");

// 1️⃣ Connect to MongoDB (FullStackProjectDB)


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected successfully to FullStackProjectDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));


// AWS Pricing client (Pricing API must use us-east-1)
const awsPricing = new PricingClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

//Ec2 price from aws api 
async function getAwsEc2Price() {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AmazonEC2",
      Filters: [
        { Type: "TERM_MATCH", Field: "productFamily", Value: "Compute Instance" },
        { Type: "TERM_MATCH", Field: "instanceType", Value: "t3.micro" },
        { Type: "TERM_MATCH", Field: "location", Value: "Canada (Central)" },
        { Type: "TERM_MATCH", Field: "operatingSystem", Value: "Linux" },
        { Type: "TERM_MATCH", Field: "preInstalledSw", Value: "NA" },
        { Type: "TERM_MATCH", Field: "tenancy", Value: "Shared" },
        { Type: "TERM_MATCH", Field: "termType", Value: "OnDemand" },
      ],
      FormatVersion: "aws_v1",
    });

    const response = await awsPricing.send(command);

    if (!response.PriceList || response.PriceList.length === 0) {
      console.warn("No AWS pricing data found for this filter");
      return null;
    }

    // Parse the first price item
    const priceItem = JSON.parse(response.PriceList[0]);

    const onDemand = priceItem.terms?.OnDemand;
    if (!onDemand) return null;

    const priceDimensions = Object.values(onDemand)[0]?.priceDimensions;
    if (!priceDimensions) return null;

    const pricePerHour = Object.values(priceDimensions)[0]?.pricePerUnit?.USD;
    const priceUnit =Object.values(priceDimensions)[0]?.unit;
    console.log(priceUnit);
    return pricePerHour ? {"price_per_hour":parseFloat(pricePerHour) ,"unit":priceUnit} : null;

  } catch (err) {
    console.error("Error fetching AWS price:", err.message);
    return null;
  }
}

async function getS3Price() {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AmazonS3",
      Filters: [
        // { Type: "TERM_MATCH", Field: "productFamily", Value: "Storage" },
        // { Type: "TERM_MATCH", Field: "storageClass", Value: "Standard" },
        // { Type: "TERM_MATCH", Field: "location", Value: "Canada (Central)" },
        // { Type: "TERM_MATCH", Field: "termType", Value: "OnDemand" }
         { Type: "TERM_MATCH", Field: "productFamily", Value: "Storage" },
         { Type: "TERM_MATCH", Field: "location", Value: "Canada (Central)" },
         { Type: "TERM_MATCH", Field: "termType", Value: "OnDemand" }
      ],
      FormatVersion: "aws_v1",
    });

    const response = await awsPricing.send(command);

    if (!response.PriceList || response.PriceList.length === 0) {
      console.warn("No AWS S3 pricing data found for these filters");
      return null;
    }

    // Parse JSON from AWS
    const priceItem = JSON.parse(response.PriceList[0]);
    
    const onDemand = priceItem.terms?.OnDemand;
    if (!onDemand) return null;

    const priceDimensions = Object.values(onDemand)[0]?.priceDimensions;
    if (!priceDimensions) return null;

    const pricePerGBMonth = Object.values(priceDimensions)[0]?.pricePerUnit?.USD;
    const priceUnit =Object.values(priceDimensions)[0]?.unit;

    return pricePerGBMonth ? {"price_unit":priceUnit, "price": parseFloat(pricePerGBMonth) }: null;

  } catch (err) {
    console.error("Error fetching S3 price:", err.message);
    return null;
  }
}

async function getRdsPrice() {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AmazonRDS",
      Filters: [
        { Type: "TERM_MATCH", Field: "instanceType", Value: "db.t3.micro" },
        { Type: "TERM_MATCH", Field: "databaseEngine", Value: "PostgreSQL" },
        { Type: "TERM_MATCH", Field: "deploymentOption", Value: "Single-AZ" },
        { Type: "TERM_MATCH", Field: "location", Value: "Canada (Central)" },
        { Type: "TERM_MATCH", Field: "productFamily", Value: "Database Instance" },
        { Type: "TERM_MATCH", Field: "termType", Value: "OnDemand" }
      ],
      FormatVersion: "aws_v1"
    });

    const response = await awsPricing.send(command);

    if (!response.PriceList || response.PriceList.length === 0) {
      console.warn("No AWS RDS pricing data found for these filters");
      return null;
    }

    const priceItem = JSON.parse(response.PriceList[0]);

    const onDemand = priceItem.terms?.OnDemand;
    if (!onDemand) return null;

    const priceDimensions = Object.values(onDemand)[0]?.priceDimensions;
    if (!priceDimensions) return null;

    const pricePerHour = Object.values(priceDimensions)[0]?.pricePerUnit?.USD;
    const priceUnit =Object.values(priceDimensions)[0]?.unit;
    
    return pricePerHour ?{"price_unit":priceUnit, "price": parseFloat(pricePerHour) }: null;


  } catch (err) {
    console.error("Error fetching RDS price:", err.message);
    return null;
  }
}

async function getLambdaRequestPrice() {
  try {
    const command = new GetProductsCommand({
      ServiceCode: "AWSLambda",
      Filters: [
            // { Type: "TERM_MATCH", Field: "productFamily", Value: "AWS Lambda-Requests" }
        //  { Type: "TERM_MATCH", Field: "productFamily", Value: "AWS Lambda-Requests" },
        //  { Type: "TERM_MATCH", Field: "location", Value: "Canada Central" }
      ],
      FormatVersion: "aws_v1"
    });

    const response = await awsPricing.send(command);

    if (!response.PriceList || response.PriceList.length === 0) {
      console.warn("No Lambda Requests pricing found");
      return null;
    }

    const item = JSON.parse(response.PriceList[0]);
    const onDemand = item.terms?.OnDemand;
    if (!onDemand) return null;

    const priceDimensions = Object.values(onDemand)[0]?.priceDimensions;
    if (!priceDimensions) return null;

    const price = Object.values(priceDimensions)[0]?.pricePerUnit?.USD;
    const priceUnit =Object.values(priceDimensions)[0]?.unit;
    return price ?{"price_unit":priceUnit,"price":parseFloat(price)}  : null;

  } catch (err) {
    console.error("Lambda Requests error:", err.message);
    return null;
  }
}

// Azure pricing helper: query Azure Retail Prices API and return normalized price object
async function getAzurePrice({ service, region, currency } = {}) {
  const now = new Date().toISOString();
  const azureServiceMap = {
    'Object Storage': 'Storage',
    'Virtual Machines (Compute)': 'Virtual Machines',
    'Relational Database Service': 'SQL Database',
    'NoSQL Database (Document-oriented)': 'Cosmos DB',
    'Serverless Functions': 'Functions',
  };

  const serviceName = azureServiceMap[service];
  if (!serviceName) return { price: null, unit: null, raw: null, fetchedAt: now, error: 'unsupported_service' };

  const base = 'https://prices.azure.com/api/retail/prices';
  const filterParts = [`serviceName eq '${serviceName}'`];
  // Normalize region to Azure armRegionName values (e.g. "Canada (Central)" -> "canadacentral")
  if (region) {
    const regionNormalized = String(region).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (regionNormalized) filterParts.push(`armRegionName eq '${regionNormalized}'`);
  }
  const filter = encodeURIComponent(filterParts.join(' and '));
  const url = `${base}?$filter=${filter}`;

  // Debug: show constructed URL/filter so callers can see why queries may return empty
  console.log(`getAzurePrice -> url=${url}`);

  try {
    const resp = await axios.get(url, { timeout: 5000 });
    const items = resp && resp.data && resp.data.Items ? resp.data.Items : [];
    // Prefer the first item with a positive unitPrice
    if (items.length > 0) {
      const found = items.find(it => typeof it.unitPrice === 'number' && it.unitPrice > 0);
      if (found) {
        console.log("getAzurePrice -> found price....");
        console.log("found.unitPrice: ", found.unitPrice);
        return {
          price: found.unitPrice,
          unit: found.unitOfMeasure || null,
          raw: resp.data,
          fetchedAt: now,
          source: 'azure-retail',
        };
      }
    }

    return { price: null, unit: null, raw: resp.data, fetchedAt: now, source: 'azure-retail', note: 'raw_returned' };
  } catch (err) {
    console.error('Error fetching Azure price:', err && err.message);
    return { price: null, unit: null, raw: null, fetchedAt: now, error: err && err.message };
  }
}


// 2️⃣ Create example data
const createExampleData = async () => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const ec2price = await getAwsEc2Price();
    const s3price = await getS3Price();
    const rdsprice = await getRdsPrice();
    // AWS Lambda price (await the helper)
    const lambdaPrice = await getLambdaRequestPrice();

  // Azure prices (best-effort, region: Canada (Central))
  const azureStorage = await getAzurePrice({ service: 'Object Storage', region: 'Canada (Central)' });
  const azureVm = await getAzurePrice({ service: 'Virtual Machines (Compute)', region: 'Canada (Central)' });
  const azureSql = await getAzurePrice({ service: 'Relational Database Service', region: 'Canada (Central)' });
  const azureFunctions = await getAzurePrice({ service: 'Serverless Functions', region: 'Canada (Central)' });

  // Log Azure fetch results so we can inspect returned objects (price, unit, raw, fetchedAt, etc.)
  console.log('\n--- Azure pricing fetch results ---');
  console.log('azureStorage. price =>', azureStorage.price);
  console.log('azureVm.price =>', azureVm.price);
  console.log('azureSql.price =>', azureSql.price);
  console.log('azureFunctions.price =>', azureFunctions.price);

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

  // var os_a = api call
    // Pricing data
    const pricingData = [
      // Object Storage
      { platform: "Amazon S3", service: "Object Storage", price: s3price?.price ?? 0.023 },
      { platform: "Azure Blob Storage", service: "Object Storage", price: azureStorage?.price ?? 0.018, unit: azureStorage?.unit },
      { platform: "Cloud Storage", service: "Object Storage", price: 0.020 },
      { platform: "Object Storage", service: "Object Storage", price: 0.025 }, // Oracle Cloud
      { platform: "Object Storage", service: "Object Storage", price: 0.021 }, // IBM Cloud
      { platform: "Object Storage Service (OSS)", service: "Object Storage", price: 0.017 }, // Alibaba Cloud

      // Virtual Machines (Compute)
      { platform: "Amazon EC2", service: "Virtual Machines (Compute)", price: ec2price?.price_per_hour ?? 0.010, unit: ec2price?.unit },
      { platform: "Azure Virtual Machines", service: "Virtual Machines (Compute)", price: azureVm?.price ?? 0.008, unit: azureVm?.unit },
      { platform: "Compute Engine", service: "Virtual Machines (Compute)", price: 0.010 },
      { platform: "Compute VM Instances", service: "Virtual Machines (Compute)", price: 0.012 }, // Oracle Cloud
      { platform: "Virtual Servers", service: "Virtual Machines (Compute)", price: 0.009 }, // IBM Cloud
      { platform: "Elastic Compute Service (ECS)", service: "Virtual Machines (Compute)", price: 0.007 }, // Alibaba Cloud

      // Relational Database Service
      { platform: "Amazon RDS", service: "Relational Database Service", price: rdsprice?.price ?? 0.025, unit: rdsprice?.price_unit },
      { platform: "Azure SQL Database", service: "Relational Database Service", price: azureSql?.price ?? 0.021, unit: azureSql?.unit },
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
      { platform: "AWS Lambda", service: "Serverless Functions", price: lambdaPrice?.price ?? 0.0000002, unit: lambdaPrice?.price_unit },
      { platform: "Azure Functions", service: "Serverless Functions", price: azureFunctions?.price ?? 0.000016, unit: azureFunctions?.unit },
      { platform: "Cloud Functions", service: "Serverless Functions", price: 0.000016 }, // GCP
      { platform: "Oracle Functions", service: "Serverless Functions", price: 0.000017 },
      { platform: "Cloud Functions", service: "Serverless Functions", price: 0.0000165 }, // IBM Cloud
      { platform: "Function Compute", service: "Serverless Functions", price: 0.000016 } // Alibaba Cloud
    ];
    for (const p of pricingData) {
      const pricing = new Pricing(p);
      await pricing.save();
      // console.log("Pricing saved:", pricing);
    }

    mongoose.disconnect(); // Disconnect after saving
  } catch (err) {
    console.error(err);
  }
};

createExampleData();
