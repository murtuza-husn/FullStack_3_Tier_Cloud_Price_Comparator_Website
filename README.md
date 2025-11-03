# FullStack_3_Tier_Cloud_Price_Comparator_Website
A Full Stack - 3 Tier (FrontEnd, BackEnd and DB) Cloud Price Comparator Website.

# 🏗 Cloud Cost Comparator – Project Proposal

### Project Lead : 
Murtuza Hussain, Mohammed (c0950760).
### Team Members
Keshav Koirala– Frontend Developer (c0944046).
Khushboo Rathva – Backend Developer (c0947900).
Gurpreet Singh – Database Engineer (c0932560).

## 1. Abstract / Executive Summary
## Project Overview
The Cloud Cost Comparator is a 3-tier web-based software application designed to help users
compare the pricing of key cloud computing services across major cloud providers — Amazon
Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP).
The application aims to simplify decision-making for individuals and businesses who seek cost
transparency while selecting cloud resources such as Compute (EC2/VMs), Storage
(S3/Blob/GCS), Databases (RDS/SQL/Firestore), Load Balancers, Notification,
and Monitoring services.
### Abstract
Problem/Need: Cloud service selection is overwhelming and laborious. Pricing, tiers, and
regions vary with specific providers like AWS, Azure, and Google Cloud; major cost drivers are
hidden across dozens of pages: storage classes, data egress, request charges to name a few.
Students, startups, and small teams make partial-information decisions on a regular basis that
lead to overspending or sub-optimally designed solutions. There is an apparent need for an easy
way to see side-by-side costs and value estimates of common services from multiple providers.
### What to Be Done: Our project will clearly compare different major cloud providers on an
apples-to-apples basis in core service categories such as virtual machines, object storage, and
managed databases. A user will select their service category, region, and basic usage
assumptions, and the application will return a ranked list of options including a plain-language
breakdown of the main cost components and trade-offs that matter. The experience will
emphasize clarity, transparency, and consistency so users can confidently make choices quickly.
How It Will Be Done: We will design a focused, easy-to-use web application that aggregates
existing pricing information and presents it in one standard format. The interface will point out
important assumptions, summarize the estimated total monthly cost, and describe "what's
included," such as capacity, storage, and average network charges. Users will be allowed to save
or download a concise summary of their comparison for future reference. The proposal phase
will develop the plan, structure, and sample screens; the final phase will deliver a working
demonstration.
### Who Will Benefit
• StartUps and project teams that need to make fast, defensible comparisons within design reviews.
• Startups and small organizations seeking clear, unbiased cost visibility before signing up with a platform.
• Instructors and clubs seeking a hands-on tool for teaching total cost of ownership an cost-aware architecture.
Outcome/Impact: Reducing the time spent on research by making trade-offs explicit, the project
supports users to make choices among cloud services that fit their budget and meet their needs.
The result is a straightforward and trustworthy view of the price-value question across providers,
supporting smarter decisions and better learning outcomes.

### Key Features
• User authentication and personalized history.
• Real-time or cached API calls to cloud pricing endpoints.
• Email delivery of summarized comparison reports.
• Historical report storage in AWS S3.
• Deployed locally or on AWS EC2.

# 2. Statement of Need
# Problem Statement
Cloud computing has shaped the way businesses and developers build, deploy, and scale digital
solutions rapidly. One big hurdle remains, however: a concerning lack of transparency and
consistency in pricing across different cloud service providers, such as AWS, Microsoft Azure,
and GCP. Each of them has its pricing model, terminology, and regional pricing structure, which
makes it very tough for users to accurately compare the costs and make informed decisions.
This is an important problem because cloud spending is a large portion of operational costs for
startups, enterprises, and academic projects alike. This can cause overpayments for services,
misallocated resources, and wasted time manually trying to make sense of complicated pricing
data. Further, the lack of a single view on cloud pricing holds back smaller organizations from
being able to effectively optimize their infrastructure costs and reinforces a gap between large
corporations and smaller innovators.

Our proposed Cloud Price Comparison Web Application directly addresses this problem by
aggregating and standardizing pricing data from major cloud providers into an intuitive,
searchable interface. The platform allows users to compare compute, storage, and networking
costs across multiple providers, filtered by region, configuration, and usage patterns.

### Public Benefit:
The solution fosters transparency, efficiency, and financial fairness in the ecosystem of cloud
computing. By so doing, it allows people, startups, researchers, and enterprises to make informed
cloud purchasing decisions based on appropriate data, minimizing waste, encouraging
innovation, and ensuring healthy competition within cloud vendors. This tool will help the
greater good for the technology community: ensuring cloud computing is more usable and
economically viable for everyone.

