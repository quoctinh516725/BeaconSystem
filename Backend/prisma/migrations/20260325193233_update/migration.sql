/*
  Warnings:

  - Added the required column `age` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "hometown" DROP NOT NULL,
ALTER COLUMN "lost_year" DROP NOT NULL;
