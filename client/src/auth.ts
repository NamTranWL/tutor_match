import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sendRequest } from "./utils/api";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "./utils/errors";
import { IUser } from "./types/next-auth";
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
      if (url.startsWith("/")) return `${baseUrl}${url}`; // nội bộ
      if (new URL(url).origin === baseUrl) return url; // cùng origin
      return baseUrl + "/"; // mặc định
    },
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.user = user as IUser;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as IUser) = token.user;
      return session;
    },
  },
});

export { handlers, signIn, signOut, auth };
