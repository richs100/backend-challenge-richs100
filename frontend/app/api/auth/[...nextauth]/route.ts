import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials, req) {
        if (credentials?.username) {
          return { id: credentials.username, name: credentials.username }
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  jwt: {
    encode: ({ secret, token }) => {
      if (!token) {
        throw new Error('No token to encode')
      }
      return jwt.sign(token, secret, { algorithm: 'HS512' })
    },
    decode: ({ secret, token }) => {
      if (!token) {
        throw new Error('No token to decode')
      }
      return jwt.verify(token, secret, { algorithms: ['HS512'] }) as jwt.JwtPayload
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
