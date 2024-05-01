const axios = require("axios");
const { decode } = require("jsonwebtoken");

const authController = {
  login: (req, res) => {
    const cognitoLoginUrl = `https://${
      process.env.COGNITO_DOMAIN
    }/login?client_id=${
      process.env.COGNITO_CLIENT_ID
    }&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(
      process.env.COGNITO_REDIRECT_URI
    )}`;
    res.redirect(cognitoLoginUrl);
  },
  callback: async (req, res) => {
    const { code } = req.query;

    try {
      const cognitoLoginUrl = `https://${
        process.env.COGNITO_DOMAIN
      }/oauth2/token?grant_type=authorization_code&client_id=${
        process.env.COGNITO_CLIENT_ID
      }&client_secret=${
        process.env.COGNITO_CLIENT_SECRET
      }&code=${code}&redirect_uri=${encodeURIComponent(
        process.env.COGNITO_REDIRECT_URI
      )}`;

      const { data: tokens } = await axios.post(cognitoLoginUrl);
      const user = decode(tokens.access_token);
      // res.send(`Username: ${user.username}`);
      res.redirect(`/?access_token=${tokens.access_token}`);
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).send("Authentication failed.");
    }
  },
};

module.exports = authController;
