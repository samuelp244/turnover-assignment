import cookie, { type CookieSerializeOptions } from "cookie";
import { type NextApiResponse } from "next";

export function getCookies(req: Request) {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return {};
  return cookie.parse(cookieHeader);
}

export function getCookie(req: Request, name: string) {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return;
  const cookies = cookie.parse(cookieHeader);
  return cookies[name];
}

export function setCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  options?: CookieSerializeOptions,
) {
  res.setHeader("Set-Cookie", cookie.serialize(name, value, options));
}
