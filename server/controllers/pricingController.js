const Pricing = require("../models/Pricing");

// Mapping from dropdown platform to actual service names in Pricing collection
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

exports.getPricing = async (req, res) => {
	try {
		const { platforms, services } = req.body;
		// Build queries for all combinations
		const queries = [];
		for (const platform of platforms) {
			for (const service of services) {
				const mappedPlatform = platformServiceMap[platform]?.[service];
				if (mappedPlatform) {
					queries.push({ platform: mappedPlatform, service: service });
				}
			}
		}
		// Find all matching pricing entries
		const results = await Pricing.find({ $or: queries });

		// Format as nested object: pricingData[service][platform] = price
		const pricingData = {};
		for (const service of services) {
			pricingData[service] = {};
			for (const platform of platforms) {
				const mappedPlatform = platformServiceMap[platform]?.[service];
				if (mappedPlatform) {
					const entry = results.find(r => r.platform === mappedPlatform && r.service === service);
					pricingData[service][platform] = entry ? entry.price : null;
				} else {
					pricingData[service][platform] = null;
				}
			}
		}
		res.json(pricingData);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
};
