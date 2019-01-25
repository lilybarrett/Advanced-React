import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';

const BigButton = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    &:hover {
        color: ${props => props.theme.red};
    }
    cursor: pointer;
`;

const REMOVE_FROM_CART_MUTATION = gql`
    mutation removeFromCart($id: ID!) {
        removeFromCart(id: $id) {
            id 
        }
    }
`;

class RemoveFromCart extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired
    }
    // this gets called as soon as we get a response back from the server after performing the mutation
    update = (cache, payload) => {
        // cache is our Apollo cache 
        // payload is actual dump of information that's returned from the server
        // first, read the cache
        const data = cache.readQuery({
            query: CURRENT_USER_QUERY
            // this allows us to get the current user's cart
        });
        // remove the item from the cart
        const cartItemId = payload.data.removeFromCart.id;
        // for this reason, we purposefully made sure our removeFromCart mutation would return the ID for an item
        data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
        // write it back to the cache
        cache.writeQuery({ query: CURRENT_USER_QUERY, data })
    }

    render () {
        const { id } = this.props;
        return (
            <Mutation
                mutation={REMOVE_FROM_CART_MUTATION}
                variables={{ id }}
                update={this.update}
                optimisticResponse={{
                    // this allows us to immediately run the update fn rather than waiting for the response from the server
                    __typename: 'Mutation',
                    removeFromCart: {
                        __typename: 'CartItem',
                        id: this.props.id,
                    }
                }}>
                {(removeFromCart, { loading, error }) => (
                    <BigButton
                        disabled={loading}
                        onClick={() => {
                            removeFromCart().catch(err => alert(err.message))
                        }}
                        title="Delete Item">
                        &times;
                    </BigButton>
                )}
            </Mutation>
        )
    }
}

export default RemoveFromCart;

