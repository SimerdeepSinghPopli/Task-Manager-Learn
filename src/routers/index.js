const userRouter = require("./User");
const TaskRouter = require("./Task");
const express = require("express");
const rootRouter = new express.Router();

rootRouter.use( userRouter);
rootRouter.use( TaskRouter);

module.exports = rootRouter;