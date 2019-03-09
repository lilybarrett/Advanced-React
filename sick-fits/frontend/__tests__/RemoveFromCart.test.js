import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import { ApolloConsumer } from 'react-apollo';

// global.alert = jest.fn();
global.alert = console.log;

const mocks = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: {
            data: {
                me: {
                    ...fakeUser(),
                    cart: [fakeCartItem({ id: 'abc123' })]
                }
            }
        }
    },
    {
        request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' }},
        result: {
            data: {
                removeFromCart: {
                    __typename: 'CartItem',
                    id: 'abc123',
                }
            }
        }
    }
]

describe('<RemoveFRomCart />', () => {
    it('renders and matches the snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <RemoveFromCart id='abc123'/>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const button = wrapper.find('button');
        expect(toJSON(button)).toMatchSnapshot();
    });

    it('removes the item from the cart', async () => {
        let apolloClient;
        const wrapper = mount(
           <MockedProvider mocks={mocks}>
                <ApolloConsumer>
                    {(client) => {
                        apolloClient = client;
                        return <RemoveFromCart id='abc123' />
                    }}
                </ApolloConsumer>
           </MockedProvider>
       );
       await wait();
       wrapper.update();
       const { data: { me }} = await apolloClient.query({ query: CURRENT_USER_QUERY });
    //    console.log(me);
       expect(me.cart).toHaveLength(1);
       const button = wrapper.find('button');
       button.simulate('click');
       await wait();
       const { data: { me: me2 }} = await apolloClient.query({ query: CURRENT_USER_QUERY });
        console.log(me2);
       expect(me2.cart).toHaveLength(0);
    })
});