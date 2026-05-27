import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: "Demo Mode",
      credentials: {},
      async authorize() {
        // Automatically fetch or create a demo user in SQLite
        let user = await prisma.user.findUnique({
          where: { email: "demo@gradatlas.com" },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: "demo-user-id",
              name: "Demo Scholar",
              email: "demo@gradatlas.com",
              image: "https://api.dicebear.com/7.x/bottts/svg?seed=gradatlas",
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email, name, image } = user;
        if (!email) return false;

        // Auto create user in DB if they don't exist yet
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: name || "Scholar",
              email: email,
              image: image || null,
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
        } else {
          (session.user as any).id = token.sub || "";
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "gradatlas-local-development-secret-key-32-chars-long-or-more",
};
