import { mount } from 'enzyme';
import wait from 'waait';
import PleaseSignIn from "../components/PleaseSignIn";
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';

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

describe('<PleaseSignIn />', () => {
    it('renders the sign in dialog to logged out users', async () => {
        const wrapper = mount(
            <MockedProvider mocks={notSignedInMocks}>
                <PleaseSignIn />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.text()).toContain('Please sign in before continuing');
        expect(wrapper.find('SignIn').exists()).toBe(true);
        // console.log(wrapper.debug());
    })

    it('renders the child component when the user is signed in', async () => {
        const Hey = () => <p>Hey!</p>
        const wrapper = mount(
            <MockedProvider mocks={signedInMocks}>
                <PleaseSignIn>
                    <Hey />
                </PleaseSignIn>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        console.log(wrapper.debug());
        expect(wrapper.contains(< Hey />)).toBe(true);
    })
})

