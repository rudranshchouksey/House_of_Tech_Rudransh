import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/db"

import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Demo Account",
      credentials: {
        email: { label: "Email (Any)", type: "text", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || "demo@example.com";
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name: email.split("@")[0] }
        });
        return user;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
