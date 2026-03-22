import { prisma } from "../configs/prisma";
import { User } from "../../generated/prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIds(id: number[]): Promise<User[]> {
    return prisma.user.findMany({
      where: { id: { in: id } },
    });
  }

  async create(data: {
    email: string;
    name?: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { name: emailOrUsername }],
      },
    });
  }
}

const userRepository = new UserRepository();
export default userRepository;
