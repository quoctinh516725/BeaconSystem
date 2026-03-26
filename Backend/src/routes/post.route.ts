import { Router } from "express";
import postController from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validatePagination } from "../validations/public.validation";
import { upload } from "../configs/multer";

const router = Router();

// Public read routes
router.get("/", validatePagination, postController.getPosts);
router.get("/:id", postController.getPostById);

// Authenticated write routes
router.use(authenticate);
router.post("/", upload.single("image"), postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

export default router;
