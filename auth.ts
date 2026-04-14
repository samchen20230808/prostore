import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import { compareSync } from "bcrypt-ts-edge";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        // find user in database
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        // check password
        const isMatch = compareSync(
          credentials.password as string,
          user.password as string,
        );
        if (!isMatch) return null;

        // return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, session, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.name === "NO_NAME") {
          token.name = user.email.split("@")[0];
          // update user name in database
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        if (trigger === "signIn" || trigger === "signUp") {
          // 將目前 session cart 指定給 user (需將目前 user cart 刪了)
          // find cookies's session Cart Id & session Cart
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });
            if (sessionCart) {
              // delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      // handle session updates
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
        console.log("update token", token.name);
      }
      return token;
    },

    async session({ session, user, trigger, token }: any) {
      // token.sub 不是 user.id
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      // console.log({ session });

      // 如果是 update session 的觸發，才更新 session 中的 name（例如用戶更新了名字）
      if (trigger === "update") {
        console.log("update session");
        session.user.name = user.name;
      }
      return session;
    },

    // 每次切換route執行
    async authorized({ request, auth }) {
      // protected routes
      const protectedRoutes = [
        "/shipping-address",
        "/payment-method",
        "/place-order",
        "/profile",
        "/user",
        "/order",
        "/admin",
      ];
      // get path
      const { pathname } = request.nextUrl;

      // 1. not login , no access protected path
      if (!auth && protectedRoutes.some((path) => pathname.startsWith(path)))
        return false;

      // 2. generate sessionCartId
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();
        const newRequestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else return true;
    },
  },
});
