
import React from 'react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator } from '@aws-amplify/ui-react';

function Signing_up({ signOut, user }) {
    return (
        <div>
            <h1>Welcome, {user ? user.username : 'Stranger'}!</h1>
            <button onClick={signOut}>Sign Out</button>
        </div>
    );
}


export default withAuthenticator(Signing_up);
