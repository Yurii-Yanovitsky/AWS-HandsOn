const { AWSXRay } = require("./xray");

// const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

AWS.config.update({
  // AWS configuration options
  region: "us-east-1",
});

module.exports = AWS;
