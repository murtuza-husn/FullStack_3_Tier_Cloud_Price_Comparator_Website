const Pricing = require('../models/Pricing');
const awsAdapter = require('../providers/aws');
const azureAdapter = require('../providers/azure');
const gcpAdapter = require('../providers/gcp');

// Map from dropdown platform to actual service names in Pricing collection (same mapping as earlier)
const platformServiceMap = {
  AWS: {
    'Object Storage': 'Amazon S3',
    'Virtual Machines (Compute)': 'Amazon EC2',
    'Relational Database Service': 'Amazon RDS',
    'NoSQL Database (Document-oriented)': 'Amazon DynamoDB',
    'Serverless Functions': 'AWS Lambda',
  },
  Azure: {
    'Object Storage': 'Azure Blob Storage',
    'Virtual Machines (Compute)': 'Azure Virtual Machines',
    'Relational Database Service': 'Azure SQL Database',
    'NoSQL Database (Document-oriented)': 'Azure Cosmos DB',
    'Serverless Functions': 'Azure Functions',
  },
  'Google Cloud (GCP)': {
    'Object Storage': 'Cloud Storage',
    'Virtual Machines (Compute)': 'Compute Engine',
    'Relational Database Service': 'Cloud SQL',
    'NoSQL Database (Document-oriented)': 'Cloud Firestore',
    'Serverless Functions': 'Cloud Functions',
  },
  'Oracle Cloud': {
    'Object Storage': 'Object Storage',
    'Virtual Machines (Compute)': 'Compute VM Instances',
    'Relational Database Service': 'Autonomous Database',
    'NoSQL Database (Document-oriented)': 'Oracle NoSQL Database',
    'Serverless Functions': 'Oracle Functions',
  },
  'IBM Cloud': {
    'Object Storage': 'Object Storage',
    'Virtual Machines (Compute)': 'Virtual Servers',
    'Relational Database Service': 'Db2 on Cloud',
    'NoSQL Database (Document-oriented)': 'Cloudant',
    'Serverless Functions': 'Cloud Functions',
  },
  'Alibaba Cloud': {
    'Object Storage': 'Object Storage Service (OSS)',
    'Virtual Machines (Compute)': 'Elastic Compute Service (ECS)',
    'Relational Database Service': 'ApsaraDB RDS',
    'NoSQL Database (Document-oriented)': 'ApsaraDB for MongoDB',
    'Serverless Functions': 'Function Compute',
  },
};

// Orchestrator: for each requested platform/service, choose an adapter or fallback to DB.
async function getPricing({ platforms = [], services = [], region = null, currency = 'USD', refresh = false } = {}) {
  const pricingData = {};

  // Limit input sizes to avoid accidental overloads
  if (!Array.isArray(platforms) || !Array.isArray(services)) {
    throw new Error('platforms and services must be arrays');
  }

  const requests = [];

  for (const service of services) {
    pricingData[service] = {};
    for (const platform of platforms) {
  // Prepare a placeholder; will fill after the request resolves
  // We store a primitive price (number/string) in the response to match the client expectations
  pricingData[service][platform] = null;

      // Choose adapter for platform
      if (platform === 'AWS') {
        const p = awsAdapter.getPricing({ service, region, currency })
          .then(result => ({ service, platform, result }))
          .catch(err => ({ service, platform, result: { price: null, error: err.message } }));
        requests.push(p);
      } else if (platform === 'Azure') {
        const p = azureAdapter.getPricing({ service, region, currency })
          .then(result => ({ service, platform, result }))
          .catch(err => ({ service, platform, result: { price: null, error: err.message } }));
        requests.push(p);
      } else if (platform === 'Google Cloud (GCP)') {
        const p = gcpAdapter.getPricing({ service, region, currency })
          .then(result => ({ service, platform, result }))
          .catch(err => ({ service, platform, result: { price: null, error: err.message } }));
        requests.push(p);
      } else {
        // Fallback to DB lookup using mapping
        const mappedPlatform = platformServiceMap[platform]?.[service];
        const p = (async () => {
          const now = new Date().toISOString();
          if (!mappedPlatform) {
            return { service, platform, result: { price: null, unit: null, raw: null, fetchedAt: now, source: 'unsupported' } };
          }
          try {
            const entry = await Pricing.findOne({ platform: mappedPlatform, service });
            if (entry) {
              return { service, platform, result: { price: entry.price, unit: entry.unit || null, raw: null, fetchedAt: now, source: 'db' } };
            }
            return { service, platform, result: { price: null, unit: null, raw: null, fetchedAt: now, source: 'db-miss' } };
          } catch (err) {
            return { service, platform, result: { price: null, unit: null, raw: null, fetchedAt: now, source: 'db-error', error: err.message } };
          }
        })();
        requests.push(p);
      }
    }
  }

  const settled = await Promise.allSettled(requests);
  for (const settledItem of settled) {
    if (settledItem.status === 'fulfilled') {
      const { service, platform, result } = settledItem.value;
      // Adapter result objects look like { price, unit, raw, fetchedAt, source, ... }
      // The client expects a primitive price value (or null). Prefer result.price when present.
      let value = null;
      if (result && Object.prototype.hasOwnProperty.call(result, 'price')) {
        value = result.price;
      } else if (result !== null && result !== undefined) {
        // If adapter returned a primitive directly, use it.
        value = result;
      }
      pricingData[service][platform] = value;
    } else {
      // This should be rare; set an error marker
      const v = settledItem.reason || {};
      // We don't have service/platform context here; skip deep assignment.
      console.error('Unexpected rejection in pricingService:', v);
    }
  }

  return pricingData;
}

module.exports = { getPricing };
