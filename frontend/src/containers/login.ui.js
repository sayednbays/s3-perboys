import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Typography, Button, Card,
  CardContent, Grid, InputAdornment,
  FormControl, InputLabel, Input, IconButton, LinearProgress, FormHelperText
} from 'material-ui';
import { AccountCircle, Lock } from 'material-ui-icons';
import { authActions } from '../actions';
import './login.ui.css';
import logo from '../assets/logo.svg'
class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { userName: '', password: '', errors: null, onlogining: false };
  }
  async login() {
    const { history, dispatch } = this.props;
    let valid = this.validInput();
    if (!valid)
      return;
    this.setState({ onlogining: true });
    let result = await dispatch(authActions.login(this.state.userName, this.state.password));
    if (result.success) {
      return;
    }
    else {
      this.setState({ errors: { ...this.state.errors, loginFailure: JSON.stringify(result.reason) } });
    }

    this.setState({ onlogining: false });

  }
  validInput() {
    let errors = null;
    if (!this.state.userName)
      errors = { ...errors, userName: 'User Name is required' };
    if (!this.state.password)
      errors = { ...errors, password: 'Password is required' };

    this.setState({ errors: errors });

    return !errors;
  }
  render() {
    return (
      <div className='login-container'>
        {this.state.onlogining && <div className='loading-container'>
          <LinearProgress />
        </div>}
        <Grid justify='center' spacing={0} container alignContent='center'>
          <Grid item sm={4} xs={6}>
            <Card>
              <CardContent>
                <Grid container spacing={24} direction='column' justify='flex-start' alignItems='stretch'>
                  <Grid item style={{ alignSelf: 'center' }}>
                    <div className='logo'>
                      <img src={logo} className='login-logo' alt='logo' />
                    </div>
                  </Grid>
                  <Grid item style={{ alignSelf: 'center' }}>
                    <Typography component='h1' type='headline'>Pep Boys</Typography>
                  </Grid>
                  <Grid item>
                    <FormControl fullWidth className='login-form-control' error={this.state.errors && this.state.errors['userName'] != null}>
                      <InputLabel htmlFor="userName">User Name</InputLabel>
                      <Input
                        id="userName"
                        value={this.state.userName}
                        onChange={(e) => { this.setState({ userName: e.target.value }); }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton><AccountCircle /></IconButton>
                          </InputAdornment>}
                      />
                      {this.state.errors && this.state.errors['userName'] && <FormHelperText>{this.state.errors['userName']}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl fullWidth className='login-form-control' error={this.state.errors && this.state.errors['password'] != null}>
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <Input
                        type='password'
                        id="password"
                        value={this.state.password}
                        onChange={(e) => { this.setState({ password: e.target.value }); }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton><Lock /></IconButton>
                          </InputAdornment>
                        }
                      />
                      {this.state.errors && this.state.errors['password'] && <FormHelperText>{this.state.errors['password'] != null}</FormHelperText>}

                    </FormControl>
                  </Grid>

                  <Grid item style={{ alignSelf: 'center' }}>
                    <Button raised color="primary" onClick={this.login.bind(this)}>Login</Button>
                  </Grid>
                  {this.state.errors && this.state.errors['loginFailure'] &&
                    < Grid item style={{ alignSelf: 'center' }}>
                      <Typography component='h1' type='body2' color="error">{this.state.errors['loginFailure']}</Typography>
                    </Grid>
                  }
                </Grid>

              </CardContent>
            </Card>
          </Grid>
        </Grid >
      </div >
    )
  }
}
export default connect(
  (state) => ({})
)(LoginContainer)
