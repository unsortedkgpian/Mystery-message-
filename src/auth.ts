import NextAuth from "next-auth";
import { authOptions } from "./app/api/auth/[...nextaut]/options";

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authOptions,
});
