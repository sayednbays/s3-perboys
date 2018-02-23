import React, { Component } from 'react';
import Routes from './routes';
import { Provider } from 'react-redux';
import store from './store'
import './App.css';
import { authActions } from './actions/index';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isAuthenticated: false, finishedInit: false };
    this.unsubscribe = null;
  }

  async componentWillMount() {

   let isLogged= await store.dispatch(authActions.checkIfLogged());
   this.setState({isAuthenticated:isLogged,finishedInit:true});


   this.unsubscribe = store.subscribe(() => {
    const { auth } = store.getState();
    this.setState({ isAuthenticated: auth.logged });
  });


  }
  componentWillUnmount() {
    console.log('unmount');
    this.unsubscribe && this.unsubscribe();
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
    };
    return (
      <Provider store={store}>
        <div >
          {this.state.finishedInit ? <Routes childProps={childProps} /> : null}
        </div>
      </Provider>
    );
  }
}

export default App;
