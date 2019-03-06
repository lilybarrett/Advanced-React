import { mount } from 'enzyme';
import wait from 'waait';
import Nav from "../components/Nav";
import toJSON from 'enzyme-to-json';
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const notSignedInMocks = [
    {
        // when someone makes a request with this query and variables combo
        request: { query: CURRENT_USER_QUERY },
        // return this fake data (mocked data)
        result: {
            data: {
                me: null,
            }
        }
    }
]

const signedInMocks = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: {
            data: {
                me: fakeUser(),
            }
        }
    }
]

const signedInMocksWithCartItems = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: {
            data: {
                me: {
                    ...fakeUser(),
                    cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
                },
            }
        }
    }
]

describe('<Nav/>', () => {
    it('renders a minimal nav when signed out', async () => {
        const wrapper = mount(
            <MockedProvider mocks={notSignedInMocks}>
                <Nav />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.text()).toContain('Sign In');
        const nav = wrapper.find('[data-test="nav"]');
        expect(toJSON(nav)).toMatchSnapshot();
        // console.log(nav.debug());
    })

    it('renders full nav when signed in', async () => {
        const wrapper = mount(
            <MockedProvider mocks={signedInMocks}>
                <Nav />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const nav = wrapper.find('[data-test="nav"]');
        // expect(toJSON(nav)).toMatchSnapshot();
    });

    it('renders the number of items in the cart', async () => {
        const wrapper = mount(
            <MockedProvider mocks={signedInMocksWithCartItems}>
                <Nav />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const nav = wrapper.find('ul[data-test="nav"]');
        expect(nav.children().length).toBe(6);
        expect(nav.text()).toContain('Sign Out');
        const count = nav.find('.count');
        console.log(count.debug());
        expect(toJSON(count)).toMatchSnapshot();
    })
})