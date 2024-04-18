const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

// Start the server
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
