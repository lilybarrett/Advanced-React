import React, { Component } from 'react'
import { Mutation } from "react-apollo";
import { ALL_ITEMS_QUERY } from "./Items";
import gql from "graphql-tag";

const DELETE_ITEM_MUTATION = gql`
    mutation DELETE_ITEM_MUTATION($id: ID!) {
        deleteItem(id: $id) {
            id 
        }
    }
`;

class DeleteItem extends Component {
    update = (cache, payload) => {
        // steps to manually update the client cache so it matches the data that's actually on the server
        // read the cache for the items we want -- in this case, we want to make a query for "all the items" from the cache
        const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
        console.log(data);
        // filter the deleted item out of the page
        data.items = data.items.filter((item) => item.id !== payload.data.deleteItem.id);
        // put the items back!
        cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    }
    render() {
        return (
            <Mutation
                mutation={DELETE_ITEM_MUTATION}
                variables={{ id: this.props.id }}
                update={this.update}>
                {( deleteItem, { error } ) => (
                    <button onClick={() => {
                        if (confirm("Are you sure you want to delete this item?")) {
                            deleteItem();
                        }
                    }}>
                        {this.props.children}
                    </button>
                )}
            </Mutation>
        )
    }
}

export default DeleteItem;

