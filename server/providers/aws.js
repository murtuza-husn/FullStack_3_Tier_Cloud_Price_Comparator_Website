const axios = require('axios');
const Pricing = require('../models/Pricing');

// Map UI service names to AWS offer codes and DB platform names
const awsServiceMap = {
  'Object Storage': { offerCode: 'AmazonS3', dbPlatform: 'Amazon S3' },
  'Virtual Machines (Compute)': { offerCode: 'AmazonEC2', dbPlatform: 'Amazon EC2' },
  'Relational Database Service': { offerCode: 'AmazonRDS', dbPlatform: 'Amazon RDS' },
  'NoSQL Database (Document-oriented)': { offerCode: 'AmazonDynamoDB', dbPlatform: 'Amazon DynamoDB' },
  'Serverless Functions': { offerCode: 'AWSLambda', dbPlatform: 'AWS Lambda' },
};

// Simple AWS adapter that fetches the raw Price List offer and returns a normalized-ish result.
// Note: AWS Price List responses are large and complex; this adapter returns the raw offer by default
// and provides a place to implement SKU-specific normalization later. It falls back to the local
// Pricing collection when a live fetch fails.
async function getPricing({ service, region, currency } = {}) {
  const now = new Date().toISOString();
  const map = awsServiceMap[service];
  if (!map) {
    return { price: null, unit: null, raw: null, fetchedAt: now, error: 'unsupported_service' };
  }

  const { offerCode, dbPlatform } = map;
  const url = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/${offerCode}/current/index.json`;
  console.log('aws.js -> url: ', url);

  try {
    const resp = await axios.get(url, { timeout: 3000 });
    // Try to extract a reasonable price point from the AWS Price List response.
    let price = null;
    let unit = 'varies';
    try {
      const data = resp.data || {};
      // Prefer OnDemand pricing if available
      const od = (data.terms && data.terms.OnDemand) || (data.terms && data.terms['OnDemand']) || null;
      let found = false;
      if (od && typeof od === 'object') {
        let minPrice = Number.POSITIVE_INFINITY;
        let minUnit = null;
        for (const skuId of Object.keys(od)) {
          const skuTerms = od[skuId];
          for (const termId of Object.keys(skuTerms || {})) {
            const term = skuTerms[termId];
            const dims = term.priceDimensions || term['priceDimensions'];
            if (!dims) continue;
            for (const pdId of Object.keys(dims)) {
              const pd = dims[pdId];
              const ppuObj = pd.pricePerUnit || {};
              // prefer USD, otherwise take first currency found
              const priceStr = (ppuObj.USD != null) ? ppuObj.USD : Object.values(ppuObj)[0];
              const num = Number(priceStr);
              if (!Number.isNaN(num) && num < minPrice) {
                minPrice = num;
                console.log("aws.js -> minPrice: ", minPrice);
                minUnit = pd.unit || minUnit;
                found = true;
              }
            }
          }
        }
        if (found) {
          console.log("aws.js -> price found from onDemand");
          price = minPrice;
          unit = minUnit || unit;
        }
      }

      // As a last resort, try to find any numeric pricePerUnit anywhere in the payload.
      if (price == null) {
        const stack = [data];
        let min = Number.POSITIVE_INFINITY;
        let minU = null;
        while (stack.length) {
          const obj = stack.pop();
          if (!obj || typeof obj !== 'object') continue;
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            if (k === 'pricePerUnit' && typeof v === 'object') {
              const priceStr = v.USD || Object.values(v)[0];
              const num = Number(priceStr);
              if (!Number.isNaN(num) && num < min) {
                min = num;
                minU = (obj.unit || obj['unit'] || minU);
              }
            } else if (typeof v === 'object') {
              stack.push(v);
            }
          }
        }
        if (min !== Number.POSITIVE_INFINITY) {
          console.log("aws.js -> any numeric pricePerUnit");
          price = min;
          unit = minU || unit;
        }
      }
    } catch (parseErr) {
      console.error('aws.js parse error:', parseErr && parseErr.message);
    }
    console.log("aws.js -> price", price);
    return {
      price,
      unit,
      raw: resp.data,
      fetchedAt: now,
      source: 'aws-offer',
      note: price == null ? 'Raw AWS Price List returned; no price extracted.' : 'Extracted price from AWS offer (best-effort).'
    };
  } catch (err) {
    // On error, try to fall back to Pricing collection
    try {
      const entry = await Pricing.findOne({ platform: dbPlatform, service });
      if (entry) {
        return { price: entry.price, unit: entry.unit || null, raw: null, fetchedAt: now, source: 'db-fallback' };
      }
    } catch (dbErr) {
      // ignore DB fallback errors, return original error below
      console.error('AWS adapter DB fallback error:', dbErr && dbErr.message);
    }

    return { price: null, unit: null, raw: null, fetchedAt: now, error: err.message || 'fetch_error' };
  }
}

module.exports = { getPricing };
