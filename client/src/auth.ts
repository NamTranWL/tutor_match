import NextAuth from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { sendRequest } from "./shared/utils/api";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "./shared/utils/errors";
import { IUser } from "./shared/types/next-auth";
const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        const res = await sendRequest<IBackendRes<ILogin>>({
          method: "POST",
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login/`,
          body: {
            email: credentials.email,
            password: credentials.password,
          },
        });

        if (res.statusCode === 201) {
          return {
            access_token: res.data?.access_token,
            _id: res.data?.user?._id,
            email: res.data?.user?.email,
            role: res.data?.user?.role,
            name: res.data?.user?.name,
            avatar: res.data?.user?.avatar,
          };
        } else if (+res.statusCode === 401) {
          throw new InvalidEmailPasswordError("Sai email hoặc mật khẩu");
        } else if (+res.statusCode === 400) {
          throw new InactiveAccountError("Tài khoản chưa được kích hoạt");
        } else {
          throw new Error("Internal servel error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If a specific URL is requested, honor it
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect - will be overridden by role-based logic in login page
      return baseUrl + "/";
    },
    jwt({ token, user }) {
      if (user) {
        token.user = user as IUser;
      }
      return token;
    },
    session({ session, token }) {
      const maybeUser: unknown = (token as unknown as { user?: unknown })?.user;
      if (
        maybeUser &&
        typeof maybeUser === "object" &&
        (maybeUser as Record<string, unknown>)._id &&
        (maybeUser as Record<string, unknown>).email &&
        (maybeUser as Record<string, unknown>).role
      ) {
        const u = maybeUser as IUser;
        const base = session.user as AdapterUser;
        const merged: AdapterUser & IUser = { ...base, ...u };
        session.user = merged;
      }
      return session;
    },
  },
});

export { handlers, signIn, signOut, auth };
