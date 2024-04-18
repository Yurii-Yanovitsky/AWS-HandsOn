const axios = require("axios");

exports.getPublicIp = async (req, res) => {
  try {
    const response = await axios.get("https://ipinfo.io/ip");
    const publicIp = response.data.trim();
    res.send(`Public IP Address of the EC2 instance: ${publicIp}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving public IP");
  }
};
