import NextAuth from "next-auth";
import { authOption } from "./option";

declare module 'next-auth' {
    interface Session {
      user: {
        _id: string;
        name: string;
        email?: string;
      };
    }
  
    interface User {
      _id: string;
      name: string;
      email?: string;
    }
  }
  
  declare module 'next-auth/jwt' {
    interface JWT {
      _id: string;
      name: string;
      email?: string;
    }
  }

const handler = NextAuth(authOption);

export { handler as GET, handler as POST };