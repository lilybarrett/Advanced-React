import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag'; 
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import User from './User';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

export const LOCAL_STATE_QUERY = gql`
    query {
        cartOpen @client 
        # the @client directive tells Apollo not to grab this from the API, but from our local data store in Apollo Client

    }
`;

export const TOGGLE_CART_MUTATION = gql`
    mutation {
        toggleCart @client
    }
`;

const Cart = () => {
    return (
        <User>
            {({ data: { me }}) => {
                console.log(me);
                if (!me) return null;
                return (
                    <Mutation mutation={TOGGLE_CART_MUTATION}>
                        {( toggleCart ) => (
                            <Query query={LOCAL_STATE_QUERY}>
                                {({ data }) => (
                                    <CartStyles open={data.cartOpen}>
                                        <header>
                                            <CloseButton onClick={toggleCart} title="close">
                                                &times;
                                            </CloseButton>
                                            <Supreme>
                                                {me.name}'s Cart
                                            </Supreme>
                                            <p>
                                                You have {me.cart.length} item{me.cart.length > 1 && `s`} in your cart
                                            </p>
                                        </header>
                                        <ul>
                                           {me.cart.map((cartItem) => <CartItem key={cartItem.id} cartItem={cartItem} />)} 
                                        </ul>
                                        <footer>
                                            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                                            <SickButton>Checkout</SickButton>
                                        </footer>
                                    </CartStyles>
                                )}
                            </Query>
                        )}
                    </Mutation>
                )
            }}
        </User>
    )
}

export default Cart;

