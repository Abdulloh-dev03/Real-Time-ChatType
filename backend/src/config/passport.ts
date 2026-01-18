import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "#models/user.model.js";
import { generateUniqueUsername } from "#utils/usernameGenerator.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_HOST_KEY!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        // Google returns email_verified as a boolean in _json
        const emailVerified = profile._json?.email_verified === true;

        if (!email || !emailVerified) {
          return done(
            new Error("Google account email is not verified"),
            undefined
          );
        }

        let user = await User.findOne({ email });

        if (user) {
          // 🔁 Link existing account if not already linked
          let modified = false;

          if (!user.isVerified) {
            user.isVerified = true;
            modified = true;
          }

          if (!user.googleId) {
            user.googleId = profile.id;
            modified = true;
          }

          if (!user.profilePic && profile.photos?.[0]?.value) {
            user.profilePic = profile.photos[0].value;
            modified = true;
          }

          if (modified) await user.save();
          return done(null, user);
        }

        // 🆕 New user
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const username = await generateUniqueUsername(
          `${firstName}${lastName}`
        );

        user = await User.create({
          email,
          isVerified: true,
          firstName,
          lastName,
          username,
          profilePic: profile.photos?.[0]?.value || "",
          authProvider: "google",
          googleId: profile.id,
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);
