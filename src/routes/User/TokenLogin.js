import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { hex_md5 } from '../../md5';
import { ipcRenderer } from 'electron';
@connect(({ login, loading, user }) => ({
  login,
  user,
}))
export default class TokenLogin extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'login/loginToken',
      payload: {
        token: token,
        sid: 'Smartlinkey_sys',
      },
      callback: response => {
        response.data.password = hex_md5(values.password);
        let userJson = JSON.stringify(response.data);
        sessionStorage.setItem('user', userJson);
        ipcRenderer.send('login-success');
      },
    });
    this.props.dispatch({
      type: 'login/getLogin',
    });
  }
}
