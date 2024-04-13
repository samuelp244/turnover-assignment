import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { TRPCError } from "@trpc/server";
import mailSender from "npm/utils/mailer";
import { sessionCreator } from "npm/utils/sessionCreator";
import { setCookie } from "npm/utils/cookieHandlers";

export const interestsRouter = createTRPCRouter({
  addInterestsToDB: privateProcedure
    .input(
      z.object({
        interests: z.array(
          z.object({
            interestId: z.string({ required_error: "required" }),
            interestName: z.string({ required_error: "required" }),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { interests } = input;
        const currentInterests = await ctx.db.interest.findMany({});
        if (currentInterests.length > 0) {
          return { success: false, message: "data already exists" };
        }
        const modifiedInterests = interests.map((o) => {
          return { id: o.interestId, name: o.interestName };
        });
        const response = await ctx.db.interest.createMany({
          data: modifiedInterests,
        });
        if (!response) return { success: false, message: "" };
        return { success: true, message: "successfully added" };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addUserInterest: privateProcedure
    .input(
      z.object({
        interestId: z.string({ required_error: "required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId;
        const { interestId } = input;
        const response = await ctx.db.userInterest.create({
          data: {
            userId,
            interestId,
          },
        });
        if (!response) {
          return { success: false, message: "unable to add user's interest" };
        }
        return {
          success: "true",
          message: "Successfully added user's interest",
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteUserInterest: privateProcedure
    .input(
      z.object({
        userInterestId: z.number({ required_error: "required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId;
        const { userInterestId } = input;
        const response = await ctx.db.userInterest.delete({
          where: {
            userId,
            id:userInterestId,
          },
        });
        if (!response) {
          return { success: false, message: "unable to add user's interest" };
        }
        return {
          success: "true",
          message: "Successfully added user's interest",
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  fetchAllInterests: privateProcedure
    .input(z.object({ pageSize: z.number(), pageNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const { pageSize, pageNumber } = input;
        const skip = pageSize * (pageNumber - 1);
        const take = pageSize;
        const response = await ctx.db.interest.findMany({ skip, take });
        if (!response)
          return { success: false, message: "unable tp fetch data" };

        return {
          success: true,
          message: "Successfully fetched data",
          interests: response,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  fetchUserInterests: privateProcedure.query(async ({ ctx }) => {
    try {
      const { userId } = ctx;
      const response = await ctx.db.userInterest.findMany({
        where: { userId },
      });
      if (!response) return { success: false, message: "unable tp fetch data" };
       return {
         success: true,
         message: "Successfully fetched user interests",
         interests: response,
       };
    } catch (error) {
      console.log(error);
    }
  }),
});
