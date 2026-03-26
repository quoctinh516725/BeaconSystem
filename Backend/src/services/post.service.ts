import {
  ForbiddenError,
  HttpException,
  NotFoundError,
  ValidationError,
} from "../error/AppError";
import {
  CreatePostRequestDto,
  PostListResponseDto,
  PostResponseDto,
  UpdatePostRequestDto,
  validateCreatePostRequest,
  validateUpdatePostRequest,
} from "../dtos/post";
import {
  mapCreatePostRequestToData,
  mapPostToResponse,
  mapUpdatePostRequestToData,
} from "../dtos/post/mapper";
import postRepository from "../repositories/post.repository";
import userRepository from "../repositories/user.repository";
import { env } from "../configs/env";
import e from "express";
import { PostStatus } from "../constants/postStatus";

class PostService {
  createPost = async (
    userId: string,
    data: CreatePostRequestDto,
  ): Promise<PostResponseDto> => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }
    try {
      const result = await axios.post<SearchResponse>(`${env.AI_URL}/search`, {
        image_url: data.image_url,
      });

      const searchData = result.data.data;

      let personId: string | undefined = undefined;

      let listPendingPersonIds: string[] = [];
      if (searchData.length > 0) {
        for (const [id, score] of searchData) {
          if (score < 0.4) {
            personId = id;
            break;
          } else if (score < 0.8) {
            listPendingPersonIds.push(id);
          } else {
            break;
          }
        }
      }

      if (personId) {
        const pendingPost = await postRepository.create({
          age: data.age,
          authorId: userId,
          date_of_birth: data.date_of_birth,
          createdAt: new Date(),
          description: data.description,
          gender: data.gender,
          hometown: data.hometown,
          image_url: data.image_url,
          location: data.location,
          lost_year: data.lost_year,
          name: data.name,
          personId,
          status: PostStatus.CONFIRMED,
          title: data.title,
        });
      }

      if (listPendingPersonIds.length > 0) {
        await postRepository.create({
          age: data.age,
          authorId: userId,
          date_of_birth: data.date_of_birth,
          createdAt: new Date(),
          description: data.description,
          gender: data.gender,
          hometown: data.hometown,
          image_url: data.image_url,
          location: data.location,
          lost_year: data.lost_year,
          name: data.name,
          personId: undefined,
          status: PostStatus.PENDING,
          title: data.title,
        });
      }

      const createdPerson: any = await axios.post(`${env.AI_URL}/persons`, {
        name: data.name,
        age: data.age,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        image_path: data.image_url,
      });

      const createdPost = await postRepository.create({
        age: data.age,
        authorId: userId,
        date_of_birth: data.date_of_birth,
        createdAt: new Date(),
        description: data.description,
        gender: data.gender,
        hometown: data.hometown,
        image_url: data.image_url,
        location: data.location,
        lost_year: data.lost_year,
        name: data.name,
        personId: createdPerson.data.id,
        status: PostStatus.CONFIRMED,
        title: data.title,
      });
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        throw new HttpException(
          `Lỗi khi tìm kiếm đặc điểm nhận dạng: ${error.response.data?.detail || "Lỗi Server"}`,
          status,
        );
      }
      throw new HttpException(
        `Lỗi khi tìm kiếm đặc điểm nhận dạng: ${error.message || "Lỗi Server"}`,
        500,
      );
    }
  };

  getPostById = async (postId: string): Promise<PostResponseDto> => {
    if (!postId || typeof postId !== "string") {
      throw new ValidationError("ID bài đăng không hợp lệ");
    }

    const post = await postRepository.findById(postId);

    if (!post) {
      throw new NotFoundError("Bài đăng không tồn tại");
    }

    return mapPostToResponse(post);
  };

  getPosts = async (
    page: number,
    limit: number,
  ): Promise<PostListResponseDto> => {
    const { data, total } = await postRepository.findAllPosts(page, limit);

    return {
      data: data.map(mapPostToResponse),
      pagination: {
        page,
        limit,
        total,
      },
    };
  };

  updatePost = async (
    postId: string,
    data: UpdatePostRequestDto,
    userId: string,
  ): Promise<PostResponseDto> => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const existingPost = await postRepository.findBasicInfoById(postId);

    if (!existingPost) {
      throw new NotFoundError("Bài đăng không tồn tại");
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenError("Bạn không có quyền chỉnh sửa bài đăng này");
    }

    const allowedData = validateUpdatePostRequest(data as any);
    const updateData = mapUpdatePostRequestToData(allowedData as any);

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("Không có trường nào để cập nhật");
    }

    const updatedPost = await postRepository.update(postId, updateData);
    return mapPostToResponse(updatedPost);
  };

  deletePost = async (postId: string, userId: string): Promise<void> => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const existingPost = await postRepository.findBasicInfoById(postId);

    if (!existingPost) {
      throw new NotFoundError("Bài đăng không tồn tại");
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenError("Bạn không có quyền xóa bài đăng này");
    }

    await postRepository.delete(postId);
  };
}
export default new PostService();
