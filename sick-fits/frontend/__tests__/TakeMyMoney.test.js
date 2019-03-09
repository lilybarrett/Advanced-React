import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import TakeMyMoney, { CREATE_ORDER_MUTATION } from '../components/TakeMyMoney';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';
import { ApolloConsumer } from 'react-apollo';
import NProgress from 'nprogress';
import Router from 'next/router';

Router.router = { push() {} };

const mocks = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: {
            data: {
                me: {
                    ...fakeUser(),
                    cart: [fakeCartItem()],
                },
            },
        },
    }
]

describe('<TakeMyMoney />', () => {
    it('renders and matches snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <TakeMyMoney />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const checkoutButton = wrapper.find('StripeCheckout');
        expect(toJSON(checkoutButton)).toMatchSnapshot();
    });
    it('creates an order on token', async () => {
        const createOrderMock = jest.fn().mockResolvedValue({
            data: {
                createOrder: {
                    id: 'xyz789'
                }
            }
        });
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <TakeMyMoney />
            </MockedProvider>
        );
        const component = wrapper.find('TakeMyMoney').instance();
        // manually call the onToken method from the component
        component.onToken({ id: 'abc123' }, createOrderMock);
        expect(createOrderMock).toHaveBeenCalled();
        expect(createOrderMock).toHaveBeenCalledWith({ variables: { "token": "abc123" }} );
    })

})
