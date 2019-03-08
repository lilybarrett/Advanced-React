import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import { ApolloConsumer } from 'react-apollo';

const mocks = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: { data: {
            me: {
                ...fakeUser(),
                cart: [],
            }
        }}
    },
    {
        request: { query: CURRENT_USER_QUERY },
        result: { data: {
            me: {
                ...fakeUser(),
                cart: [fakeCartItem()],
            }
        }}
    },
    {
        request: { query: ADD_TO_CART_MUTATION, variables: { id: 'abc123' }},
        result: {
            data: {
                addToCart: {
                    ...fakeCartItem(),
                    quantity: 1,
                }
            }
        }
    }
]

describe('<AddToCart />', () => {
    it('renders and matches the snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <AddToCart id='abc123'/>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const button = wrapper.find('button');
        expect(toJSON(button)).toMatchSnapshot();
    });

    it('adds an item to cart when clicked', async () => {
        let apolloClient;
        const wrapper = mount(
           <MockedProvider mocks={mocks}>
                <ApolloConsumer>
                    {(client) => {
                        apolloClient = client;
                        return <AddToCart id='abc123' />
                    }}
                </ApolloConsumer>
           </MockedProvider>
       );
       await wait();
       wrapper.update();
       const { data: { me }} = await apolloClient.query({ query: CURRENT_USER_QUERY });
    //    console.log(me);
       expect(me.cart).toHaveLength(0);
       // add an item to the cart
       const button = wrapper.find('button[data-test="add-button"]');
       button.simulate('click');
       await wait();
       // check that item is in cart
       const { data: { me: me2 }} = await apolloClient.query({ query: CURRENT_USER_QUERY });
       console.log(me2);
    //    expect(me2.cart).toHaveLength(1);
    });
});