## 3. Project Activity, Methodology, and Outcomes
### 3.1 Overview of Activities
The project is divided into four major modules —The project will be developed using
a 3-tier architecture approach — Frontend, Backend, and Database — with cloud
integration for data storage, notifications, and cost comparison API access.

Key Activities:
## Activity Description Responsible Person
### 1 Frontend Development
Design and develop the user interface using
React/Vanilla JS. Implement 3 web pages: Login,
Selection, and Results Page.
- Keshav
### 2 Backend Development
Build APIs to handle user authentication, pricing data
fetching, report generation, and SNS-based notifications.
- Khushboo Rathva
### 3 Backend, Cloud Integration & DevOps
Connect backend with cloud APIs (AWS, GCP, Azure).
Implement S3 integration for file storage and SNS/email
notifications. Deploy app using EC2.
- Murtuza Hussain
### 4 Database Design and Integration
Create and manage relational database (AWS RDS –
MySQL/PostgreSQL). Store user login info, saved
results, and report metadata.
- Gurpreet Singh
  
## 3.2 Detailed Functionality Breakdown
Web Page Functionality Cloud Interaction
### 1. Login Page
Users sign up or log in using their credentials
(username, name, email, password). User data
stored in RDS.
RDS for storage; SNS or
Python SMTP for email
notification after registration or
report generation.
### 2. Selection Page
Users select: (a) Cloud providers (AWS, Azure,
GCP), (b) Services to compare (Storage, Compute,
Database, Load Balancer, Monitoring,
Notifications). Backend fetches pricing via APIs.
Connects to cloud pricing APIs
(AWS Pricing API, Azure
Retail Prices API, GCP Cloud
Billing API).
### 3. Results Page
Displays previous and current pricing comparison results. Fetches historical results saved in S3 buckets. Uses AWS S3 SDK to retrieve report files. 
Allows user to download or view summary.

## 3.3 Methodology
The project will follow a hybrid Agile model (Scrum-like) with weekly progress check-ins and
integration testing at every milestone.

### Approach:
1. Design Phase – Develop architecture, cloud service mapping, and wireframes.
2. Incremental Development – Frontend and backend built in parallel.
3. Integration – Connect backend APIs with the database and cloud services.
4. Testing & Validation – Verify accuracy of price comparison and service performance.
5. Deployment – Host on AWS EC2 or locally using Docker for final demonstration.

## 3.4 Expected Outcomes
1. Functional 3-tier web application hosted locally or on AWS EC2.
2. User login system with personalized cost comparison reports.
3. Real-time or cached cloud pricing data comparison across AWS, GCP, and Azure.
4. Automated notification sent to user via email/SNS after comparison is generated.
5. Historical reports stored and retrieved from S3.
6. Dashboard-style display for price summary and provider ranking.

## 3.5 Project Timeline
Phase Tasks Responsible
Members Duration Expected Output
### Phase 1: Requirements & Design Requirement gathering 
Architecture design, database schema, cloud service setup. All 5 days Design document, database ERD, architecture diagram
### Phase 2: Frontend Development
Create 3 web pages (Login,Selection, Results) using React/JS. Build responsive UI.
Keshav 10 days Functional frontend with navigation
### Phase 3: Backend Development
Build APIs for login/auth, comparison logic, data fetch from cloud APIs.
Khushboo 10 days REST API endpoints ready
### Phase 4: Cloud Integration & DevOps
Integrate APIs with AWS (S3, SNS), test cloud pricing retrieval, configure EC2 deployment.
Murtuza 8 day Cloud-integrated backend, deployed app
### Phase 5: Database Setup & Testing
Create RDS schema, link tobackend, test login and report persistence.
Gurpreet 6 days Database fully functional
### Phase 6: Final Testing & Documentation
System testing, bug fixes, final deployment, prepare report.
All 6 days Working system demo and proposal submission

## 3.6 Technology Stack
Category Technology / Tool Purpose / Justification
### Frontend
React.js / Vanilla JS, HTML5, CSS3 Build interactive and responsive web UI
### Backend
Python (Flask/Django Framework) Handle API requests, data processing, and business logic
### Database
AWS RDS (MySQL) Store user data and report metadata (relational)
### Cloud Services
AWS S3 (Storage), AWS SNS (Notifications),
AWS EC2 (Deployment)
Minimal but sufficient cloud integration for demo
APIs Used AWS Pricing API, Azure Retail Prices API,
Google Cloud Billing API Fetch real-time pricing data

### Tools 
Docker, 
GitHub, 
AWS EC2 Deployment and version control Other Tools
Postman (API Testing), 
ArchiMate (Architecture Diagrams), 
Lucidchart (Workflow Design)Design and testing

