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
        // The onToken() function “behind the scenes”
        // sends the card info to Stripe and returns
        // a token object. This object contains limited
        // details about the transaction(card type, last 4 digits, email, etc.)
        // Our function sends this token and the amount to our backend
        // in the body with an axios request to finish the transaction.
        // https://hackernoon.com/stripe-api-reactjs-and-express-bc446bf08301
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
    });
    it('turns the progress bar on', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <TakeMyMoney />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        NProgress.start = jest.fn();
        const createOrderMock = jest.fn().mockResolvedValue({
            data: {
                createOrder: {
                    id: 'xyz789'
                }
            }
        });
        const component = wrapper.find('TakeMyMoney').instance();
        component.onToken({ id: 'abc123' }, createOrderMock);
        expect(NProgress.start).toHaveBeenCalled();
    });
    it('routes to the order page when completed', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <TakeMyMoney />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const createOrderMock = jest.fn().mockResolvedValue({
            data: {
                createOrder: {
                    id: 'xyz789'
                }
            }
        });
        const component = wrapper.find('TakeMyMoney').instance();
        Router.router.push = jest.fn();
        component.onToken({ id: 'abc123' }, createOrderMock);
        await wait();
        expect(Router.router.push).toHaveBeenCalledWith({"pathname": "/order", "query": { "id": "xyz789" }})});
})
