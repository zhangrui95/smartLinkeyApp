import fetch from 'dva/fetch';
import { notification } from 'antd';

function checkStatus(response) {
  let checkResponse = response.clone();
  const res = checkResponse.json();
  const check = res.then(value => {
    if (value.reason) {
      notification.error({
        message: value.reason.text,
      });
      return false;
    }
  });

  if ((response.status >= 200 && response.status < 300) || response.status == 401) {
    return response;
  }

  /*   notification.error({
      message: `请求错误 ${response.status}: ${response.url}`,
      description: response.statusText,
    }); */
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    // credentials: 'include',
  };

  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'GET') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Authorization:
        sessionStorage.getItem('user') === undefined || sessionStorage.getItem('user') === null
          ? ''
          : JSON.parse(sessionStorage.getItem('user')).token,
      token:
        sessionStorage.getItem('user') === undefined || sessionStorage.getItem('user') === null
          ? ''
          : JSON.parse(sessionStorage.getItem('user')).token,
      ...newOptions.headers,
    };
    newOptions.body = JSON.stringify(newOptions.body);
  }

  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => response.json())
    .catch(error => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        /*         notification.error({
                  message: `请求错误: ${url}`,
                  description: error.message,
                }); */
      }
      return error;
    });
}
