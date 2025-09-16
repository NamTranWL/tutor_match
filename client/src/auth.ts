import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { send } from "process";
import { sendRequest } from "./utils/api";
import { email } from "zod";
const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        try {
          const res = await sendRequest({
            method: "POST",
            url: `http://localhost:8080/api/v1/auth/login/`,
            body: {
              email: credentials.email,
              password: credentials.password,
            },
          });
          console.log(">>> check user: ", res);
        } catch (error) {
          console.log(">>> check error: ", error);
        }

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.");
        }

        // return user object with their profile data
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});

export { handlers, signIn, signOut, auth };
