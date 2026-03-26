import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ValidationError } from "../error/AppError";
import { sendSuccess } from "../utils/response";
import postService from "../services/post.service";
import { validateCreatePostRequest } from "../dtos/post";
import { uploadStream } from "../utils/uploadStream";

class PostController {
  createPost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const file = req.file;

      if (!file) {
        throw new ValidationError("Vui lòng tải lên một hình ảnh");
      }
      const data = validateCreatePostRequest(req.body);

      const result: any = await uploadStream(file, {
        folder: `beacons/posts/${userId}/images`,
        publicId: `post_${Date.now()}_${Math.random()}`,
        overwrite: false,
      });

      if (!result || !result.secure_url) {
        throw new Error("Lỗi khi tải lên hình ảnh");
      }

      const createdPost = await postService.createPost(userId, {
        ...data,
        image_url: result.secure_url,
      });
      sendSuccess(res, createdPost, "Tạo bài đăng thành công");
    },
  );

  updatePost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;
      const postId = req.params.id;
      if (!postId) {
        throw new ValidationError("Vui lòng cung cấp ID của bài đăng");
      }

      const data = req.body;
      const updatedPost = await postService.updatePost(
        postId as string,
        data,
        userId,
      );
      sendSuccess(res, updatedPost, "Cập nhật bài đăng thành công");
    },
  );

  deletePost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId!;

      const postId = req.params.id;
      if (!postId) {
        throw new ValidationError("Vui lòng cung cấp ID của bài đăng");
      }

      await postService.deletePost(postId as string, userId);
      sendSuccess(res, null, "Xóa bài đăng thành công");
    },
  );

  getPostById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const postId = req.params.id;
      if (!postId) {
        throw new ValidationError("Vui lòng cung cấp ID của bài đăng");
      }

      const post = await postService.getPostById(postId as string);
      sendSuccess(res, post, "Lấy bài đăng thành công");
    },
  );

  getPosts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = req.pagination!;
      const posts = await postService.getPosts(page, limit);
      sendSuccess(res, posts, "Lấy danh sách bài đăng thành công");
    },
  );
}

export default new PostController();
