import NextAuth from "next-auth";
import credentialsProvider from "next-auth/providers/credentials";
import {
  type SIWESession,
  /* verifySignature, */
  getChainIdFromMessage,
  getAddressFromMessage,
} from "@reown/appkit-siwe";
import { createPublicClient, http, parseSignature as viemParseSignature } from "viem";
import { PolyBet__factory } from "../../../../../../contracts/typechain-types/factories/contracts/polybet.sol/PolyBet__factory";
import { polybetsContractAddress } from "polybets-common";

declare module "next-auth" {
  interface Session extends SIWESession {
    address: string;
    chainId: number;
    authToken?: `0x${string}`;
  }
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

const providers = [
  credentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message) {
          throw new Error("SiweMessage is undefined");
        }
        const { message, signature } = credentials;
        const address = getAddressFromMessage(message);
        const chainId = getChainIdFromMessage(message);

        // for the moment, the verifySignature is not working with social logins and emails  with non deployed smart accounts
        /*  const isValid = await verifySignature({
          address,
          message,
          signature,
          chainId,
          projectId,
        }); */
        // we are going to use https://viem.sh/docs/actions/public/verifyMessage.html
        const publicClient = createPublicClient({
          transport: http(
            `https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`
          ),
        });
        const isValid = await publicClient.verifyMessage({
          message,
          address: address as `0x${string}`,
          signature: signature as `0x${string}`,
        });
        // end o view verifyMessage

        let authToken: `0x${string}` | undefined;
        if (isValid) {
          try {
            const { r, s, v } = viemParseSignature(signature as `0x${string}`);

            // Use Sapphire public client to call login
            const sapphireClient = createPublicClient({
              transport: http("https://testnet.sapphire.oasis.io"),
            });

            authToken = (await sapphireClient.readContract({
              abi: PolyBet__factory.abi,
              address: polybetsContractAddress as `0x${string}`,
              functionName: "login",
              args: [message, { r: r as `0x${string}`, s: s as `0x${string}`, v: v as bigint }],
            })) as `0x${string}`;
            console.debug("[NextAuth authorize] isValid", isValid, "authToken", authToken);
          } catch (err) {
            console.error("Failed to obtain authToken via login", err);
          }
        }

        if (isValid) {
          return {
            id: `${chainId}:${address}`,
            authToken,
          } as { id: string; authToken?: `0x${string}` };
        }

        return null;
      } catch {
        return null;
      }
    },
  }),
];

const handler = NextAuth({
  // https://next-auth.js.org/configuration/providers/oauth
  secret: nextAuthSecret,
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (
        typeof user === "object" &&
        user !== null &&
        "authToken" in user &&
        typeof (user as { authToken?: string }).authToken === "string"
      ) {
        token.authToken = (user as { authToken: string }).authToken;
      }
      return token;
    },
    session({ session, token }) {
      if (!token.sub) {
        return session;
      }

      const [, chainId, address] = token.sub.split(":");
      if (chainId && address) {
        session.address = address;
        session.chainId = parseInt(chainId, 10);
      }

      if ("authToken" in token) {
        session.authToken = token.authToken as `0x${string}`;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };
