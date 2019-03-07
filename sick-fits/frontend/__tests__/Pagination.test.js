import { mount } from 'enzyme';
import wait from 'waait';
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
import toJSON from 'enzyme-to-json';
import { CURRENT_USER_QUERY } from '../components/User';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

// Mock the router
Router.router = {
    push() {},
    prefetch() {}
}

function makeMocksFor(length) {
    return [
        {
            request: { query: PAGINATION_QUERY },
            result: {
                data: {
                    itemsConnection: {
                        __typename: 'aggregate',
                        aggregate: {
                            __typename: 'count',
                            count: length,
                        }
                    }
                }
            }
        }
    ]
}

describe('<Pagination />', () => {
    it('displays a loading message', () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(1)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        expect(wrapper.text()).toContain('Loading...');
        const pagination = wrapper.find('[data-test="pagination"]');
        expect(toJSON(pagination)).toMatchSnapshot();
        // console.log(wrapper.debug());
    });

    it('renders pagination for 18 items', async () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('.totalPages').text()).toEqual('5');
        const nav = wrapper.find('div[data-test="pagination"]');
        expect(toJSON(nav)).toMatchSnapshot();
        // console.log(nav.debug());
    })

    it('disables the Prev button on the first page', async () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(true);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
    });

    it('disables the Next button on the last page', async () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={18} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(true);
    })

    it('enables all the buttons on pages that are neither first nor last', async () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(18)}>
                <Pagination page={3} />
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
        expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
    })
})