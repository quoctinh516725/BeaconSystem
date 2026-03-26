import { Router } from "express";
import authRoute from "./auth.route";
import postRoute from "./post.route";

const route = Router();

route.use("/auth", authRoute);
route.use("/posts", postRoute);

export default route;
