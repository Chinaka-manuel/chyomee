Niceman Agro & Farms — Client

This is the frontend/client application for the Niceman Agro & Farms e-commerce website.

The platform is an agricultural e-commerce website where customers can browse and purchase agricultural inputs, equipment, and farm tools, while also accessing agricultural information through the blog.

The frontend is responsible for the user interface, product browsing, cart, checkout experience, blog, and communication with the backend API.

Project Overview

Niceman Agro & Farms sells:

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

Customers should be able to browse products, search and filter products, add multiple products to a cart, checkout as guests, make payments, and receive order confirmations.

The website will also contain an agricultural blog where users can read farming tips, guides, and other educational content.

Frontend Responsibilities

The client application will handle:

Homepage
Product catalog/shop
Product categories
Shop by crop
Product search
Product filtering and sorting
Product details
Shopping cart
Guest checkout
Payment interface
Order confirmation
Blog
Blog article pages
About Us
Contact page
FAQ
Responsive/mobile design
Loading and error states
Communication with the backend API

Authentication, product data, inventory, order processing, payment verification, email notifications, admin management, and database operations are handled by the backend.

Website Structure
Main Navigation
Home
Shop
Shop by Crop
Categories
Blog
About Us
Our Company
Governance Structure
Board of Directors
Management Team
Contact
Cart
Account/Login (future feature)
Pages & Features
1. Homepage

The homepage should contain:

Hero Section
Agricultural image/banner
Strong headline
Short description
Shop Products button
Explore Products button
Product Categories

Display categories such as:

Herbicides
Insecticides
Fungicides
Fertilizers
Seeds
Sprayers
Farm Equipment
Farm Tools

Each category should lead to the appropriate shop/category page.

Popular Products

Display products marked as popular by the backend/admin.

Promotional Section

Display promotional products/offers controlled by the admin.

Why Choose Us

Highlight:

Quality products
Genuine agricultural inputs
Convenient ordering
Fast delivery
Farmer-focused support
Agricultural Knowledge

Display recent/featured blog articles.

FAQ

Frequently asked questions covering:

Ordering
Delivery
Payment
Products
Returns
Contact
2. Shop / Product Catalog

The shop page should display available products from the backend.

Each product card should show:

Product image
Product name
Price
Category
Brand
Unit/size
Availability
Discount where applicable
Add to Cart button
View Details button
Search

Customers should be able to search by:

Product name
Category
Crop
Filters

Provide filters for:

Category
Crop
Product type
Brand
Price range
Availability
Sorting

Allow sorting by:

Newest
Price: Low → High
Price: High → Low
Popular Products
3. Product Details

Each product should have its own details page.

Display:

Multiple product images
Product name
Price
Discounted price
Description
Brand
Category
Available sizes
Stock status
Quantity selector
Add to Cart
Buy Now

Where available, display agricultural information:

Target crop
Target pest/disease/problem
Product purpose
Manufacturer instructions
Safety information
Storage information
4. Shopping Cart

The cart should allow users to:

Add multiple products
Increase quantity
Decrease quantity
Remove products
Clear cart
Continue shopping

Display:

Cart subtotal
Delivery fee
Total amount
Proceed to Checkout

Cart state should be maintained while the customer is shopping.

5. Checkout

The website currently uses guest checkout.

Customers should provide:

Personal Information
Full name
Phone number
Email address
Delivery Information
State
City
Delivery address
Delivery option
Order Information
Order notes
Payment

The frontend should provide the interface required for the payment method selected by the business.

Possible payment methods:

Paystack
Flutterwave
Bank Transfer

Payment verification will be handled by the backend.

6. Order Confirmation

After a successful checkout/payment process, the frontend should display a clear order confirmation page containing information such as:

Order number
Customer name
Products ordered
Quantities
Total amount
Payment status
Delivery information

The backend will handle storing the order and sending email notifications.

7. Blog

Users should be able to:

View published articles
Search articles
Filter by category/topic
Read individual articles
View featured/recent articles
View related articles
Share articles
View publication date
View author

The frontend will consume published blog content from the backend.

8. About Us

The frontend should provide pages/sections for:

Our Company
Governance Structure
Board of Directors
Management Team
9. Contact

The contact page should provide relevant business contact information and a suitable contact interface.

Frontend ↔ Backend Integration

The frontend will communicate with the backend through APIs.

The backend will provide data for:

Products
Categories
Crops
Inventory
Orders
Payments
Blog posts
Reviews
Promotions
Delivery information
Other website content

The frontend should not directly access the database.

All database operations must go through the backend API.

Important Frontend States

The application should properly handle:

Loading States

Display appropriate loading indicators while waiting for API responses.

Empty States

Examples:

No products found
No search results
Empty cart
No blog articles
Error States

Display user-friendly messages when:

API requests fail
Products cannot be loaded
Payment fails
Checkout fails
An unexpected error occurs
Product Availability

The frontend should clearly communicate when products are:

In stock
Low in stock
Out of stock

The backend remains the source of truth for actual inventory.

Responsive Design

The website must be responsive and optimized for:

Mobile
Tablet
Laptop
Desktop

The shopping experience should remain easy to use across all screen sizes.

Future Features

The following features may be integrated later:

Customer registration/login
Customer profiles
Saved addresses
Order history
Reordering
Customer account dashboard
Password management

These are not part of the current guest-checkout implementation unless otherwise agreed.

Development Notes
Client Developer

Responsible for:

UI implementation
Responsive design
Frontend components
Pages and navigation
Product browsing
Cart functionality
Checkout interface
Blog interface
API integration
Frontend validation
Loading/error/empty states
Backend Developer

Responsible for:

API development
Database
Products
Categories
Crops
Inventory
Orders
Payments
Email notifications
Admin functionality
Authentication
Reviews
Blog management
Backend validation
Security
Working With the Backend Developer

The frontend should consume the API endpoints provided by the backend developer.

API base URL should be stored in an environment variable rather than hardcoded.

Example:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

The actual API URL will be provided by the backend developer.

Getting Started

Clone the repository:

git clone <repository-url>

Navigate into the client:

cd client

Install dependencies:

npm install

Create the required environment file:

.env.local

Add the required frontend environment variables.

Start the development server:

npm run dev

The application will normally be available at:

http://localhost:3000
Git Workflow

Create a separate branch for your work:

git checkout -b feature/your-feature-name

After making changes:

git add .
git commit -m "describe your changes"
git push -u origin feature/your-feature-name

Do not commit:

node_modules
.env
.env.local
API keys
Secret credentials
Project Goal

The goal is to build a modern, professional, responsive agricultural e-commerce platform that makes it easy for farmers and customers to discover agricultural products, learn about farming, place orders, and complete purchases online.

The frontend and backend should remain clearly separated while working together through well-defined APIs.