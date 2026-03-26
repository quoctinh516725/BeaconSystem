import { PostStatus } from "../../constants/postStatus";
import { ValidationError } from "../../error/AppError";

export type CreatePostRequestDto = {
  title: string;
  age: number;
  name: string;
  gender: string;
  location: string;
  status: string;
  image_url: string;
  description: string;
  createdAt: Date;

  personId?: string;
  date_of_birth?: Date;
  hometown?: string;
  lost_year?: number;
};

export type UpdatePostRequestDto = {
  title?: string;
  age?: number;
  name?: string;
  gender?: string;
  location?: string;
  status?: string;
  description?: string;
  date_of_birth?: Date;
  hometown?: string;
  lost_year?: number;
};

export const validateCreatePostRequest = (
  data: CreatePostRequestDto,
): CreatePostRequestDto => {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Vui lòng nhập tiêu đề");
  }
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Vui lòng nhập tên người mất tích");
  }
  if (!data.age || data.age <= 0) {
    errors.push("Vui lòng nhập tuổi hợp lệ");
  }
  if (!data.gender || !["male", "female"].includes(data.gender.toLowerCase())) {
    errors.push("Vui lòng chọn giới tính hợp lệ");
  }
  if (!data.location || data.location.trim().length === 0) {
    errors.push("Vui lòng cung cấp nơi ở hiện tại");
  }
  if (!data.status || !Object.values(PostStatus).includes(data.status as PostStatus)) {
    errors.push("Vui lòng chọn trạng thái hợp lệ");
  }
  if (!data.image_url || data.image_url.trim().length === 0) {
    errors.push("Vui lòng cung cấp hình ảnh");
  }
  if (!data.description || data.description.trim().length === 0) {
    errors.push("Vui lòng nhập mô tả chi tiết đặc điểm nhận dạng");
  }
  if (data.date_of_birth && isNaN(data.date_of_birth.getTime())) {
    errors.push("Ngày sinh không hợp lệ");
  }
  if (
    data.lost_year &&
    (data.lost_year < 1900 || data.lost_year > new Date().getFullYear())
  ) {
    errors.push("Năm mất tích không hợp lệ");
  }
  if (data.personId && data.personId.trim().length === 0) {
    errors.push("personId không hợp lệ");
  }
  if (data.hometown && data.hometown.trim().length === 0) {
    errors.push("Quê quán không hợp lệ");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  return data;
};

export const validateUpdatePostRequest = (
  data: UpdatePostRequestDto,
): UpdatePostRequestDto => {
  const errors: string[] = [];
  if (data.title !== undefined && data.title.trim().length === 0) {
    errors.push("Vui lòng nhập tiêu đề");
  }
  if (data.name !== undefined && data.name.trim().length === 0) {
    errors.push("Vui lòng nhập tên người mất tích");
  }
  if (data.age !== undefined && data.age <= 0) {
    errors.push("Vui lòng nhập tuổi hợp lệ");
  }
  if (
    data.gender !== undefined &&
    !["male", "female"].includes(data.gender.toLowerCase())
  ) {
    errors.push("Vui lòng chọn giới tính hợp lệ");
  }
  if (data.location !== undefined && data.location.trim().length === 0) {
    errors.push("Vui lòng cung cấp nơi ở hiện tại");
  }
  if (
    data.status !== undefined &&
    !Object.values(PostStatus).includes(data.status as PostStatus)
  ) {
    errors.push("Vui lòng chọn trạng thái hợp lệ");
  }

  if (data.description !== undefined && data.description.trim().length === 0) {
    errors.push("Vui lòng nhập mô tả chi tiết đặc điểm nhận dạng");
  }

  if (data.date_of_birth !== undefined && isNaN(data.date_of_birth.getTime())) {
    errors.push("Vui lòng nhập ngày sinh hợp lệ");
  }

  if (
    data.lost_year !== undefined &&
    (data.lost_year < 1900 || data.lost_year > new Date().getFullYear())
  ) {
    errors.push("Vui lòng nhập năm mất tích hợp lệ");
  }

  if (data.hometown !== undefined && data.hometown.trim().length === 0) {
    errors.push("Vui lòng nhập quê quán hợp lệ");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
  return data;
};
