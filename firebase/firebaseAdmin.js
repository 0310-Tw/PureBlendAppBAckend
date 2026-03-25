const admin = require('firebase-admin');
const path = require('path');

let app;

const initializeFirebaseAdmin = () => {
  if (app) {
    return app;
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set in .env');
  }

  const resolvedPath = path.resolve(serviceAccountPath);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const serviceAccount = require(resolvedPath);

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return app;
};

const getFirebaseMessaging = () => {
  const firebaseApp = initializeFirebaseAdmin();
  return admin.messaging(firebaseApp);
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseMessaging,
};