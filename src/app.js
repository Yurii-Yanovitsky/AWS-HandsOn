if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

// const AWSXRay = require("aws-xray-sdk");
const express = require("express");
const path = require("path");
const imageRoutes = require("./routes/imageRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./middlewares/verifyToken");
const { enhanceXRaySegment } = require("./middlewares/enhanceXRaySegment");
const { AWSXRay } = require("./config/xray");

if (process.env.NODE_ENV === "production") {
  AWSXRay.config([AWSXRay.plugins.EC2Plugin, AWSXRay.plugins.ECSPlugin]);
}
// Capture all outgoing HTTP requests
AWSXRay.captureHTTPsGlobal(require("http"));
AWSXRay.captureHTTPsGlobal(require("https"));

const app = express();

app.use(express.static(path.join(__dirname, "public")));

// Add X-Ray middleware to trace all incoming requests
app.use(AWSXRay.express.openSegment("ImageUploaderApp"));
app.use(authRoutes);
app.use(verifyToken);
app.use(enhanceXRaySegment);
app.use(userRoutes);
app.use(imageRoutes);
app.use(AWSXRay.express.closeSegment());

// Start the server
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
