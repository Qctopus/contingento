import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you would typically validate against your database
        // For demo purposes, we'll use a hardcoded user
        if (credentials?.username === "demo" && credentials?.password === "demo123") {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST } 