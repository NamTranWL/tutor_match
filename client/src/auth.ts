import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sendRequest } from "./utils/api";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "./utils/errors";
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

        if (!res.statusCode) {
          return {
            _id: res.data?.user?._id,
            role: res.data?.user?.role,
            email: res.data?.user?.email,
            access_token: res.data?.user?.access_token,
          };
        } else if (+res.statusCode === 401) {
          throw new InvalidEmailPasswordError("Sai email hoặc mật khẩu");
        } else if (+res.statusCode === 400) {
          throw new InactiveAccountError("Tài khoản chưa được kích hoạt");
        } else {
          throw new Error("Internal servel error");
        }
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});

export { handlers, signIn, signOut, auth };
