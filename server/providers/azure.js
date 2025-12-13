const axios = require('axios');
const Pricing = require('../models/Pricing');

// Map UI service names to Azure serviceName values used by the Azure Retail Prices API
const azureServiceMap = {
  'Object Storage': 'Storage',
  'Virtual Machines (Compute)': 'Virtual Machines',
  'Relational Database Service': 'SQL Database',
  'NoSQL Database (Document-oriented)': 'Cosmos DB',
  'Serverless Functions': 'Functions',
};

async function getPricing({ service, region, currency } = {}) {
  const now = new Date().toISOString();
  const serviceName = azureServiceMap[service];
  if (!serviceName) {
    return { price: null, unit: null, raw: null, fetchedAt: now, error: 'unsupported_service' };
  }

  // Query Azure Retail Prices API
  const base = 'https://prices.azure.com/api/retail/prices';
  // Filter by serviceName; region filtering can be applied with armRegionName or location
  const filterParts = [`serviceName eq '${serviceName}'`];
  if (region) {
    // Azure uses armRegionName (sometimes location) – use armRegionName as a best-effort filter
    filterParts.push(`armRegionName eq '${region}'`);
  }
  const filter = encodeURIComponent(filterParts.join(' and '));
  const url = `${base}?$filter=${filter}`;

  try {
    const resp = await axios.get(url, { timeout: 3000 });
    const items = resp.data && resp.data.Items ? resp.data.Items : [];
    // console.log("azure.js -> resp: ", resp);
    console.log("azure.js -> items[0]: ", items[0]);

    // Try a simple normalization: find the first item that has unitPrice > 0
    if (items.length > 0) {
      const found = items.find(it => typeof it.unitPrice === 'number' && it.unitPrice > 0);
      if (found) {
        console.log("azure.js -> found positive unitPrice item", found);
        return {
          price: found.unitPrice,
          unit: found.unitOfMeasure || null,
          raw: resp.data,
          fetchedAt: now,
          source: 'azure-retail',
        };
      }
    }

    // If no simple price available, return raw data for now
    return { price: null, unit: null, raw: resp.data, fetchedAt: now, source: 'azure-retail', note: 'raw_returned' };
  } catch (err) {
    // fallback to DB
    try {
      const mappedPlatform = 'Azure ' + (service || '');
      const entry = await Pricing.findOne({ service, /* platform best-effort left to DB */ });
      if (entry) {
        return { price: entry.price, unit: entry.unit || null, raw: null, fetchedAt: now, source: 'db-fallback' };
      }
    } catch (dbErr) {
      console.error('Azure adapter DB fallback error:', dbErr && dbErr.message);
    }

    return { price: null, unit: null, raw: null, fetchedAt: now, error: err.message || 'fetch_error' };
  }
}

module.exports = { getPricing };
