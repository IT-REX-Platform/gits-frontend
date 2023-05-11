import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    KeycloakProvider({
      clientId: "gits-frontend", //process.env.KEYCLOAK_ID,
      clientSecret: "z7TLddMf82ZFqDbl2vsa6K5Lp106Bv4k", //process.env.KEYCLOAK_SECRET,
      issuer: "http://localhost:8080/auth/realms/GITS", //process.env.KEYCLOAK_ISSUER,
    }),
  ],
};
export default NextAuth(authOptions);
