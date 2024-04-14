import { TRPCError, initTRPC } from "@trpc/server";
import {
  type NextApiRequest,
  type NextApiResponse,
  type CreateNextContextOptions,
} from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "npm/server/db";
import jwt from "jsonwebtoken";
import { type userDataPayload } from "npm/redux/userSlice";

type CreateContextOptions = {
  req: NextApiRequest;
  res: NextApiResponse;
};
const JWT_SECRET = process.env.JWT_SECRET ?? "";

const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db,
    req: _opts.req,
    res: _opts.res,
  };
};

export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({ req: _opts.req, res: _opts.res });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const isAuth = t.middleware(async ({ ctx, next }) => {
  const authToken = ctx.req.headers.authorization;
  if (typeof authToken !== "string") {
    throw new TRPCError({ code: "PARSE_ERROR" });
  }
  const [tokenType, accessToken] = authToken?.split(" ");
  if (
    typeof tokenType !== "string" ||
    typeof accessToken !== "string" ||
    tokenType !== "Bearer"
  ) {
    throw new TRPCError({ code: "PARSE_ERROR" });
  }
  if (!accessToken) throw new TRPCError({ code: "UNAUTHORIZED" });

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as userDataPayload;
    if (payload) {
      return next({
        ctx: {
          userId: payload.userId,
        },
      });
    }
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
