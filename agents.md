# Campus GIG — Full Stack Implementation Plan

> **Purpose:** Step-by-step build instructions for AI agents and developers.  
> **Stack:** React, Node.js (Express), MongoDB (Mongoose), Firebase (Auth + Storage), Razorpay (sandbox)  
> **Scope:** Full product — multi-college, ratings, payments, portfolio, real-time gig flow  

---

## Table of Contents

1. [Repository & Project Structure](#1-repository--project-structure)
2. [Environment Configuration](#2-environment-configuration)
3. [Firebase Setup](#3-firebase-setup)
4. [MongoDB Schemas & Indexes](#4-mongodb-schemas--indexes)
5. [Backend — Auth Middleware](#5-backend--auth-middleware)
6. [Backend — Auth Routes](#6-backend--auth-routes)
7. [Backend — Gig Routes](#7-backend--gig-routes)
8. [Backend — Application Routes](#8-backend--application-routes)
9. [Backend — Payment Routes](#9-backend--payment-routes)
10. [Backend — Ratings & Portfolio Routes](#10-backend--ratings--portfolio-routes)
11. [Backend — College Admin Routes](#11-backend--college-admin-routes)
12. [Backend — Super Admin Routes](#12-backend--super-admin-routes)
13. [Frontend — Project Setup & Routing](#13-frontend--project-setup--routing)
14. [Frontend — Auth Flows](#14-frontend--auth-flows)
15. [Frontend — Student Dashboard](#15-frontend--student-dashboard)
16. [Frontend — Client / Faculty Dashboard](#16-frontend--client--faculty-dashboard)
17. [Frontend — College Admin Panel](#17-frontend--college-admin-panel)
18. [Frontend — Super Admin Panel](#18-frontend--super-admin-panel)
19. [Firebase Storage Rules](#19-firebase-storage-rules)
20. [Gig Lifecycle State Machine — Reference](#20-gig-lifecycle-state-machine--reference)
21. [Build Order & Dependency Graph](#21-build-order--dependency-graph)

---

## 1. Repository & Project Structure

Create a monorepo with two workspaces: `server` and `client`.

```
campus-gig/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── firebase.js
│   │   ├── models/
│   │   │   ├── College.js
│   │   │   ├── User.js
│   │   │   ├── Gig.js
│   │   │   ├── Application.js
│   │   │   ├── Payment.js
│   │   │   └── Rating.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── roles.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── gigs.js
│   │   │   ├── applications.js
│   │   │   ├── payments.js
│   │   │   ├── ratings.js
│   │   │   ├── portfolio.js
│   │   │   ├── adminCollege.js
│   │   │   └── adminSuper.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── gigController.js
│   │   │   ├── applicationController.js
│   │   │   ├── paymentController.js
│   │   │   ├── ratingController.js
│   │   │   ├── portfolioController.js
│   │   │   ├── adminCollegeController.js
│   │   │   └── adminSuperController.js
│   │   ├── utils/
│   │   │   └── recalculateRating.js
│   │   └── app.js
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── firebase/
│   │   │   └── config.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── RoleRoute.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── BrowseGigs.jsx
│   │   │   │   ├── MyApplications.jsx
│   │   │   │   ├── SubmitDelivery.jsx
│   │   │   │   └── Portfolio.jsx
│   │   │   ├── client/
│   │   │   │   ├── ClientDashboard.jsx
│   │   │   │   ├── PostGig.jsx
│   │   │   │   ├── ManageApplicants.jsx
│   │   │   │   └── PaymentTrigger.jsx
│   │   │   ├── admin-college/
│   │   │   │   ├── CollegeAdminDashboard.jsx
│   │   │   │   ├── PendingUsers.jsx
│   │   │   │   ├── PendingGigs.jsx
│   │   │   │   └── PendingPayouts.jsx
│   │   │   └── admin-super/
│   │   │       ├── SuperAdminDashboard.jsx
│   │   │       ├── CollegeRegistry.jsx
│   │   │       └── CreateCollege.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── README.md
```

**Commands to scaffold:**

```bash
# Root
mkdir campus-gig && cd campus-gig
git init

# Server
mkdir -p server/src/{config,models,middleware,routes,controllers,utils}
cd server && npm init -y
npm install express mongoose firebase-admin dotenv cors razorpay crypto

# Client
cd ../
npm create vite@latest client -- --template react
cd client && npm install axios react-router-dom firebase
```

---

## 2. Environment Configuration

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campusgig
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
SUPER_ADMIN_EMAIL=superadmin@campusgig.com
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 3. Firebase Setup

### `server/src/config/firebase.js`

Initialize Firebase Admin SDK. Used to verify JWTs on every protected API request.

```js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

module.exports = admin;
```

### `client/src/firebase/config.js`

Initialize Firebase client SDK. Used for Auth (email/password + Google OAuth) and Storage uploads.

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**Firebase Console configuration steps:**

1. Create a Firebase project.
2. Enable **Email/Password** sign-in method under Authentication → Sign-in method.
3. Enable **Google** sign-in method.
4. Create a **Web App** under Project Settings → General → Your apps. Copy the config object into `client/.env`.
5. Under Project Settings → Service Accounts → Generate new private key. Download the JSON. Extract `project_id`, `client_email`, `private_key` into `server/.env`.
6. Under Storage → Rules — paste the rules defined in Section 19.

---

## 4. MongoDB Schemas & Indexes

### `server/src/models/College.js`

```js
const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailDomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  designatedAdminEmail: { type: String, required: true, lowercase: true, trim: true },
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('College', CollegeSchema);
```

### `server/src/models/User.js`

```js
const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  addedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: {
    type: String,
    enum: ['student', 'client', 'faculty', 'college_admin', 'super_admin'],
    required: true,
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  portfolioItems: [PortfolioItemSchema],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
```

### `server/src/models/Gig.js`

```js
const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending_approval', 'open', 'in_progress', 'pending_delivery', 'completed', 'rejected'],
    default: 'pending_approval',
  },
  applicantCount: { type: Number, default: 0 },
  selectedApplicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectionCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

GigSchema.index({ collegeId: 1, status: 1 });
GigSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Gig', GigSchema);
```

### `server/src/models/Application.js`

```js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverNote: { type: String },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'selected', 'rejected'],
    default: 'applied',
  },
  deliveryFileUrl: { type: String, default: null },
  deliveryNote: { type: String, default: null },
  deliverySubmittedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate applications
ApplicationSchema.index({ gigId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
```

### `server/src/models/Payment.js`

```js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'paid', 'payout_requested', 'payout_approved', 'payout_done'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
```

### `server/src/models/Rating.js`

```js
const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  direction: { type: String, enum: ['client_to_student', 'student_to_client'] },
  score: { type: Number, min: 1, max: 5, required: true },
  review: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// One rating per direction per gig
RatingSchema.index({ gigId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
```

---

## 5. Backend — Auth Middleware

### `server/src/middleware/auth.js`

This middleware runs on every protected route. It does three things in sequence: verify the Firebase JWT, fetch the MongoDB user, reject if not approved.

```js
const admin = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid }).populate('collegeId');

    if (!user) {
      return res.status(404).json({ message: 'User not registered in system' });
    }

    if (user.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protect };
```

### `server/src/middleware/roles.js`

Role-gating middleware factory. Pass one or more allowed roles.

```js
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  };
};

module.exports = { allowRoles };
```

**Usage pattern:**

```js
router.get('/pending-users', protect, allowRoles('college_admin', 'super_admin'), handler);
```

---

## 6. Backend — Auth Routes

### `server/src/controllers/authController.js`

**`register`** — Called after Firebase creates the account on the client. Receives the Firebase JWT, validates domain, checks designated admin, creates MongoDB user.

```js
const College = require('../models/College');
const User = require('../models/User');
const admin = require('../config/firebase');

exports.register = async (req, res) => {
  const { name } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid Firebase token' });
  }

  const { uid, email } = decoded;
  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];

  // Check if already registered
  const existing = await User.findOne({ firebaseUid: uid });
  if (existing) return res.status(409).json({ message: 'Already registered' });

  // Super admin bypass
  if (emailLower === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
    const user = await User.create({
      firebaseUid: uid,
      name,
      email: emailLower,
      role: 'super_admin',
      approvalStatus: 'approved',
    });
    return res.status(201).json(user);
  }

  // Find college by domain
  const college = await College.findOne({ emailDomain: domain });

  if (!college) {
    // External client — Google OAuth, no domain match
    const user = await User.create({
      firebaseUid: uid,
      name,
      email: emailLower,
      role: 'client',
      approvalStatus: 'pending',
    });
    return res.status(201).json(user);
  }

  // Check if this email is the designated College Admin
  if (college.designatedAdminEmail === emailLower && !college.adminUserId) {
    const user = await User.create({
      firebaseUid: uid,
      name,
      email: emailLower,
      role: 'college_admin',
      collegeId: college._id,
      approvalStatus: 'approved',
    });
    college.adminUserId = user._id;
    await college.save();
    return res.status(201).json(user);
  }

  // Determine role: faculty vs student (extend this logic if faculty needs separate flag)
  const role = req.body.role === 'faculty' ? 'faculty' : 'student';

  const user = await User.create({
    firebaseUid: uid,
    name,
    email: emailLower,
    role,
    collegeId: college._id,
    approvalStatus: 'pending',
  });

  return res.status(201).json(user);
};

exports.getMe = async (req, res) => {
  return res.json(req.user);
};
```

### `server/src/routes/auth.js`

```js
const express = require('express');
const router = express.Router();
const { register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;
```

---

## 7. Backend — Gig Routes

### `server/src/controllers/gigController.js`

**`createGig`** — Any approved user can post. Gig is assigned `pending_approval`. The `collegeId` is derived from the poster's profile for campus users; external clients must supply a `targetCollegeId` in the request body.

```js
const Gig = require('../models/Gig');

exports.createGig = async (req, res) => {
  const { title, description, category, budget, deadline, targetCollegeId } = req.body;

  const collegeId = req.user.collegeId
    ? req.user.collegeId._id
    : targetCollegeId;

  if (!collegeId) {
    return res.status(400).json({ message: 'External clients must specify a targetCollegeId' });
  }

  const gig = await Gig.create({
    postedBy: req.user._id,
    collegeId,
    title,
    description,
    category,
    budget,
    deadline,
    status: 'pending_approval',
  });

  return res.status(201).json(gig);
};

exports.getGigs = async (req, res) => {
  const { category, status } = req.query;
  const filter = {};

  // Students and faculty see only their college's approved gigs
  if (['student', 'faculty'].includes(req.user.role)) {
    filter.collegeId = req.user.collegeId._id;
    filter.status = 'open';
  }

  // College admin sees all gigs for their college
  if (req.user.role === 'college_admin') {
    filter.collegeId = req.user.collegeId._id;
    if (status) filter.status = status;
  }

  // Super admin sees everything
  if (req.user.role === 'super_admin') {
    if (status) filter.status = status;
  }

  // External client sees only their own gigs
  if (req.user.role === 'client') {
    filter.postedBy = req.user._id;
    if (status) filter.status = status;
  }

  if (category) filter.category = category;

  const gigs = await Gig.find(filter)
    .populate('postedBy', 'name email ratings')
    .populate('collegeId', 'name')
    .sort({ createdAt: -1 });

  return res.json(gigs);
};

exports.getGigById = async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate('postedBy', 'name email ratings')
    .populate('selectedApplicantId', 'name email ratings portfolioItems');
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  return res.json(gig);
};

exports.updateGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  if (!['pending_approval', 'open'].includes(gig.status)) {
    return res.status(400).json({ message: 'Cannot edit gig after applications begin' });
  }

  const allowed = ['title', 'description', 'category', 'budget', 'deadline'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) gig[field] = req.body[field];
  });

  await gig.save();
  return res.json(gig);
};

exports.deleteGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  if (!['pending_approval', 'open'].includes(gig.status)) {
    return res.status(400).json({ message: 'Cannot delete an active gig' });
  }

  await gig.deleteOne();
  return res.json({ message: 'Gig deleted' });
};
```

### `server/src/routes/gigs.js`

```js
const express = require('express');
const router = express.Router();
const { createGig, getGigs, getGigById, updateGig, deleteGig } = require('../controllers/gigController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGig);
router.get('/', protect, getGigs);
router.get('/:id', protect, getGigById);
router.put('/:id', protect, updateGig);
router.delete('/:id', protect, deleteGig);

module.exports = router;
```

---

## 8. Backend — Application Routes

### `server/src/controllers/applicationController.js`

**State transitions covered:**  
`applied` → `shortlisted` → `selected` (gig moves to `in_progress`)  
`selected` → delivery submitted (application gets `deliveryFileUrl`)  
Client accepts delivery → gig moves to `pending_delivery`  
Client rejects delivery → gig moves back to `in_progress`, `rejectionCount` increments  
If `rejectionCount >= 3` → flag to College Admin

```js
const Application = require('../models/Application');
const Gig = require('../models/Gig');

exports.applyToGig = async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig || gig.status !== 'open') {
    return res.status(400).json({ message: 'Gig not available for applications' });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can apply' });
  }

  const existing = await Application.findOne({ gigId: gig._id, studentId: req.user._id });
  if (existing) return res.status(409).json({ message: 'Already applied' });

  const application = await Application.create({
    gigId: gig._id,
    studentId: req.user._id,
    coverNote: req.body.coverNote,
  });

  gig.applicantCount += 1;
  await gig.save();

  return res.status(201).json(application);
};

exports.getApplicantsForGig = async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  const applications = await Application.find({ gigId: gig._id })
    .populate('studentId', 'name email ratings portfolioItems');

  return res.json(applications);
};

exports.selectApplicant = async (req, res) => {
  const application = await Application.findById(req.params.id).populate('gigId');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const gig = application.gigId;
  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  if (gig.status !== 'open') {
    return res.status(400).json({ message: 'Gig is not open for selection' });
  }

  // Reject all other applicants
  await Application.updateMany(
    { gigId: gig._id, _id: { $ne: application._id } },
    { status: 'rejected' }
  );

  application.status = 'selected';
  await application.save();

  gig.status = 'in_progress';
  gig.selectedApplicantId = application.studentId;
  await gig.save();

  return res.json({ application, gig });
};

exports.submitDelivery = async (req, res) => {
  const application = await Application.findById(req.params.id).populate('gigId');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  if (application.studentId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not the selected student' });
  }

  if (application.gigId.status !== 'in_progress') {
    return res.status(400).json({ message: 'Gig is not in progress' });
  }

  application.deliveryFileUrl = req.body.deliveryFileUrl;
  application.deliveryNote = req.body.deliveryNote;
  application.deliverySubmittedAt = new Date();
  await application.save();

  application.gigId.status = 'pending_delivery';
  await application.gigId.save();

  return res.json(application);
};

exports.reviewDelivery = async (req, res) => {
  const { action } = req.body; // 'accept' or 'reject'
  const application = await Application.findById(req.params.id).populate('gigId');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const gig = application.gigId;
  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  if (gig.status !== 'pending_delivery') {
    return res.status(400).json({ message: 'No delivery pending review' });
  }

  if (action === 'accept') {
    // Payment creation is triggered separately via /api/payments/create-order
    return res.json({ message: 'Delivery accepted. Proceed to payment.' });
  }

  if (action === 'reject') {
    gig.status = 'in_progress';
    gig.rejectionCount += 1;
    application.deliveryFileUrl = null;
    application.deliveryNote = null;
    application.deliverySubmittedAt = null;
    await application.save();
    await gig.save();

    if (gig.rejectionCount >= 3) {
      // TODO: Trigger admin notification (can be a flagged field or a separate Notification model)
      return res.json({ message: 'Delivery rejected. Dispute flagged to College Admin.', flagged: true });
    }

    return res.json({ message: 'Delivery rejected. Student can resubmit.', flagged: false });
  }

  return res.status(400).json({ message: 'Invalid action. Use accept or reject.' });
};

exports.getMyApplications = async (req, res) => {
  const applications = await Application.find({ studentId: req.user._id })
    .populate('gigId');
  return res.json(applications);
};
```

### `server/src/routes/applications.js`

```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.post('/gig/:gigId', protect, ctrl.applyToGig);
router.get('/gig/:gigId', protect, ctrl.getApplicantsForGig);
router.get('/my', protect, ctrl.getMyApplications);
router.put('/:id/select', protect, ctrl.selectApplicant);
router.put('/:id/deliver', protect, ctrl.submitDelivery);
router.put('/:id/review', protect, ctrl.reviewDelivery);

module.exports = router;
```

---

## 9. Backend — Payment Routes

### `server/src/controllers/paymentController.js`

Payment flow: client calls `create-order` after accepting delivery → Razorpay order is created → client completes payment on frontend → client calls `verify` with Razorpay callback data → signature is verified → payment marked `paid` → status moves to `payout_requested`.

```js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const Application = require('../models/Application');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { gigId } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== 'pending_delivery') {
    return res.status(400).json({ message: 'Gig not in pending_delivery state' });
  }

  if (gig.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not gig owner' });
  }

  const options = {
    amount: gig.budget * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `receipt_${gig._id}`,
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    gigId: gig._id,
    clientId: req.user._id,
    studentId: gig.selectedApplicantId,
    collegeId: gig.collegeId,
    amount: gig.budget,
    razorpayOrderId: order.id,
    status: 'pending',
  });

  return res.json({ order, paymentId: payment._id });
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gigId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment signature verification failed' });
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) return res.status(404).json({ message: 'Payment record not found' });

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.status = 'payout_requested';
  await payment.save();

  const gig = await Gig.findById(gigId);
  gig.status = 'completed';
  await gig.save();

  return res.json({ message: 'Payment verified. Gig completed. Payout request created.', payment });
};

exports.getPaymentsForCollege = async (req, res) => {
  const collegeId = req.user.collegeId._id;
  const payments = await Payment.find({ collegeId })
    .populate('gigId', 'title')
    .populate('clientId', 'name email')
    .populate('studentId', 'name email');
  return res.json(payments);
};
```

### `server/src/routes/payments.js`

```js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentsForCollege } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/college', protect, allowRoles('college_admin', 'super_admin'), getPaymentsForCollege);

module.exports = router;
```

---

## 10. Backend — Ratings & Portfolio Routes

### `server/src/utils/recalculateRating.js`

Called after every new rating is inserted. Recalculates the `ratings.average` and `ratings.count` on the target user.

```js
const Rating = require('../models/Rating');
const User = require('../models/User');

const recalculateRating = async (userId) => {
  const ratings = await Rating.find({ toUserId: userId });
  const count = ratings.length;
  const average = count > 0 ? ratings.reduce((sum, r) => sum + r.score, 0) / count : 0;

  await User.findByIdAndUpdate(userId, {
    'ratings.average': parseFloat(average.toFixed(2)),
    'ratings.count': count,
  });
};

module.exports = recalculateRating;
```

### `server/src/controllers/ratingController.js`

```js
const Rating = require('../models/Rating');
const Payment = require('../models/Payment');
const recalculateRating = require('../utils/recalculateRating');

exports.submitRating = async (req, res) => {
  const { gigId, toUserId, score, review } = req.body;

  // Ensure payment is settled before rating is allowed
  const payment = await Payment.findOne({ gigId, status: 'paid' });
  if (!payment) {
    return res.status(400).json({ message: 'Rating only allowed after payment is confirmed' });
  }

  const direction =
    req.user.role === 'student' ? 'student_to_client' : 'client_to_student';

  try {
    const rating = await Rating.create({
      gigId,
      fromUserId: req.user._id,
      toUserId,
      direction,
      score,
      review,
    });

    await recalculateRating(toUserId);
    return res.status(201).json(rating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Already rated for this gig' });
    }
    throw err;
  }
};

exports.getRatingsForUser = async (req, res) => {
  const ratings = await Rating.find({ toUserId: req.params.userId })
    .populate('fromUserId', 'name');
  return res.json(ratings);
};
```

### `server/src/controllers/portfolioController.js`

Portfolio items are auto-created when a gig is completed. Students can update the title and description post-completion.

```js
const User = require('../models/User');
const Gig = require('../models/Gig');
const Application = require('../models/Application');

exports.autoAddPortfolioItem = async (gigId, studentId) => {
  const gig = await Gig.findById(gigId);
  const application = await Application.findOne({ gigId, studentId, status: 'selected' });

  const user = await User.findById(studentId);
  user.portfolioItems.push({
    title: gig.title,
    description: gig.description,
    fileUrl: application.deliveryFileUrl,
    gigId: gig._id,
  });
  await user.save();
};

exports.updatePortfolioItem = async (req, res) => {
  const { itemId } = req.params;
  const { title, description } = req.body;

  const user = await User.findById(req.user._id);
  const item = user.portfolioItems.id(itemId);
  if (!item) return res.status(404).json({ message: 'Portfolio item not found' });

  if (title) item.title = title;
  if (description) item.description = description;
  await user.save();

  return res.json(item);
};

exports.getPortfolio = async (req, res) => {
  const user = await User.findById(req.params.userId).select('portfolioItems name ratings');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
};
```

> **Note:** Call `autoAddPortfolioItem(gigId, studentId)` inside `verifyPayment` controller after `gig.status = 'completed'` is saved.

### `server/src/routes/ratings.js`

```js
const express = require('express');
const router = express.Router();
const { submitRating, getRatingsForUser } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitRating);
router.get('/user/:userId', protect, getRatingsForUser);

module.exports = router;
```

### `server/src/routes/portfolio.js`

```js
const express = require('express');
const router = express.Router();
const { updatePortfolioItem, getPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getPortfolio);
router.put('/item/:itemId', protect, updatePortfolioItem);

module.exports = router;
```

---

## 11. Backend — College Admin Routes

### `server/src/controllers/adminCollegeController.js`

```js
const User = require('../models/User');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');

exports.getPendingUsers = async (req, res) => {
  const users = await User.find({
    collegeId: req.user.collegeId._id,
    approvalStatus: 'pending',
  });
  return res.json(users);
};

exports.reviewUser = async (req, res) => {
  const { action, reason } = req.body; // action: 'approve' | 'reject'
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.collegeId.toString() !== req.user.collegeId._id.toString()) {
    return res.status(403).json({ message: 'User not in your college' });
  }

  user.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  await user.save();
  return res.json(user);
};

exports.getPendingGigs = async (req, res) => {
  const gigs = await Gig.find({
    collegeId: req.user.collegeId._id,
    status: 'pending_approval',
  }).populate('postedBy', 'name email role');
  return res.json(gigs);
};

exports.reviewGig = async (req, res) => {
  const { action, reason } = req.body;
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  if (gig.collegeId.toString() !== req.user.collegeId._id.toString()) {
    return res.status(403).json({ message: 'Gig not in your college' });
  }

  gig.status = action === 'approve' ? 'open' : 'rejected';
  await gig.save();
  return res.json(gig);
};

exports.getPendingPayouts = async (req, res) => {
  const payments = await Payment.find({
    collegeId: req.user.collegeId._id,
    status: 'payout_requested',
  })
    .populate('gigId', 'title')
    .populate('studentId', 'name email')
    .populate('clientId', 'name email');
  return res.json(payments);
};

exports.approvePayout = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (payment.collegeId.toString() !== req.user.collegeId._id.toString()) {
    return res.status(403).json({ message: 'Payment not in your college' });
  }

  payment.status = 'payout_approved';
  await payment.save();

  // Mark payout done immediately in sandbox (no real transfer)
  payment.status = 'payout_done';
  await payment.save();

  return res.json({ message: 'Payout approved and marked done (sandbox)', payment });
};
```

### `server/src/routes/adminCollege.js`

```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminCollegeController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

const guard = [protect, allowRoles('college_admin', 'super_admin')];

router.get('/pending-users', ...guard, ctrl.getPendingUsers);
router.put('/users/:id/review', ...guard, ctrl.reviewUser);
router.get('/pending-gigs', ...guard, ctrl.getPendingGigs);
router.put('/gigs/:id/review', ...guard, ctrl.reviewGig);
router.get('/pending-payouts', ...guard, ctrl.getPendingPayouts);
router.put('/payouts/:id/approve', ...guard, ctrl.approvePayout);

module.exports = router;
```

---

## 12. Backend — Super Admin Routes

### `server/src/controllers/adminSuperController.js`

```js
const College = require('../models/College');
const User = require('../models/User');

exports.createCollege = async (req, res) => {
  const { name, emailDomain, designatedAdminEmail } = req.body;

  const domainLower = emailDomain.toLowerCase().trim();
  const adminEmailLower = designatedAdminEmail.toLowerCase().trim();

  const existing = await College.findOne({ emailDomain: domainLower });
  if (existing) return res.status(409).json({ message: 'Domain already registered' });

  const college = await College.create({
    name,
    emailDomain: domainLower,
    designatedAdminEmail: adminEmailLower,
  });

  return res.status(201).json(college);
};

exports.getAllColleges = async (req, res) => {
  const colleges = await College.find().populate('adminUserId', 'name email approvalStatus');
  return res.json(colleges);
};

exports.updateCollege = async (req, res) => {
  const college = await College.findById(req.params.id);
  if (!college) return res.status(404).json({ message: 'College not found' });

  const { name, emailDomain, designatedAdminEmail } = req.body;

  if (name) college.name = name;
  if (emailDomain) college.emailDomain = emailDomain.toLowerCase().trim();

  if (designatedAdminEmail) {
    const newAdminEmail = designatedAdminEmail.toLowerCase().trim();

    // Demote existing College Admin if different
    if (college.adminUserId) {
      await User.findByIdAndUpdate(college.adminUserId, { role: 'student' });
      college.adminUserId = null;
    }

    college.designatedAdminEmail = newAdminEmail;

    // If this person already registered, promote immediately
    const existingUser = await User.findOne({ email: newAdminEmail });
    if (existingUser) {
      existingUser.role = 'college_admin';
      existingUser.approvalStatus = 'approved';
      await existingUser.save();
      college.adminUserId = existingUser._id;
    }
  }

  await college.save();
  return res.json(college);
};

exports.getCollegeStats = async (req, res) => {
  const User = require('../models/User');
  const Gig = require('../models/Gig');
  const Payment = require('../models/Payment');

  const [userCount, gigCount, paymentVolume] = await Promise.all([
    User.aggregate([{ $group: { _id: '$collegeId', count: { $sum: 1 } } }]),
    Gig.aggregate([{ $group: { _id: '$collegeId', count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: 'payout_done' } },
      { $group: { _id: '$collegeId', total: { $sum: '$amount' } } },
    ]),
  ]);

  return res.json({ userCount, gigCount, paymentVolume });
};
```

### `server/src/routes/adminSuper.js`

```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminSuperController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

const guard = [protect, allowRoles('super_admin')];

router.post('/colleges', ...guard, ctrl.createCollege);
router.get('/colleges', ...guard, ctrl.getAllColleges);
router.put('/colleges/:id', ...guard, ctrl.updateCollege);
router.get('/stats', ...guard, ctrl.getCollegeStats);

module.exports = router;
```

---

## 13. Frontend — Project Setup & Routing

### `client/src/context/AuthContext.jsx`

Manages Firebase auth state and syncs with the backend `/api/auth/me`. Exposes `user` (MongoDB profile), `firebaseUser`, `loading`, `logout`.

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null); // MongoDB profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### `client/src/services/api.js`

Axios instance. Automatically attaches the Firebase token to every request.

```js
import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### `client/src/App.jsx`

Role-based routing. After login, the router reads `user.role` and redirects to the appropriate dashboard root. Every protected route wrapped in `PrivateRoute`.

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import BrowseGigs from './pages/student/BrowseGigs';
import MyApplications from './pages/student/MyApplications';
import SubmitDelivery from './pages/student/SubmitDelivery';
import Portfolio from './pages/student/Portfolio';

import ClientDashboard from './pages/client/ClientDashboard';
import PostGig from './pages/client/PostGig';
import ManageApplicants from './pages/client/ManageApplicants';
import PaymentTrigger from './pages/client/PaymentTrigger';

import CollegeAdminDashboard from './pages/admin-college/CollegeAdminDashboard';
import PendingUsers from './pages/admin-college/PendingUsers';
import PendingGigs from './pages/admin-college/PendingGigs';
import PendingPayouts from './pages/admin-college/PendingPayouts';

import SuperAdminDashboard from './pages/admin-super/SuperAdminDashboard';
import CollegeRegistry from './pages/admin-super/CollegeRegistry';
import CreateCollege from './pages/admin-super/CreateCollege';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  const roleMap = {
    student: '/student',
    faculty: '/client',
    client: '/client',
    college_admin: '/admin/college',
    super_admin: '/admin/super',
  };
  return <Navigate to={roleMap[user.role] || '/login'} />;
};

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/gigs" element={<PrivateRoute roles={['student']}><BrowseGigs /></PrivateRoute>} />
        <Route path="/student/applications" element={<PrivateRoute roles={['student']}><MyApplications /></PrivateRoute>} />
        <Route path="/student/deliver/:applicationId" element={<PrivateRoute roles={['student']}><SubmitDelivery /></PrivateRoute>} />
        <Route path="/portfolio/:userId" element={<PrivateRoute><Portfolio /></PrivateRoute>} />

        <Route path="/client" element={<PrivateRoute roles={['client', 'faculty']}><ClientDashboard /></PrivateRoute>} />
        <Route path="/client/post-gig" element={<PrivateRoute roles={['client', 'faculty']}><PostGig /></PrivateRoute>} />
        <Route path="/client/gig/:gigId/applicants" element={<PrivateRoute roles={['client', 'faculty']}><ManageApplicants /></PrivateRoute>} />
        <Route path="/client/gig/:gigId/pay" element={<PrivateRoute roles={['client', 'faculty']}><PaymentTrigger /></PrivateRoute>} />

        <Route path="/admin/college" element={<PrivateRoute roles={['college_admin']}><CollegeAdminDashboard /></PrivateRoute>} />
        <Route path="/admin/college/users" element={<PrivateRoute roles={['college_admin']}><PendingUsers /></PrivateRoute>} />
        <Route path="/admin/college/gigs" element={<PrivateRoute roles={['college_admin']}><PendingGigs /></PrivateRoute>} />
        <Route path="/admin/college/payouts" element={<PrivateRoute roles={['college_admin']}><PendingPayouts /></PrivateRoute>} />

        <Route path="/admin/super" element={<PrivateRoute roles={['super_admin']}><SuperAdminDashboard /></PrivateRoute>} />
        <Route path="/admin/super/colleges" element={<PrivateRoute roles={['super_admin']}><CollegeRegistry /></PrivateRoute>} />
        <Route path="/admin/super/colleges/new" element={<PrivateRoute roles={['super_admin']}><CreateCollege /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 14. Frontend — Auth Flows

### `client/src/pages/auth/Register.jsx`

Step 1: Firebase creates the account. Step 2: Backend `/register` creates the MongoDB record. On success, the `AuthContext` `onAuthStateChanged` fires and fetches `/me`, completing the auth cycle.

```jsx
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const token = await cred.user.getIdToken();
      await api.post('/auth/register', { name: form.name, role: form.role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();
      await api.post('/auth/register', { name: cred.user.displayName, role: 'client' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleEmailRegister}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="faculty">Faculty / Department</option>
        </select>
        <button type="submit">Register with Email</button>
      </form>
      <button onClick={handleGoogleRegister}>Register with Google (External Client)</button>
    </div>
  );
}
```

### `client/src/pages/auth/Login.jsx`

```jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogle}>Login with Google</button>
    </div>
  );
}
```

---

## 15. Frontend — Student Dashboard

Each component below makes API calls through the `api` service (auto-attaches token).

### `BrowseGigs.jsx`

- On mount: `GET /api/gigs` (backend filters to student's college automatically).
- Render: paginated list of gigs with title, category, budget, deadline, poster rating.
- Per gig: "Apply" button that opens a modal for `coverNote` → `POST /api/applications/gig/:gigId`.
- Disable Apply button if student already applied (check `MyApplications` list).

### `MyApplications.jsx`

- On mount: `GET /api/applications/my`
- Render: list of applications with status badges.
- If `application.status === 'selected'` and `gig.status === 'in_progress'`: show "Submit Delivery" link → `/student/deliver/:applicationId`.

### `SubmitDelivery.jsx`

- Upload file to Firebase Storage at path `/deliveries/{gigId}/{applicationId}/{filename}` using `uploadBytes` and `getDownloadURL` from `firebase/storage`.
- After upload completes, call `PUT /api/applications/:id/deliver` with `{ deliveryFileUrl, deliveryNote }`.

```jsx
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

const uploadDelivery = async (file, gigId, applicationId) => {
  const storageRef = ref(storage, `deliveries/${gigId}/${applicationId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```

### `Portfolio.jsx`

- `GET /api/portfolio/:userId`
- Renders portfolio items as cards: title, description, download link for delivery file.
- If `userId === auth.currentUser.uid` (own portfolio): each card has an Edit button for title/description → `PUT /api/portfolio/item/:itemId`.

---

## 16. Frontend — Client / Faculty Dashboard

### `ClientDashboard.jsx`

- List of user's posted gigs via `GET /api/gigs` (filtered by `postedBy` on backend for client role).
- Status badge per gig.
- Link to applicants page for gigs in `open` or `in_progress` status.
- Link to payment page for gigs in `pending_delivery`.

### `PostGig.jsx`

- Form fields: title, description, category, budget, deadline.
- External clients: additional `targetCollegeId` dropdown populated via `GET /api/admin/super/colleges` (public endpoint — add a public-facing college list route).
- On submit: `POST /api/gigs`.

### `ManageApplicants.jsx`

- `GET /api/applications/gig/:gigId`
- Render applicant cards: name, email, coverNote, rating, portfolio link.
- Shortlist button → changes local UI state (no backend shortlist endpoint required unless you want persistence).
- Select button → `PUT /api/applications/:id/select`.
- For selected applicant: show delivery submission status.
- Accept/Reject delivery buttons → `PUT /api/applications/:id/review` with `{ action: 'accept' }` or `{ action: 'reject' }`.

### `PaymentTrigger.jsx`

- Loads after client accepts delivery.
- `POST /api/payments/create-order` → receives Razorpay `order` object.
- Opens Razorpay checkout widget (Razorpay JS SDK from CDN).
- On payment success callback: `POST /api/payments/verify` with `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, gigId }`.

```jsx
// Load Razorpay script dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const handlePayment = async (order, gigId) => {
  await loadRazorpay();
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    handler: async (response) => {
      await api.post('/payments/verify', {
        ...response,
        gigId,
      });
    },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

Add to `client/.env`:
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 17. Frontend — College Admin Panel

### `CollegeAdminDashboard.jsx`

Three navigation tabs: Pending Users, Pending Gigs, Pending Payouts. Each tab shows a count badge from the respective API response.

### `PendingUsers.jsx`

- `GET /api/admin/college/pending-users`
- Each user card: name, email, role, registration date.
- Approve button → `PUT /api/admin/college/users/:id/review` with `{ action: 'approve' }`.
- Reject button → same endpoint with `{ action: 'reject', reason: '' }`.
- On action, remove the card from list and update count badge.

### `PendingGigs.jsx`

- `GET /api/admin/college/pending-gigs`
- Each gig card: title, description, category, budget, deadline, poster name and role.
- Approve / Reject same pattern as users.

### `PendingPayouts.jsx`

- `GET /api/admin/college/pending-payouts`
- Each card: gig title, student name, client name, amount.
- Approve Payout button → `PUT /api/admin/college/payouts/:id/approve`.

---

## 18. Frontend — Super Admin Panel

### `CollegeRegistry.jsx`

- `GET /api/admin/super/colleges`
- Table: college name, domain, designated admin email, admin account status (`Not yet registered` if `adminUserId === null`, else admin's name).
- Edit button per row → inline form to update name, domain, or re-designate admin.
- Stats row at bottom from `GET /api/admin/super/stats`.

### `CreateCollege.jsx`

- Form: college name, email domain (e.g. `grietcollege.com`), designated admin email.
- On submit: `POST /api/admin/super/colleges`.
- Redirect to `CollegeRegistry` on success.

---

## 19. Firebase Storage Rules

Paste into Firebase Console → Storage → Rules.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Profile pictures — only the owner can write
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Portfolio files — owner writes, anyone authenticated reads
    match /portfolios/{userId}/{gigId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Delivery files — only the student (owner) uploads
    match /deliveries/{gigId}/{applicationId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 20. Gig Lifecycle State Machine — Reference

```
[POST /gigs]
     │
     ▼
pending_approval
     │
     ├── College Admin REJECTS → rejected (terminal)
     │
     └── College Admin APPROVES
           │
           ▼
          open
           │
           ├── [PUT /applications/:id/select]
           │
           ▼
       in_progress
           │
           ├── [PUT /applications/:id/deliver]
           │
           ▼
    pending_delivery
           │
           ├── Client REJECTS (rejectionCount < 3) → back to in_progress
           │
           ├── Client REJECTS (rejectionCount >= 3) → in_progress + admin flagged
           │
           └── Client ACCEPTS
                 │
                 ├── [POST /payments/create-order]
                 ├── [POST /payments/verify] → payment.status = payout_requested
                 │
                 ▼
           completed (terminal)
                 │
                 └── Portfolio item auto-created for student
                 └── Both parties can now rate each other
```

---

## 21. Build Order & Dependency Graph

Build in this exact order. Each step depends on the ones above it.

**Phase 1 — Foundation**
1. Firebase project setup (Auth providers, Storage, Admin SDK credentials)
2. MongoDB connection (`server/src/config/db.js`)
3. All six Mongoose models + indexes
4. Express app setup (`server/src/app.js`) with CORS, JSON middleware, route mounting

**Phase 2 — Auth**
5. Firebase Admin SDK config
6. `protect` middleware + `allowRoles` middleware
7. `POST /auth/register` with domain + designation logic
8. `GET /auth/me`
9. Firebase client config + `AuthContext` + `api.js` interceptor
10. Login and Register pages

**Phase 3 — Core Gig Flow**
11. Gig model routes (create, list, get, update, delete)
12. Application routes (apply, list applicants, select, deliver, review delivery)
13. Student: BrowseGigs, MyApplications, SubmitDelivery
14. Client: PostGig, ManageApplicants

**Phase 4 — Payments**
15. Razorpay order creation + signature verification
16. Payment model save + gig status to `completed`
17. `autoAddPortfolioItem` call wired into payment verify
18. PaymentTrigger frontend page

**Phase 5 — Ratings & Portfolio**
19. Rating submission + `recalculateRating` utility
20. Portfolio GET + update endpoints
21. Portfolio page frontend

**Phase 6 — Admin Panels**
22. College Admin routes (users, gigs, payouts)
23. Super Admin routes (college CRUD, re-designation, stats)
24. College Admin panel frontend (3 tabs)
25. Super Admin panel frontend (registry + create college)

**Phase 7 — Integration & Hardening**
26. Firebase Storage rules deployed
27. All role + approval guards tested end-to-end
28. Dispute flag flow tested (3 delivery rejections → admin flag)
29. Razorpay sandbox payment cycle tested end-to-end
30. College Admin designation flow tested: Super Admin creates college → designated person registers → gets `college_admin` role automatically

---

> **All backend routes require the `Authorization: Bearer <firebase_token>` header except `POST /auth/register`.**  
> **MongoDB `_id` is used as the primary key everywhere. Never expose `firebaseUid` in client-facing API responses except in `/auth/me`.**
