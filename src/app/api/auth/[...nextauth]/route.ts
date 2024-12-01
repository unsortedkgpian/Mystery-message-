import NextAuth from "next-auth";
import { authOptions } from "./options";

import { handlers } from "@/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;
