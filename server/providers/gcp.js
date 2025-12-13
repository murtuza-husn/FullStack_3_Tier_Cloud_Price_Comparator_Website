const axios = require('axios');
const Pricing = require('../models/Pricing');

// GCP does not expose a single authenticated-free catalog API for all prices; there are a few
// public JSON snapshots used by various tools. This adapter tries a commonly used public price
// list and returns raw data; SKU-level normalization should be implemented per-service.

async function getPricing({ service, region, currency } = {}) {
  const now = new Date().toISOString();
  const url = 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json';
  console.log('gcp.js -> getPricing called', { service, region, currency, url });

  try {
  console.log('gcp.js -> fetching pricelist from URL');
  const resp = await axios.get(url, { timeout: 3000 });
  console.log('gcp.js -> fetched pricelist, status:', resp.status);
  // Try to find the first numeric-looking price in the returned pricelist JSON.
    // This is a heuristic: we walk the object depth-first and return the first
    // numeric or numeric-string value that looks like a price (e.g. "0.0123").
    function findFirstPrice(obj) {
      const seen = new Set();
      function dfs(value) {
        if (value === null || value === undefined) return null;
        // direct numeric value
        if (typeof value === 'number' && isFinite(value) && value > 0) return value;
        // numeric-like string (strip common formatting)
        if (typeof value === 'string') {
          const cleaned = value.replace(/[,\s]+/g, '').replace(/^\$/, '');
          if (/^\d+(?:\.\d+)?$/.test(cleaned)) {
            const n = Number(cleaned);
            if (isFinite(n) && n > 0) return n;
          }
        }
        // objects / arrays
        if (typeof value === 'object') {
          if (seen.has(value)) return null;
          seen.add(value);
          if (Array.isArray(value)) {
            for (const item of value) {
              const r = dfs(item);
              if (r != null) return r;
            }
          } else {
            for (const k of Object.keys(value)) {
              const r = dfs(value[k]);
              if (r != null) return r;
            }
          }
        }
        return null;
      }
      return dfs(obj);
    }

    const firstPrice = findFirstPrice(resp.data);
    console.log('gcp.js -> firstPrice result from payload:', firstPrice);
    return {
      price: firstPrice !== null ? firstPrice : null,
      unit: firstPrice !== null ? 'USD' : 'varies',
      raw: resp.data,
      fetchedAt: now,
      source: 'gcp-pricelist'
    };
  } catch (err) {
    console.log('gcp.js -> fetch error:', err && err.message);
    // DB fallback
    try {
      console.log('gcp.js -> attempting DB fallback for service:', service);
      const mappedPlatform = 'Cloud ' + (service || '');
      const entry = await Pricing.findOne({ service, /* platform left flexible */ });
      console.log('gcp.js -> DB fallback query result:', !!entry);
      if (entry) {
        console.log('gcp.js -> returning DB fallback price:', entry.price, entry.unit);
        return { price: entry.price, unit: entry.unit || null, raw: null, fetchedAt: now, source: 'db-fallback' };
      }
    } catch (dbErr) {
      console.log('gcp.js -> DB fallback error:', dbErr && dbErr.message);
      console.error('GCP adapter DB fallback error:', dbErr && dbErr.message);
    }
    console.log('gcp.js -> returning fetch error response');
    return { price: null, unit: null, raw: null, fetchedAt: now, error: err.message || 'fetch_error' };
  }
}

module.exports = { getPricing };
