// Import required modules and utilities
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbConnectionHandlers";
import adminModel from "@/models/admin.model";
import { errorHandler } from "@/utils/errorHandler";

// ========== MAIN AUTH CONFIGURATION ==========
export const authOption: NextAuthOptions = {
  // ========== PROVIDERS CONFIGURATION ==========

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // ========== LOGIN FORM FIELDS DEFINITION ==========

      credentials: {
        identifier: { label: "Email/Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // ========== AUTHORIZATION LOGIC ==========

      async authorize(credentails: any): Promise<any> {
        await dbConnect();
        try {
          // ========== USER LOOKUP ==========
           // IMPORTANT: Add .select('+password') if password field is not selected by default

          const admin = await adminModel.findOne({
            $or: [
              { email: credentails.identifier },
              { username: credentails.identifier },
            ],
          }).select('+password'); // Critical for password comparison
          // ========== USER NOT FOUND HANDLING ==========

          if (!admin) {
            
            return errorHandler({
              error: new Error("Admin not found"),
              message: "No account found with these credentails",
              status: 404,
              statusText: "Not found",
            });
          }
          // ========== PASSWORD VERIFICATION ==========

          const isPasswordCorrect = await bcrypt.compare(
            credentails.password,
            admin.password
          );
          // ========== INVALID PASSWORD HANDLING ==========

          if (!isPasswordCorrect) {
            return errorHandler({
              error: new Error("Invalid password"),
              message: "Invalid credentials",
              status: 401,
              statusText: "Unauthorized",
            });
          }
          // ========== SUCCESSFUL AUTHENTICATION ==========

          return admin;
        } catch (error: any) {
          return errorHandler({
            // ========== ERROR HANDLING ==========

            error: error,
            message: "Authentication failed",
            status: 500,
            statusText: "Internal Server Error",
          });
        }
      },
    }),
  ],
    // ========== SESSION AND JWT CALLBACKS ==========

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          // Match the MongoDB _id field
          token._id = user._id?.toString(); // Changed from user.id
          token.name = user.name;
        }
        return token;
      },
      async session({ session, token }) {
        return {
          ...session,
          user: {
            ...session.user,
            _id: token._id as string,
            name: token.name as string,
          },
        };
      },
    },
    // ========== PAGE CONFIGURATION ==========

  pages:{
    signIn:"/signin"
  },
    // ========== SESSION CONFIGURATION ==========

  session:{
    strategy:"jwt",
    // Recommended to add session expiration
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret:process.env.NEXTAUTH_SECRET
};