## 3.7 Technologies | DATABASES | Cloud Services.
To demonstrate functionality without high costs: Service Cloud Provider Purpose
EC2 Instance AWS Host backend app
RDS MySQL AWS Relational database
S3 Bucket AWS Store reports (JSON/CSV)
SNS Topic AWS Email notifications

## 3.8 System Architecture Diagram
Created by : ArchiMate tool. Gantt chart
A flowchart for user interactions:
1. Login
2. Select Provider/Service/Calculate
3. View Results
4. Receive Report Email.

## 3.9 Functional Workflow
### Page 1: Login / Registration
• User registers using name, email, and password.
• Credentials stored in AWS RDS (MySQL).
• On registration, a confirmation email is sent via AWS SNS or Python SMTP.
### Page 2: Selection Page
• User selects:
1. Cloud Providers: AWS, GCP, Azure.
2. Services: Compute, Storage, Database, Load Balancer, Notifications, Monitoring.
• Backend fetches pricing from official APIs.
• Backend performs cost calculations and displays comparative results.
### Page 3: Results / History Page
• Displays current results and previous calculations fetched from AWS S3.
• Each result is stored as a JSON/CSV file in the user’s personal S3 folder.

## 4.0 Result / Deliverables
The final product of the Cloud Price Comparison Web Application will be a fully functional,
user-friendly web platform devised to assist users in their effort to compare cloud service pricing
effectively. In the scope of this first version, this covers the following features:

1. Centralized Cloud Pricing Dashboard
A web interface where users can view, filter, and compare prices for compute, storage, and
networking services across major cloud providers, including AWS, Azure, and Google Cloud.

2. Provider-Agnostic Cost Comparisons
Standardized metrics that allow users to fairly and accurately compare costs across different
cloud providers, filtered by service type, region, and usage parameters.

3. User Login and Registration
Allow secure user authentication, enabling personalized experiences such as saving preferences,
configurations, and past comparisons.

4. E-mail Service for Results Delivery
Automate sending the result of the price comparison directly to the registered email address
through selected comparison. This will ensure ease of access and record-keeping.

5. Mobile-Friendly Responsive Design
Ensure the platform is accessible on tablets and smartphones for convenience.

6. Saved Comparison History
Enable users to save previous comparisons in their account for easy reference or auditing.

7. Scalable Architecture for Future Enhancements
A modular, extendable system design allows for the integration of more cloud providers,
historical pricing trends, carbon footprint comparisons, and predictive analytics using machine
learning in the future.
Overall Outcome: This project will provide a practical, centralized platform for the comparison
of cloud costs, thereby enabling users to make decisions based on actionable insights. While this
first version targets core features, its architecture is scalable to accommodate growth into a fullfeatured
cloud cost intelligence tool in later versions.

### 4.1 Future Enhancements
Though the current version of the Cloud Price Comparison Web Application focuses on major
cloud providers like AWS, Azure, and Google Cloud, the project is envisioned to be highly
scalable and poised for growth. A number of extensions are planned to extend the capabilities
and relevance of the platform as cloud computing continues to evolve.
1. Addition of More Cloud Providers
To offer more comprehensive comparison options, future iterations are planned that will
incorporate cloud platforms such as IBM Cloud and Oracle Cloud. Expanding provider coverage
will ensure users have access to a wider range of pricing options and service offerings, thereby
enhancing the overall utility and market reach that the platform is able to achieve.
2. Historical Pricing and Trend Analysis
The platform will be extended by adding a module for data analytics to keep track of historical
price trends and visualize them. It would allow users to see how prices change over time,
enabling them to make better decisions on long-term cost management, budgeting, and contract
negotiations.
3. Machine Learning-Based Cost Prediction
To further help users with cloud strategy planning, machine learning algorithms will be
integrated to enable forecasting about future pricing based on historical data and usage trends.
This kind of intelligent forecasting will proactively enable cost optimization and improve
financial planning for an organization consuming cloud infrastructure. Combined, these features
will move the application from simple price comparison to a full-fledged cloud cost intelligence
platform, enabling transparent, sustainable, and data-driven decision-making for businesses and
developers across the world.

## 5.0 References
-- Amazon Web Services (AWS) Pricing API Documentation
Available at: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html

-- Google Cloud Billing Catalog API
Available at: https://cloud.google.com/billing/v1/how-tos/catalog-api

-- Microsoft Azure Retail Prices API Documentation
Available at: https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azureretail-prices

-- boto3 — AWS SDK for Python
Available at: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html

-- google-cloud — Google Cloud Client Libraries for Python
Available at: https://cloud.google.com/python/docs/reference

-- azure-mgmt — Microsoft Azure Management Libraries for Python
Available at: https://learn.microsoft.com/en-us/python/api/overview/azure/?view=azure-python

