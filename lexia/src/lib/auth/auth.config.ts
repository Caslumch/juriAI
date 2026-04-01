import type { NextAuthConfig } from "next-auth";
import "./types";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = ["/login", "/register"].some((r) =>
        nextUrl.pathname.startsWith(r),
      );

      if (isPublicRoute && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }
      if (!isPublicRoute && !isLoggedIn) {
        return false; // NextAuth redirects to pages.signIn
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
