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
  validateUpdatePostRequest,
} from "../dtos/post";
import {
  mapPostToResponse,
  mapUpdatePostRequestToData,
} from "../dtos/post/mapper";
import postRepository from "../repositories/post.repository";
import userRepository from "../repositories/user.repository";
import { env } from "../configs/env";
import { PostStatus } from "../constants/postStatus";
import axios from "axios";

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
      const result = await axios.post<SearchResponse>(`${env.AI_URL}/search/`, {
        image_base64: data.image_base64,
      });      

      const searchData = result.data.data;
      

      const postData = await postRepository.findByPersonIds(
        searchData.map(([id, _score]) => id),
      );

      const personPostMap = new Map(
        postData.map((post) => [post.personId, post]),
      );

      let personId: string | undefined = undefined;
      let listPendingPersonIds: string[] = [];
      
      if (searchData.length > 0) {
        for (const [id, score] of searchData) {          
          if (score < 0.6) {
            personId = id;
            break;
          } else if (score < 0.8) {
            listPendingPersonIds.push(id);
          } else {
            break;
          }
        }
      }
      console.log("scoresearchData:", searchData);

      const createPostData: any = {
        age: Number(data.age),
        authorId: userId,
        date_of_birth: data.date_of_birth,
        createdAt: new Date(),
        description: data.description,
        gender: data.gender,
        hometown: data.hometown,
        image_url: data.image_url,
        location: data.location,
        lost_year: Number(data.lost_year),
        name: data.name,
        title: data.title,
      };
      
      if (personId) {
        createPostData.personId = personId;
        createPostData.status = PostStatus.CONFIRMED;
      } else if (listPendingPersonIds.length > 0) {
        createPostData.status = PostStatus.PENDING;
      } else {
        const createdPerson: any = await axios.post(`${env.AI_URL}/embedding/`, {
          name: data.name,
          age: data.age,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          image_base64: data.image_base64,
        });

        createPostData.personId = createdPerson.data.id;
        createPostData.status = PostStatus.CONFIRMED;
      }

      let createdPost;
      try {
        
        createdPost = await postRepository.create({
          ...createPostData,
          authorId: userId,
        });
        console.log("3: createdPost:", createdPost);
      } catch (err) {
        console.error("Lỗi khi tạo post:", err);
        throw err;
      }
      const similarPersons = listPendingPersonIds
        .map((id) => {
          const post = personPostMap.get(id);
          if (!post) return null;
          return {
            personId: id,
            postId: post.id,
            image_url: post.image_url,
            name: post.name,
            age: post.age,
            gender: post.gender,
            hometown: post.hometown,
            location: post.location,
            lost_year: post.lost_year,
            description: post.description,
            date_of_birth: post.date_of_birth,
          };
        })
        .filter((item) => item !== null);
      return mapPostToResponse({ ...createdPost, similarPersons });
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        let errorMessage = "Lỗi Server";
        const detail = error.response.data?.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail[0].msg || detail[0].loc;
        }
        throw new HttpException(
          `Lỗi khi tìm kiếm đặc điểm nhận dạng: ${errorMessage}`,
          status,
        );
      }
      throw new HttpException(
        `Lỗi khi tìm kiếm đặc điểm nhận dạng: Lỗi Server`,
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

  confirmPost = async (
    postId: string,
    userId: string,
    data: { personId: string | null; image_base64?: string },
  ): Promise<PostResponseDto> => {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new NotFoundError("Bài đăng không tồn tại");
    }

    if (post.author.id !== userId) {
      throw new ForbiddenError("Bạn không có quyền thực hiện hành động này");
    }

    let finalPersonId = data.personId;

    // Nếu người dùng reject (personId === null), gọi AI để tạo định danh (person) mới
    if (!finalPersonId) {
      if (!data.image_base64) {
        throw new ValidationError("Thiếu dữ liệu hình ảnh để tạo định danh mới");
      }

      try {
        const createdPerson: any = await axios.post(`${env.AI_URL}/embedding/`, {
          name: post.name,
          age: post.age,
          gender: post.gender,
          date_of_birth: post.date_of_birth,
          image_base64: data.image_base64,
        });

        finalPersonId = createdPerson.data.id;
      } catch (error: any) {
        console.error("Lỗi khi tạo định danh mới tại AI Service:", error);
        throw new HttpException("Lỗi kết nối với AI Service khi tạo định danh mới", 500);
      }
    }

    // Cập nhật bài đăng với personId chính xác và chuyển status sang CONFIRMED
    const updatedPost = await postRepository.update(postId, {
      personId: finalPersonId,
      status: PostStatus.CONFIRMED,
    } as any);

    return mapPostToResponse(updatedPost);
  };
}
export default new PostService();
