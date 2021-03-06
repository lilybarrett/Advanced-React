import React, { Component } from 'react'
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

export const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION($email: String!) {
        requestReset(email: $email) {
            message
        }
    }
`;

class RequestReset extends Component {
    state = {
        email: ""
    }
    saveToState = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }
    render() {
        return (
            <Mutation
                mutation={REQUEST_RESET_MUTATION}
                variables={this.state}>
                {( requestReset, { loading, error, called } ) => {
                    return (
                        <Form method="post" data-test="form" onSubmit={async (e) => {
                            e.preventDefault();
                            await requestReset();
                            this.setState({ email: ""});
                        }}>
                            <fieldset disabled={loading} aria-busy={loading}>
                                <h2>Reset your password</h2>
                                <Error error={error} />
                                {!error && !loading && called && <p>Success! Check your email for a reset link.</p>}
                                <label htmlFor="email">
                                    Email
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        value={this.state.email}
                                        onChange={this.saveToState}/>
                                </label>
                                <button type="submit">Get a reset email!</button>
                            </fieldset>
                        </Form>
                    )
                }}
            </Mutation>
        )
    }
}

export default RequestReset;

