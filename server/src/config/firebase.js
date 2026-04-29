const admin = require("firebase-admin");

const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]?.trim());

if (missingEnvVars.length) {
  throw new Error(
    `Missing Firebase Admin environment variables: ${missingEnvVars.join(", ")}`
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } catch (err) {
    throw new Error(
      `Firebase Admin failed to initialize: ${err.message}. On Render, paste FIREBASE_PRIVATE_KEY with literal \\n for newlines, or use one-line PEM with \\n escapes.`,
    );
  }
}

module.exports = admin;
