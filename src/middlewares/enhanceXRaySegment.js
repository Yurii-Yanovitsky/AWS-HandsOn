const { AWSXRay } = require("../config/xray");

// const AWSXRay = require("aws-xray-sdk");

exports.enhanceXRaySegment = (req, res, next) => {
  const segment = AWSXRay.getSegment(); // Get the current segment

  if (segment) {
    // Add user ID as an annotation to the segment
    if (req.user.sub) {
      // segment.setUser(req.user.sub);    // Add annotations for indexed, searchable attributes
      segment.addAnnotation("userId", req.user.sub);
    }

    segment.addAnnotation("endpoint", req.path);
    segment.addAnnotation("method", req.method);

    segment.addMetadata("query", req.query);
    segment.addMetadata("hostname", req.hostname);
    segment.addMetadata("headers", req.headers);
  }

  next();
};
