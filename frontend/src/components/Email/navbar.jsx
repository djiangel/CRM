import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';


class Navibar extends React.Component {

  render() {

    let status = this.props.appIsOnline
    let logged = this.props.userIsLoggedIn

    //
    // Show the "app is offline" message in the upper right of the app or not?
    //

    //
    // Only if the user is logged in do we show the "Compose Email" link in the top nav.
    //

    return (

      <Navbar expand="lg" variant="dark" bg="dark">
        <Button variant="dark" onClick={this.props.onGoHome}>Gmail</Button>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {logged
              ? <div><Button variant="dark" onClick={this.props.onGoHome}>Home</Button>
                <Button variant="dark" onClick={this.props.onConversationsClicked}>Conversations</Button>
                <Button variant="dark" onClick={this.props.onSentClicked}>Sent Mails</Button>
                <Button variant="dark" onClick={this.props.onComposeEmail}>Compose Email</Button>
              </div>
              : null
            }
          </Nav>
          {status
            ? null
            : <h1>App is Offline!</h1>
          }
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export { Navibar }