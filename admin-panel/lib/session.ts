import { SessionOptions } from "iron-session";
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: "auth_session",
  cookieOptions: {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  },
  ttl: 60 * 60 * 2,
};
