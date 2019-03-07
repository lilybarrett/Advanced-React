import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';
import { fakeItem } from '../lib/testUtils';
// import fetch from 'fetch';

// mock the global fetch API
const dogImage = 'https://dog.com/dog.jpg';

global.fetch = jest.fn().mockResolvedValue({
    // this allows us to mock the third-party API that gets called to upload the image
    json: () => ({
        secure_url: dogImage,
        eager: [{ secure_url: dogImage }]
    })
})

// const mocks = [
//     {
//         request: {
//             query: CREATE_ITEM_MUTATION,
//             variables: { title: 'test', description: 'test', image: 'test.jpg', price: 10 },
//         },
//         result: {
//             data: {
//                 createItem: { message: 'Success', __typename: 'Message' }
//             }
//         }
//     },
// ];

describe('<CreateItem />', () => {
    it('renders and matches the snapshot', async () => {
        const wrapper = mount(
            // we don't need to pass in mocks just to test render, b/c we don't need to query data in order to render this form
            // we just need to make a mutation query in order to submit the form data
            <MockedProvider>
                <CreateItem />
            </MockedProvider>
        );
        const form = wrapper.find('form[data-test="form"]');
        expect(toJSON(form)).toMatchSnapshot();
    })

    it('uploads a file when changed', async () => {
        const wrapper = mount(
            <MockedProvider>
                <CreateItem />
            </MockedProvider>
        );
        const input = wrapper.find('input[type="file"]');
        input.simulate('change', { target: { files: ['fakedog.jpg'] }});
        // the file name here really doesn't matter, since our simulation here will trigger our global fetch, which will upload the dog.jpg image we specified there!
        await wait();
        const component = wrapper.find('CreateItem').instance();
        expect(component.state.image).toEqual(dogImage);
        expect(component.state.image).toEqual(dogImage);
        expect(global.fetch).toHaveBeenCalled();
        global.fetch.mockReset();
    })

    it('updates the rest of state when changed', async () => {
        const wrapper = mount(
            <MockedProvider>
                <CreateItem />
            </MockedProvider>
        );
        wrapper.find('#title').simulate('change', { target: { name: 'title', value: 'Test Title' }});
        wrapper.find('#price').simulate('change', { target: { name: 'price', value: '20000' }});
        wrapper.find('#description').simulate('change', { target: { name: 'description', value: 'Test Description' }});
        const component = wrapper.find('CreateItem').instance();
        expect(component.state).toMatchObject({
            title: 'Test Title',
            price: '20000',
            description: 'Test Description'
        })
    })

    it('creates an item when the form is submitted', async () => {
        const item = fakeItem();
        const mocks = [
            {
                request: {
                    query:  CREATE_ITEM_MUTATION,
                    variables: {
                        title: item.title,
                        description: item.description,
                        image: '',
                        largeImage: '',
                        price: item.price,
                    },
                },
                result: {
                    data: {
                        createItem: {
                            ...item,
                            typename: 'Item',

                        }
                    }
                }
            }
        ];
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <CreateItem />
            </MockedProvider>
        );
        // simulate someone filling out the form
        wrapper.find('#title').simulate('change', { target: { name: 'title', value: item.title }});
        wrapper.find('#price').simulate('change', { target: { name: 'price', value: item.price }});
        wrapper.find('#description').simulate('change', { target: { name: 'description', value: item.description }});
        Router.router = { push: jest.fn() };
        wrapper.find('form').simulate('submit');
        await wait(50);
        expect(Router.router.push).toHaveBeenCalled();
        expect(Router.router.push).toHaveBeenCalledWith({ "pathname": "/item", "query": {"id": "abc123"} });
    })
})