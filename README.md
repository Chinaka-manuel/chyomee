Niceman Agro & Farms E-Commerce Website

A modern agricultural e-commerce platform for Niceman Agro & Farms, designed to allow customers to browse agricultural products, place orders, make payments, and access agricultural information.

The project is divided into two main applications:

Client — Frontend/customer-facing application
Server — Backend/API, database, payment, order, email and administrative services
Project Overview

Niceman Agro & Farms sells a wide range of agricultural inputs and equipment, including:

Agrochemicals
Herbicides
Insecticides
Fungicides
Fertilizers
Seeds
Crop protection products
Knapsack sprayers
Pumps
Farm equipment
Farm tools
Other agricultural inputs

Customers should be able to:

Browse products
Search and filter products
Shop by category
Shop by crop
View product details
Add multiple products to a cart
Checkout as logged in users and guests
Make payments
Receive order confirmations
ordet sent to admin as mail
Read agricultural articles and resources

The administrator should be able to manage products, inventory, orders, customers, blog content and other website data through the backend/admin system.

Project Structure
NICEMAN-AGRO/
│
├── README.md # Project-wide documentation
│
├── client/ # Frontend application
│ ├── README.md # Frontend-specific documentation
│ └── ...
│
└── server/ # Backend application
├── ...
└── ...
Architecture

The project follows a client-server architecture.

                    ┌─────────────────────┐
                    │       CUSTOMER      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       CLIENT        │
                    │  Frontend / UI      │
                    └──────────┬──────────┘
                               │
                         API Requests
                               │
                               ▼
                    ┌─────────────────────┐
                    │       SERVER        │
                    │   Backend / API     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          Database          Payments          Email

Core Features:
Customer Shopping
Product catalog
Product categories
Shop by crop
Product search
Product filtering
Product sorting
Product details
Shopping cart
Guest checkout
Delivery information
Payment
Order confirmation
Product Management
Add products
Edit products
Delete products
Product images
Product categories
Product crops
Product pricing
Discounts
Featured products
Popular products
Stock status
Inventory
Track stock quantities
Reduce stock after successful purchases
Prevent orders beyond available stock
Low-stock alerts
Update stock quantities
Orders

Orders should contain:

Unique order number
Customer information
Products
Quantities
Prices
Delivery information
Payment information
Order status

Order statuses may include:

Pending
Confirmed
Processing
Ready for Delivery
Dispatched
Delivered
Cancelled
Payment

The platform should support payment methods selected by the business.

Possible payment methods include:

Paystack
Flutterwave
Bank Transfer

The backend is responsible for:

Payment initialization
Payment verification
Payment status
Connecting payments to orders
Handling successful payments
Handling failed payments

The frontend is responsible for providing the customer-facing payment experience.

Order & Email Flow

The main order flow is:

Browse Products
↓
Add to Cart
↓
Checkout
↓
Payment
↓
Payment Verification
↓
Create/Confirm Order
↓
Send Email Notifications

After successful payment, the backend should send the complete order information to the administrator's email.

The admin email should contain:

Order number
Customer details
Products ordered
Quantities
Prices
Delivery information
Total amount
Payment status/proof

Customers should also receive appropriate:

Order confirmation
Payment confirmation
Order status updates
Management contact information
Blog / Agricultural Resources

The platform will include an agricultural blog.

Customers can:

View published articles
Search articles
Filter articles
Read individual articles
View featured/recent articles
View related articles
Share articles

Administrators can:

Create articles
Edit articles
Add featured images
Categorize articles
Save drafts
Publish/unpublish articles
Feature articles
Delete articles
Product Reviews

Customers may be able to:

Submit product reviews
Submit ratings

Administrators can:

Approve reviews
Hide reviews
Delete reviews
Admin System

The admin system should provide management functionality for:

Products
Categories
Crops
Inventory
Orders
Customers
Blog posts
Reviews
Promotions
Website content

The dashboard should provide useful information such as:

Total orders
Sales
Pending orders
Completed orders
Recent orders
Low-stock products
User Accounts
Current Implementation

The initial version will use guest checkout.

Customers do not need to create an account before purchasing.

Future Feature

Customer accounts may later support:

Registration
Login
Profile management
Saved addresses
Order history
Order tracking
Reordering
Password management
Client & Server Responsibilities
Client / Frontend

The client developer is responsible for:

UI/UX implementation
Responsive design
Homepage
Shop
Categories
Shop by crop
Product pages
Cart
Checkout interface
Payment interface
Order confirmation
Blog
About page
Contact page
FAQ
API integration
Frontend validation
Loading states
Error states
Empty states

See client/README.md for frontend-specific documentation.

Server / Backend

The backend developer is responsible for:

REST APIs
Database
Product management
Categories
Crops
Inventory
Orders
Payment integration
Payment verification
Email notifications
Admin functionality
Authentication/security
Reviews
Blog management
Promotions
Delivery/order status
Backend validation
API Communication

The client and server communicate through API endpoints.

Example:

Client
│
│ HTTP Request
▼
Server API
│
├── Database
├── Payment Gateway
└── Email Service
│
▼
Response
│
▼
Client

The API base URL should be stored in environment variables and should not be hardcoded throughout the application.

Example:

VITE_API_URL=http://localhost:5000/api

The actual environment variables and API URL will depend on the backend configuration.

Environment Variables

Do not commit secret credentials to GitHub.

Examples of sensitive configuration include:

DATABASE_URL=
JWT_SECRET=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=

Use .env / .env.local files locally and ensure they are included in .gitignore.

Local Development
Clone the Repository
git clone <repository-url>
cd NICEMAN-AGRO
Client
cd client
npm install
npm run dev
Server

Open another terminal:

cd server
npm install
npm run dev

The client and server should run independently during development.

Git Workflow

Both developers should work using separate branches.

Example:

git checkout -b feature/product-page

or:

git checkout -b feature/product-api

After completing a feature:

git add .
git commit -m "Add product API"
git push -u origin feature/product-api

Create a Pull Request when the work is ready for review.

Important

Do not commit:

node_modules/
.env
.env.local
\*.env

Do not commit API keys, database credentials, passwords, or other secrets.

Development Principles

Both client and server developers should:

Keep client and server responsibilities separate
Avoid unnecessary changes to another developer's work
Use clear and descriptive commit messages
Create feature branches
Test changes before pushing
Avoid committing secrets
Keep reusable code organized
Communicate API changes between client and server developers
Avoid breaking existing functionality when adding new features
Project Goal

The goal is to build a reliable, professional and user-friendly agricultural e-commerce platform that allows customers to easily discover agricultural products, learn about farming, place orders and complete purchases online.

The client and server applications should work together through clearly defined APIs while remaining independently maintainable.
# chyomee
