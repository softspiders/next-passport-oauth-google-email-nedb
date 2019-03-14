/**
 * next-auth.functions.js Example
 *
 * This file defines functions NextAuth to look up, add and update users.
 *
 * It returns a Promise with the functions matching these signatures:
 *
 * {
 *   find: ({
 *     id,
 *     email,
 *     emailToken,
 *     provider,
 *     poviderToken
 *   } = {}) => {},
 *   update: (user) => {},
 *   insert: (user) => {},
 *   remove: (id) => {},
 *   serialize: (user) => {},
 *   deserialize: (id) => {}
 * }
 *
 * Each function returns Promise.resolve() - or Promise.reject() on error.
 *
 * This specific example supports NeDB, but can be refactored
 * to work with any database.
 **/

// Load environment variables from a .env file if one exists
require('dotenv').load()

// This config uses NeDB, which it defaults to if no DB URI 
// is specified. NeDB is an in-memory only database intended here for testing.
const objectId = (id) => { return id }
const NeDB = require('nedb')

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('next-auth.functions: return new Promise((resolve, reject) => {');
    // NeDB is not persistant and is intended for testing only.
    let collection = new NeDB({ autoload: true })
    collection.loadDatabase(err => {
      if (err) return reject(err)
      resolve(collection)
    })
  })
  .then(usersCollection => {
    console.log('next-auth.functions: usersCollection =>');
    return Promise.resolve({
      // If a user is not found find() should return null (with no error).
      find: ({provider} = {}) => {
        console.log('next-auth.functions: find');
        let query = {}

        if(provider) {
          query = { [`${provider.name}.id`]: provider.id }
        }

        return new Promise((resolve, reject) => {
          usersCollection.findOne(query, (err, user) => {
            if (err) return reject(err)
            return resolve(user)
          })
        })
      },

      // The user parameter contains a basic user object to be added to the DB.
      // The oAuthProfile parameter is passed when signing in via oAuth.
      //
      // The optional oAuthProfile parameter contains all properties associated
      // with the users account on the oAuth service they are signing in with.
      //
      // You can use this to capture profile.avatar, profile.location, etc.
      insert: (user, oAuthProfile) => {
        console.log('next-auth.functions: insert');
        return new Promise((resolve, reject) => {
          usersCollection.insert(user, (err, response) => {
            if (err) return reject(err)

            // Mongo Client automatically adds an id to an inserted object, but 
            // if using a work-a-like we may need to add it from the response.
            if (!user._id && response._id) user._id = response._id
  
            return resolve(user)
          })
        })
      },

      // The user parameter contains a basic user object to be added to the DB.
      // The oAuthProfile parameter is passed when signing in via oAuth.
      //
      // The optional oAuthProfile parameter contains all properties associated
      // with the users account on the oAuth service they are signing in with.
      //
      // You can use this to capture profile.avatar, profile.location, etc.
      update: (user, profile) => {
        console.log('next-auth.functions: update');
        return new Promise((resolve, reject) => {
          usersCollection.update({_id: objectId(user._id)}, user, {}, (err) => {
            if (err) return reject(err)
            return resolve(user)
          })
        })
      },

      // The remove parameter is passed the ID of a user account to delete.
      //
      // This method is not used in the current version of next-auth but will
      // be in a future release, to provide an endpoint for account deletion.
      remove: (id) => {
        console.log('next-auth.functions: remove');
        return new Promise((resolve, reject) => {
          usersCollection.remove({_id: objectId(id)}, (err) => {
            if (err) return reject(err)
            return resolve(true)
          })
        })
      },

      // Seralize turns the value of the ID key from a User object
      serialize: (user) => {
        console.log('next-auth.functions: serialize');
        // Supports serialization from Mongo Object *and* deserialize() object
        if (user.id) {
          // Handle responses from deserialize()
          return Promise.resolve(user.id)
        } else if (user._id) {
          // Handle responses from find(), insert(), update()
          return Promise.resolve(user._id)
        } else {
          return Promise.reject(new Error("Unable to serialise user"))
        }
      },

      // Deseralize turns a User ID into a normalized User object that is
      // exported to clients. It should not return private/sensitive fields,
      // only fields you want to expose via the user interface.
      deserialize: (id) => {
        console.log('next-auth.functions: deserialize');
        return new Promise((resolve, reject) => {
          usersCollection.findOne({ _id: objectId(id) }, (err, user) => {
            if (err) return reject(err)
              
            // If user not found (e.g. account deleted) return null object
            if (!user) return resolve(null)
              
            return resolve({
              id: user._id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              admin: user.admin || false
            })
          })
        })
      }
    })
  })
}
