import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { hex_md5 } from '../../md5';
import { Strophe, $pres } from 'strophe.js';
import { ipcRenderer } from 'electron';
@connect(({ login, loading, user }) => ({
  login,
  user,
}))
export default class TokenLogin extends Component {
  componentDidMount() {
    ipcRenderer.on('auto-login', this.autoLogin);
  }
  autoLogin = (event, data) => {
    this.props.dispatch({
      type: 'login/getLogout',
    });
    ipcRenderer.send('logout');
    this.props.dispatch({
      type: 'login/loginToken',
      payload: {
        token: data.token,
        sid: 'Smartlinkey_sys',
      },
      callback: response => {
        let userJson = JSON.stringify(response.data);
        sessionStorage.setItem('user', userJson);
        ipcRenderer.send('login-success');
      },
    });
    this.props.dispatch({
      type: 'login/getLogin',
    });
  };
  render() {
    return <div />;
  }
}
