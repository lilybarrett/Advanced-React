import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
    mutation createOrder($token: String!) {
        createOrder(token: $token) {
            id
            charge
            total
            items {
                id
                title
            }
        }
    }
`;

function totalItems(cart) {
    if (cart.length > 0) {
        return cart.reduce((tally, item) => (tally + item.quantity), 0 );
    }
}

class TakeMyMoney extends React.Component {
    onToken = (res, createOrder) => {
        console.log("On Token called");
        console.log(res.id);
        // manually call the mutation once we have the stripe token
        createOrder({
            variables: {
                token: res.id,
            }
        }).catch((err) => {
            alert(err.messsage);
        })
    }
    render () {
        return (
            <User>
                {({ data: { me }}) => (
                    <Mutation mutation={CREATE_ORDER_MUTATION} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
                        {(createOrder) => (
                            <StripeCheckout
                                amount={calcTotalPrice(me.cart)}
                                name="Sick Fits"
                                description={`Order of ${totalItems(me.cart)}`}
                                image={me.cart[0].item && me.cart[0].item.image}
                                stripeKey="pk_test_vPcina60yhVMuvqMup2ymysz"
                                currency="USD"
                                email={me.email}
                                token={res => this.onToken(res, createOrder)}
                            >
                                {this.props.children}
                        </StripeCheckout>
                        )}
                    </Mutation>
                )}
            </User>
        )
    }
}

export default TakeMyMoney;