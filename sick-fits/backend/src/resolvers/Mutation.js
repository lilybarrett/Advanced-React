// this is where our resolvers for our mutations and queries live
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
    }
};

module.exports = mutations;
