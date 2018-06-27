import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
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
