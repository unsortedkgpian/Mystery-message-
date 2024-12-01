import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import NextAuthOptions from "next-auth";
import { Session, JWT } from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authOptions = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "text",
				},
				password: { label: "Password", type: "password" },
			},

			// docs
			async authorize(credentials: any): Promise<any> {
				await dbConnect();
				// trycatch for dbconnect
				try {
					const user = await UserModel.findOne({
						$or: [
							{ email: credentials.identifier },
							{ username: credentials.identifier },
						],
					});
					// user not found
					if (!user) {
						throw new Error("No user found with this email");
					}
					// user not verified
					if (!user.isVerified) {
						throw new Error(
							"Please verify you account before login"
						);
					}

					const isPasswordCorrect = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (isPasswordCorrect) {
						return user;
					} else {
						throw new Error("Password is incorrect");
					}
				} catch (err: any) {
					throw new Error(err);
				}
			},
		}),
	],
	// next auth will design ui in its onw
	pages: {
		signIn: "/sign-in",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.AUTH_SECRET,
	callbacks: {
		async jwt({ token, user }: { token: any; user: any }) {
			// it will give error so for it we use coustom type declare in
			// types-> next auth
			if (user) {
				token._id = user._id?.toString();
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;
				token.isVerified = user.isVerified;
			}

			return token;
		},

		async session({ session, token }: { session: any; token: any }) {
			if (token) {
				session.user._id = token._id as string;
				session.user.isVerified = token.isVerified as boolean;
				session.user.isAcceptingMessages =
					token.isAcceptingMessages as boolean;
				session.user.username = token.username as string;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;
