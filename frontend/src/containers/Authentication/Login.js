import React from 'react';
import { Spin } from 'antd/lib';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';



function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Nobo CRM
        </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
  }

  state = {
    error: false
  }

  signIn(e) {
    e.preventDefault();
    this.props.login(this.username.value, this.password.value, this.company.value)
  }



  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  render() {
    if (this.props.auth.access_token) {
      return <Redirect to="/" />;
    }
    return (
      <div >
        {
          this.props.auth.loading ?

            <Spin size="large" />

            :
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: '50vh' }}
            >
              <CssBaseline />
              <div>
                <Avatar style={{ background: "#eb2f96" }}>
                  <LockOutlinedIcon />
                </Avatar>

                <Typography component="h1" variant="h5" style={{ paddingTop: 10, paddingBottom: 10 }}>
                  Welcome To Nobo CRM
                          </Typography>
                <form noValidate onSubmit={this.signIn.bind(this)}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    inputRef={input => (this.company = input)}
                    id="company"
                    label="Company"
                    name="company"
                    autoFocus
                    error={this.props.auth.auth_status === false}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    inputRef={input => (this.username = input)}
                    id="username"
                    label="Username"
                    name="username"
                    autoFocus
                    error={this.props.auth.auth_status === false}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    inputRef={input => (this.password = input)}
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={this.props.auth.auth_status === false}
                  />
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Sign In
                            </Button>
                </form>
              </div>
              <Box mt={8}>
                <Copyright />
              </Box>
            </Grid>
        }
      </div>
    )
  }
}



const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: (user, pw, company) => dispatch({ type: 'LOGIN', username: user, password: pw, company: company })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
