import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as unknown as Record<string, unknown>).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthRoute = pathname.startsWith("/login");
      const isApiAuthRoute = pathname.startsWith("/api/auth");
      const isPublicRoute = pathname === "/";

      if (isApiAuthRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/personas", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isPublicRoute) {
        return false;
      }

      return true;
    },
  },
};
