/**
 * next-auth.providers.js Example
 *
 * This file returns a simple array of oAuth Provider objects for NextAuth.
 *
 * This example returns an array based on what environment variables are set,
 * with explicit support for Google, but it can be used to add strategies for other oAuth providers.
 *
 * Environment variables for this example:
 * GOOGLE_ID=
 * GOOGLE_SECRET=
 *
 * If you wish, you can put these in a `.env` to seperate your environment 
 * specific configuration from your code.
 **/

// Load environment variables from a .env file if one exists
require('dotenv').load()

module.exports = () => {
  let providers = []

  if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
    providers.push({
      providerName: 'Google',
      providerOptions: {
        //scope: ['https://www.googleapis.com/auth/drive.file']
        scope: ['profile', 'email']
      },
      Strategy: require('passport-google-oauth').OAuth2Strategy,
      strategyOptions: {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      },
      getProfile(profile) {
        // Normalize profile into one with {id, name, email} keys
        return {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        }
      }
    })
  }
  
  return providers
}