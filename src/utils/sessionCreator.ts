import { type userDateType } from "npm/types";
import jwt from "jsonwebtoken";
import { db } from "npm/server/db";
const JWT_SECRET = process.env.JWT_SECRET ?? "";

const sessionCreator = async ({ userData }: { userData: userDateType }) => {
  try {
    const payload = {
      userId: userData.id,
      isEmailVerified: userData.isEmailVerified,
      email: userData.email,
      name: userData.name,
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      algorithm: "HS256",
    });
    await db.session.create({
      data: {
        userId: userData.id,
        expiresAt:  new Date(Date.now() + 1000 * 60 * 60 * 24),
        createdAt: new Date(),
      },
    });
    return accessToken;
  } catch (error) {
    console.log(error);
  }
};

export { sessionCreator };
