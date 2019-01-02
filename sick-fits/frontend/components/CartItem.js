import React from 'react';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyles = styled.li`
    padding: 1rem 0;
    border-bottom: 1px solid ${props => props.theme.lightgrey};
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr auto;
    img {
        margin-right: 10px;
    }
    h3, p {
        margin: 0;
    }
`;

const CartItem = ({ cartItem }) => {
    if (!cartItem.item) return (
        <CartItemStyles>
            This item has been removed from the shop<RemoveFromCart id={cartItem.id}/>
        </CartItemStyles>
    )
    return (
        <CartItemStyles>
            <img width='100' src={cartItem.item.image} alt={cartItem.item.title} />
            <div className='cart-item-details'>
                <h3>{cartItem.item.title}</h3>
            </div>
            <p>
                {formatMoney(cartItem.item.price * cartItem.quantity)}
                {' - '}
                <em>
                    {cartItem.quantity} &times; {formatMoney(cartItem.item.price)}
                </em>
            </p>
            <RemoveFromCart id={cartItem.id} />
        </CartItemStyles>
    )
}

CartItem.propTypes = {
    cartItem: PropTypes.shape({
        id: PropTypes.string,
        quantity: PropTypes.number,
        item: PropTypes.shape({
            title: PropTypes.string,
            price: PropTypes.number,
            image: PropTypes.string
        })
    })
}

export default CartItem;