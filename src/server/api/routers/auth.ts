import { z } from "zod";
import bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { TRPCError } from "@trpc/server";
import mailSender from "npm/utils/mailer";
import { sessionCreator } from "npm/utils/sessionCreator";
import { setCookie } from "npm/utils/cookieHandlers";

const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN;
export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string({ required_error: "name is required" }).min(1),
        email: z.string({ required_error: "email is required" }).email(),
        password: z.string({ required_error: "password is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { name, email, password } = input;
        const passwordHash = await bcrypt.hash(password, 10);
        const saveUserDataResponse = await ctx.db.user.create({
          data: {
            email,
            name,
            password: passwordHash,
            isEmailVerified: false,
          },
        });
        if (!saveUserDataResponse) {
          throw new TRPCError({
            message: "error creating the user",
            code: "BAD_REQUEST",
          });
        }
        const otp = Math.floor(Math.random() * 90000000) + 10000000;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const mailResponseForOtpVerification = await sendEmailNotification({
          email,
          otp,
        });
        if (!mailResponseForOtpVerification) {
          throw new TRPCError({
            message: "unable to send otp for email verification",
            code: "BAD_REQUEST",
          });
          // return new NextResponse()
        }
        const currentDateTime = new Date();
        const expiryDateTime = new Date(currentDateTime.getTime() + 10 * 60000);
        const saveUserOtp = await ctx.db.otpVerification.create({
          data: {
            userId: saveUserDataResponse.id,
            otp,
            expiresAt: expiryDateTime,
          },
        });
        if (!saveUserOtp) {
          throw new TRPCError({
            message: "error saving the otp",
            code: "BAD_REQUEST",
          });
        }

        return {
          success: true,
          message: "successfully created user",
          data: saveUserDataResponse,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  verifyOTP: publicProcedure
    .input(
      z.object({
        userId: z.number({ required_error: "userId is required" }),
        otp: z.number({ required_error: "otp is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, otp } = input;
        const userOtpData = await ctx.db.otpVerification.findUnique({
          where: {
            userId: userId,
            otp,
          },
        });
        if (!userOtpData) {
          return { success: false, code: 401, message: "invalid otp" };
        }
        if (new Date() >= userOtpData.expiresAt) {
          return { success: false, message: "expired otp" };
        }
        const updateUserInfo = await ctx.db.user.update({
          where: {
            id: userId,
          },
          data: {
            isEmailVerified: true,
          },
        });
        if (!updateUserInfo) {
          return {
            success: false,
            message: "unable to update email verification status",
          };
        }
        const accessToken = await sessionCreator({ userData: updateUserInfo });
        if (accessToken) {
          setCookie(ctx.res, "turnover_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: false,
            domain: "localhost",
            secure: false,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
          setCookie(ctx.res, "turnover_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: false,
            domain: CUSTOM_DOMAIN,
            secure: false,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
        }
        return {
          success: true,
          message: "email has been successfully verified",
          data: {
            accessToken,
          },
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string({ required_error: "email is required" }).email(),
        password: z.string({ required_error: "password is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, password } = input;
        const userData = await ctx.db.user.findUnique({
          where: {
            email,
          },
        });
        if (!userData) {
          return { success: false, message: "user not found" };
        }
        const isPasswordMatch = await bcrypt.compare(
          password,
          userData.password,
        );
        if (!isPasswordMatch) {
          return { success: false, message: "incorrect password" };
        }
        const accessToken = await sessionCreator({ userData });
        if (accessToken) {
          setCookie(ctx.res, "turnover_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: false,
            domain: "localhost",
            secure: false,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
          setCookie(ctx.res, "turnover_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: false,
            domain: CUSTOM_DOMAIN,
            secure: false,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          });
        }
        return {
          success: true,
          message: "Successfully logged in",
          data: {
            accessToken,
          },
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  signOut: publicProcedure.mutation(async({ ctx })=>{
    try{
      setCookie(ctx.res, "turnover_token", "null", {
        httpOnly: true,
        path: "/",
        sameSite: false,
        domain: "localhost",
        secure: false,
        expires: new Date(),
      });
      setCookie(ctx.res, "turnover_token", "null", {
        httpOnly: true,
        path: "/",
        sameSite: false,
        domain: CUSTOM_DOMAIN,
        secure: false,
        expires: new Date(),
      });
      return {success:true,message:'Successfully signed out'}
    }catch(error){
      throw new TRPCError({code:'INTERNAL_SERVER_ERROR'})
    }
  }),
});

// methods
const sendEmailNotification = async ({
  email,
  otp,
}: {
  email: string;
  otp: number;
}) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mailResponse = await mailSender({
      email,
      title: "otp for email verification",
      body: `<h1>Please confirm your OTP</h1>
       <p>Here is your OTP code: ${otp}</p>`,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mailResponse;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
