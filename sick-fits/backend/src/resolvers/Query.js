const { forwardTo } = require("prisma-binding");

const Query = {
    items: forwardTo("db"),
    item: forwardTo("db"),
    itemsConnection: forwardTo("db"),
    // we can do the above because the name of our Yoga query turns out to be exactly the same as our Prisma query
    // async items(parent, args, ctx, info) {
    //     const items = await ctx.db.query.items();
    //     console.log(items);
    //     return items;
    // }
};

module.exports = Query;
