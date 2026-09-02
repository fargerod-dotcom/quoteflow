import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/auth-email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT (not database) sessions so middleware can verify auth on the Edge
  // runtime without a Prisma/DB call. The Prisma adapter is still needed to
  // persist magic-link VerificationToken rows regardless of session strategy.
  session: { strategy: "jwt" },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "QuoteFlow <noreply@example.com>",
      sendVerificationRequest: sendMagicLinkEmail,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
