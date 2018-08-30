import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  // return request('/api/currentUser');
}

export async function getQuery(params) {
  return request(`${configUrl.GMUrl}/datahandle/query `, {
    method: 'POST',
    body: params,
  });
}
export async function getDataSave(params) {
  return request(`${configUrl.GMUrl}/datahandle/save `, {
    method: 'POST',
    body: params,
  });
}
export async function getFind(params) {
  return request(`${configUrl.GMUrl}/datahandle/find `, {
    method: 'POST',
    body: params,
  });
}
export async function getWord01(params) {
  // return request('https://www.easy-mock.com/mock/5b2de5fd3bd2c939a1040679/getWord01', {
  return request(`${configUrl.rybjxx}/getDataInfo`, {
    method: 'POST',
    body: params,
  });
}
export async function getLoginIp(params) {
  return request(`${configUrl.testUrl}/lowcase/lastLoginLog`, {
    method: 'POST',
    body: params,
  });
}
