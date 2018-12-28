import { Query, Mutation } from "react-apollo";
import Error from "./ErrorMessage";
import gql from "graphql-tag";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from 'prop-types';

const possiblePermissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE'
]

const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation UPDATE_PERMISSIONS($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            permissions
            name
            email
        }
    }
`;

const ALL_USERS_QUERY = gql`
    query {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const Permissions = (props) => (
    <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => (
            <div>
                <Error error={error} />
                <h2>Manage permissions</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>
                                Name
                            </th>
                            <th>
                                Email
                            </th>
                            {possiblePermissions.map((permission) => (
                                <th key={permission}>{permission}</th>
                            ))}
                            <th>V</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map((user) => <UserPermissions key={user.id} user={user} />)}
                    </tbody>
                </Table>
            </div>
        )}
    </Query>
)

class UserPermissions extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            id: PropTypes.string,
            permissions: PropTypes.array,
        }).isRequired,
    };

    state = {
        permissions: this.props.user.permissions,
    }

    handlePermissionChange = (e) => {
        const checkbox = e.target;
        // take a copy of the current permissions
        let updatedPermissions = [ ...this.state.permissions ];
        if (checkbox.checked) {
            updatedPermissions.push(checkbox.value);
        } else {
            updatedPermissions = updatedPermissions.filter((p) => p !== checkbox.value);
        }
        this.setState({ permissions: updatedPermissions });
    }

    render () {
        const { user } = this.props;
        return (
            <Mutation
                mutation={UPDATE_PERMISSIONS_MUTATION}
                variables={{
                    permissions: this.state.permissions,
                    userId: user.id,
                }}>
                {(updatePermissions, { loading, error }) => (
                    <>
                        { error && <Error error={error} /> }
                        <tr>
                            <td>
                                {user.name}
                            </td>
                            <td>
                                {user.email}
                            </td>
                            {possiblePermissions.map((permission) => (
                                <td key={permission}>
                                    <label htmlFor={`${user.id}-permission=${permission}`}>
                                        <input
                                            type="checkbox"
                                            id={`${user.id}-permission=${permission}`}
                                            checked={this.state.permissions.includes(permission)}
                                            value={permission}
                                            onChange={this.handlePermissionChange}
                                        />
                                    </label>
                                </td>
                            ))}
                            <td>
                                <SickButton
                                    type="button"
                                    disabled={loading}
                                    onClick={updatePermissions}>
                                    Updat{loading ? 'ing' : 'e'}
                                </SickButton>
                            </td>
                        </tr>
                    </>
                )}
            </Mutation>
        )
    }
}

export default Permissions;
