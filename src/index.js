const express = require("express");
require("./db/mongoose");
const router = require("./routers/index");

const app = express();
const port = process.env.PORT;



app.use(express.json());
app.use(router);

app.listen(port, () => {
    console.log("Server is running"+port)
});
