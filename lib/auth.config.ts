import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — NO database or bcrypt imports.
 * Used only in middleware.ts (Edge runtime).
 * The full config with Mongoose/bcrypt lives in lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [],          // providers are not evaluated in middleware
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/login";

      if (!isLoggedIn && !isLoginPage) return false;   // redirect to signIn page
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },
  },
};
