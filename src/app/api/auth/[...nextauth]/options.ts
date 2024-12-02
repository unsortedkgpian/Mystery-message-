// import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
// import NextAuthOptions from "next-auth";
// import { Session, JWT } from "next-auth";
import type { NextAuthConfig } from "next-auth";

interface JWTToken {
	_id?: string;
	isAcceptingMessages?: boolean;
	username?: string;
	isVerified?: boolean;
}

interface Session {
	user: {
		_id?: string;
		isVerified?: boolean;
		isAcceptingMessages?: boolean;
		username?: string;
	};
}
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				} catch (err) {
					throw new Error((err as Error).message);
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		async jwt({ token, user }: { token: JWTToken; user: User | null }) {
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		async session({
			session,
			token,
		}: {
			session: Session;
			token: JWTToken;
		}) {
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
