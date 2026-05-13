# Cross-System Identity Resolution Engine

A privacy-preserving identity resolution engine designed to securely link identities across multiple systems (Aadhaar, ABHA, DigiLocker, Phone) without storing or exposing raw identifiers. This project was developed as part of an Infosys mini-project.

## Key Features

1. **Privacy-Preserving Record Linkage**: Raw IDs are never stored. The system uses HMAC-SHA256 hashing with unique salts for each identity.
2. **O(1) Database Lookups**: Implements deterministic blinded indexing using a static pepper, ensuring API response times remain under 1 second even at scale.
3. **Zero-Knowledge Proofs (ZKP)**: Uses cryptographic commitments (Pedersen-like) to prove that identities belong to the same person without revealing the underlying identifiers.
4. **Tamper-Evident Audit Trails**: All verifications and linkages are logged using a blockchain-style cryptographic hash chain. Any tampering with past logs will invalidate the chain.
5. **Consent Management APIs**: Includes APIs for users to explicitly grant or revoke verification access to specific third-party verifiers.
6. **Interoperable APIs**: Standards-based REST APIs for linkage, verification, and consent management.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Frontend**: Vanilla HTML/CSS/JS (Bootstrap)
- **Cryptography**: Node.js `crypto` module

## Setup & Running Locally

### 1. Prerequisites
- **Node.js**: Installed on your system.
- **MongoDB**: A local MongoDB instance running on port `27017` (or update the `.env` file with your URI).

### 2. Installation
Open a terminal in the project root and run:
```sh
npm install
```

### 3. Configuration
Create a `.env` file in the root directory (if not present) and add:
```env
MONGO_URL=mongodb://127.0.0.1:27017/crossSystemDB
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
INDEX_PEPPER=your_static_pepper_for_blinded_indexes
```

### 4. Running the Application
Start the backend server:
```sh
npm run dev
```
*(This uses nodemon for hot-reloading)*

### 5. Accessing the UI
The backend serves the frontend statically. Simply open your browser and navigate to:
**http://localhost:5000**

## API Endpoints Overview
- `POST /api/auth/register` - Register a new user/verifier
- `POST /api/auth/login` - Login and get JWT
- `POST /api/link/do` - Link multiple identities securely
- `POST /api/verify/run` - Verify if identities belong to the same person (Returns ZKP)
- `POST /api/consent/grant` - Grant a verifier access to check identities
- `POST /api/consent/revoke` - Revoke verifier access

## Deployment
To deploy this application:
1. **Database**: Setup a free MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and get the connection string.
2. **Backend/Frontend**: Deploy the repository to [Render](https://render.com/) as a "Web Service".
3. **Environment Variables**: Add `MONGO_URL`, `JWT_SECRET`, `PORT` (usually auto-assigned by Render), and `INDEX_PEPPER` to the Render environment variables dashboard.
