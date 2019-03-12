import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Order, { SINGLE_ORDER_QUERY } from '../components/Order';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeOrder } from '../lib/testUtils';

describe('<Order />', () => {
    it('renders with proper data', async () => {
        const mocks = [
            {
                // when someone makes a request with this query and variables combo
                request: { query: SINGLE_ORDER_QUERY, variables: { id: 'ord123' }},
                // return this fake data (mocked data)
                result: {
                    data: {
                        order: fakeOrder(),
                    }
                }
            }
        ]
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <Order id="ord123" />
            </MockedProvider>
        );
        expect(wrapper.text()).toContain('Loading...');
        await wait();
        wrapper.update();
        console.log(wrapper.debug());
        const order = wrapper.find('div[data-test="order"]');
        console.log(order.debug());
        expect(toJSON(order)).toMatchSnapshot();
    });
})
