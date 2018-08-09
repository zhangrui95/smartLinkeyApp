import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function getQuery(params) {
  return request(`${configUrl.gmUrl}/datahandle/query `, {
    method: 'POST',
    body: params,
  });
}
export async function getDataSave(params) {
  return request(`${configUrl.gmUrl}/datahandle/save `, {
    method: 'POST',
    body: params,
  });
}
export async function getFind(params) {
  return request(`${configUrl.gmUrl}/datahandle/find `, {
    method: 'POST',
    body: params,
  });
}
