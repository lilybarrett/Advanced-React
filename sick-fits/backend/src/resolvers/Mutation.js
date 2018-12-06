// this is where our resolvers for our mutations and queries live
const bcrypt = require("bcryptjs");
// we will use this to hash our passwords
const jwt = require("jsonwebtoken");

const mutations = {
    async createItem(parent, args, ctx, info) {
        // TODO: Check if they are logged in
        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            }
        }, info);
        // info contains the query, making sure the item is actually returned to us as requested ind the response here

        return item;
    },

    updateItem(parent, args, ctx, info) {
        // first take a copy of the updates
        const updates = { ...args };
        // remove the ID from the update args since the ID is not something you can update
        delete updates.id;
        // run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            }
        }, info);
    },

    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        // find the item
        const item = await ctx.db.query.item({ where }, `{ id title }`);
        // check if they "own" that item and have permissions to delete it
        // delete it
        return ctx.db.mutation.deleteItem({ where }, info);
    },

    async signup(parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        const password = await bcrypt.hash(args.password, 10);
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password,
                // this overwrites the args.password into the bcrypted version
                permissions: { set: ["USER"]}
                // we do it the above way because we're using an enum and tis is how you set an enum value
            }
        }, info);

        // create the JWT token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // we set the jwt as a cookie on the response
        ctx.response.cookie("token", token, {
            httpOnly: true,
            // this makes sure we cannot access the token via JavaScript 
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
        });
        // Finally we return the user to the browser
        return user;
    },

    async signin(parent, { email, password }, ctx, info) {
        // check if user with that email exists
        const user = await ctx.db.query.user({ where: { email: email }});
        if (!user) {
            throw new Error(`No such user found for email ${email}`);
        }
        // check if their password is valid/correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error("Invalid Password!");
        }
        // generate the JWT token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // set the cookie with the token so we can pass info about the user around on every request
        ctx.response.cookie("token", token, {
            httpOnly: true,
            // this makes sure we cannot access the token via JavaScript 
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
        });
        // Finally we return the user to the browser
        return user;
    },

    signout(parent, args, ctx, info) {
        ctx.response.clearCookie("token");
        // we can use the clearCookie method because we used cookieParser in our index.js, which gives us access to all these handy little helper methods
        return { message: "Goodybye!" };
    }
};

module.exports = mutations;
