// noinspection JSUnusedGlobalSymbols

import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/prisma/prisma'
import EmailProvider from 'next-auth/providers/email'
import nodeMailjet from 'node-mailjet'
import { generateOTP } from '@/utils/generateOtp'
import { visitorEnabled, findVisitorSession } from './visitorAccess'

//trying to deploy

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    adapter: {
        ...PrismaAdapter(prisma),
        ...(visitorEnabled
            ? {
                  async getSessionAndUser(sessionToken: string) {
                      const record = await findVisitorSession(sessionToken)
                      if (!record || !record.user.email) return null
                      const { user, ...session } = record
                      return {
                          user: { ...user, email: record.user.email },
                          session,
                      }
                  },
              }
            : {}),
    },
    session: {
        strategy: 'database',
        ...(visitorEnabled ? { maxAge: 3600, updateAge: 3600 } : {}),
    },
    theme: {
        colorScheme: 'dark',
        brandColor: '#52e3c2',
        logo: './public/logo-500x300.png',
    },
    providers: visitorEnabled
        ? []
        : [
              EmailProvider({
                  maxAge: 15 * 60,
                  generateVerificationToken() {
                      return generateOTP()
                  },
                  async sendVerificationRequest(params) {
                      const { identifier, provider, token } = params
                      const url = new URL(params.url)
                      // url.searchParams.delete("token") // uncomment if you want the user to type this manually
                      const signInURL = new URL(
                          `/auth/email?${url.searchParams}`,
                          url.origin
                      )
                      const escapedHost = signInURL.host.replace(
                          /\./g,
                          '&#8203;.'
                      )

                      const apiKey = process.env.EMAIL_API
                      const apiSecret = process.env.EMAIL_SECRET
                      if (!apiKey || !apiSecret)
                          throw new Error('Email provider is not configured')
                      const mailjet = nodeMailjet.apiConnect(apiKey, apiSecret)

                      await mailjet.post('send', { version: 'v3.1' }).request({
                          Messages: [
                              {
                                  From: {
                                      Email: 'tofutracker@mail.com',
                                      Name: 'Tofutracker',
                                  },
                                  To: [
                                      {
                                          Email: identifier,
                                          Name: identifier,
                                      },
                                  ],
                                  Subject: 'Greetings from TofuTracker.',
                                  TextPart: `Sign in on ${signInURL} using the verification code: ${token}`,
                                  HTMLPart: `<body style="background: #f9f9f9;"><table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;"> <tr><td>Sign in @ ${signInURL}</td></tr>  <tr> <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;"> Sign in to <strong>${escapedHost}</strong> using this verification code: ${token}</td></tr><tr> <td align="center" style="padding: 20px 0;"> <table border="0" cellspacing="0" cellpadding="0"> <tr> <td align="center" style="border-radius: 5px;" bgcolor="#52e3c2"><a href="${signInURL}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color:'black'; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #52e3c2; display: inline-block; font-weight: bold;">Sign in</a></td></tr></table> </td></tr><tr> <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;"> If you did not request this email you can safely ignore it. </td></tr></table></body>`,
                                  CustomId: 'OTP-Email',
                              },
                          ],
                      })
                  },
              }),
          ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signOut: '/auth/signout',
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user?.role) {
                token.role = user.role
            }

            return token
        },
        async session({ session, user }) {
            if (session?.user) {
                session.user.role = user.role
                session.user.userId = user.id
                session.user.team = user.team
            }
            return session
        },
    },
}
