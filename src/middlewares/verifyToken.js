const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const axios = require("axios");

// Function to retrieve the JWK set from the Identity Provider
async function getJWKSet() {
  try {
    const response = await axios.get(process.env.COGNITO_JWKSET_URI);
    return response.data.keys;
  } catch (error) {
    console.error("Error retrieving JWK set:", error);
    throw error;
  }
}

// Middleware to verify JWT tokens
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")?.[1];
    if (!token)
      return res
        .status(401)
        .json({ auth: false, message: "No token provided." });

    // Decode the token to extract the header
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      return res
        .status(401)
        .json({ auth: false, message: "Invalid token format." });
    }

    // Retrieve the JWK set
    const jwkSet = await getJWKSet();

    // Find the public key that matches the key ID (kid) from the token header
    const publicKey = jwkSet.find((key) => key.kid === decodedToken.header.kid);
    if (!publicKey) {
      return res
        .status(401)
        .json({ auth: false, message: "Invalid token key ID." });
    }

    // Convert the JWK to PEM format
    const pem = jwkToPem(publicKey);

    // Verify the token's signature using the PEM public key
    jwt.verify(token, pem, (err, decoded) => {
      if (err) {
        console.error("Failed to verify token:", err);
        return res
          .status(500)
          .json({ auth: false, message: "Failed to authenticate token." });
      }
      // If token is valid, save decoded user data in request for further use
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ auth: false, message: "Error verifying token." });
  }
};
