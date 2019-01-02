// this is where our resolvers for our mutations and queries live
const bcrypt = require("bcryptjs");
// we will use this to hash our passwords
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../Mail.js");
const { hasPermission } = require("../utils");

const mutations = {
    async updatePermissions(parent, args, ctx, info) {
        // check if user is logged in
        if (!ctx.request.user.id) {
            throw new Error("You must be signed in!");
        }
        // query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId,
            }
        }, info)
        // check if they have permission to update permissions (ha)
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
        // update the permissions
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions,
                }
            },
            where: {
                id: args.userId,
            }
        }, info)
    },

    async createItem(parent, args, ctx, info) {
        if (!ctx.request.userId) {
            throw new Error('You must be logged in to do that!');
        }

        const item = await ctx.db.mutation.createItem(
            {
                data: {
                // This is how to create a relationship between the Item and the User
                    user: {
                        connect: {
                            id: ctx.request.userId,
                        },
                    },
                    ...args,
                    },
            },
            info
        );
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
        const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
        // check if they "own" that item and have permissions to delete it
        // we have access to the userId b/c we pass it around on every request
        // we can't use our hasPermissions utility function b/c here we're checking either/or -- the user has one or the other required permissions.
        // the hasPermissions util checks that ALL required permissions are met.
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some((p) => ['ADMIN', 'ITEMDELETE'].includes(p));
        // // delete it
        if (!ownsItem && !hasPermissions) {
            throw new Error("You don't have permission to delete this item");
        }
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
    },

    async requestReset(parent, args, ctx, info) {
       // check if this is a real user
       const user = await ctx.db.query.user({ where: { email: args.email }});
       if (!user) {
           throw new Error(`No such user found for email ${email}`);
       }
       // set a reset token and expiry on that user
       const randomBytesPromisified = promisify(randomBytes);
       const resetToken = (await randomBytesPromisified(20)).toString("hex");
       const resetTokenExpiry = Date.now() + 3600000; // an hour from now
       const res = await ctx.db.mutation.updateUser({
           where: { email: args.email },
           data: { resetToken, resetTokenExpiry }
       })
       // email them the reset token
       const mailRes = await transport.sendMail({
           from: "lilydbarrett@gmail.com",
           to: user.email,
           subject: "Your password reset token",
           html: makeANiceEmail(`Your password reset token is here!\n\n<a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Check here to reset.</>`)
       })

       return { message: "Thanks!" };
    },

    async resetPassword(parent, args, ctx, info) {
        // check if the passwords match
        if (args.password !== args.confirmPassword) {
            throw new Error("Yo passwords don't match");
        }
        // check if it's a legit resetToken
        // check if it's expired
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        })
        if (!user) {
            throw new Error("This token is either invalid or expired");
        }
        // hash their new password
        const password = await bcrypt.hash(args.password, 10);
        // save the new password to the user and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        // generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        // set the JWT cookie
        ctx.response.cookie("token", token, {
            httpOnly: true,
            // this makes sure we cannot access the token via JavaScript
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
        });
        // return the new user
        return updatedUser;
    },

    async addToCart(parent, args, ctx, info) {
        // 1. Make sure they are signed in
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error("You must be signed in to add items to your cart");
        }
        // 2. Query the user's current cart 
        const [existingCartItem] = await ctx.db.query.cartItems({
            where: {
                user: { id: userId },
                item: { id: args.id },
            }
        })
        // 3. Check if that item is already in their cart and increment by 1 if it is
        if (existingCartItem) {
            return ctx.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 },
            }, info)
        }
        // 4. If it's not, create a fresh CartItem for that user!
        return ctx.db.mutation.createCartItem({
            data: {
                // we need to use "connect" to create the necessary relationship in prisma
                user: { connect: { id: userId } },
                item: { connect: { id: args.id } },
            }
        }, info)
    },

   async removeFromCart(parent, args, ctx, info) {
        const { userId } = ctx.request;
        if (!userId) {
            throw new Error("You must be signed in to remove items from your cart");
        }
        console.log(args);
        // find the cart item
        const existingCartItem = await ctx.db.query.cartItem({
            where: {
                id: args.id,
            }
        }, `{ id, user { id }}`)
        // console.log(existingCartItem);
        // make sure they own the cart item
        if (!existingCartItem) throw new Error('No cart item found!');
        if (existingCartItem.user.id !== userId) throw new Error('You do not have permission to remove this item from the cart.');
        // remove the cart item
        return ctx.db.mutation.deleteCartItem({
            where: { id: args.id }
        }, info)
    }
};

module.exports = mutations;
