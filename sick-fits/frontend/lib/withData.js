import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';
import { LOCAL_STATE_QUERY } from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // local data store that we're passing around using Apollo -- as opposed to Redux or Context
    clientState: {
      resolvers: {
        Mutation: {
          // underscore -- Wes isn't sure what this represents
          // variables (we don't actually have any in this case)
          // cache -- destructured out of Apollo Client -- where we will store cartOpen value
          toggleCart(_, variables, { cache }) {
            // read the cartOpen value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            })
            // write the cart state to the opposite toggle state
            const data = {
              data: { cartOpen: !cartOpen }
            }
            cache.writeData(data);
            console.log(cartOpen);
            return data;
          }
        }
      },
      defaults: {
        cartOpen: false,
      },
    }
  });
}

export default withApollo(createClient);
