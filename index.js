const { onRequest } = require("firebase-functions/v2/https");
const app = require("./server.js");

// Expose Express API as a single Cloud Function
// This allows Firebase Hosting to rewrite /api requests directly to this function
exports.api = onRequest(
  {
    cors: true,
    maxInstances: 10,
    region: "us-central1"
  },
  app
);
