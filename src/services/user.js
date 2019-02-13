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
export async function getSubQuery(params) {
  return request(`${configUrl.GMUrl}/datahandle/sublogquery `, {
    method: 'POST',
    body: params,
  });
}
export async function getOnline(params) {
  return request(`${configUrl.GMUrl}/datahandle/online`, {
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
export async function getXmppList(params) {
  return request(`${configUrl.xmpp_query}`, {
    method: 'POST',
    body: params,
  });
}
export async function getSocketList(params) {
  return request(`${configUrls.SocketListServe}/message/query`, {
    method: 'POST',
    body: params,
  });
}
export async function getSaveXmpp(params) {
  return request(`${configUrl.xmpp_save}`, {
    method: 'POST',
    body: params,
  });
}
export async function getSearch(params) {
  return request(`${configUrl.jz_search}/information/informationSearchGet`, {
    method: 'POST',
    body: params,
  });
}
export async function getSacwSearch(params) {
  return request(`${configUrl.jz_search}/information/informationSearchGet.do`, {
    method: 'POST',
    body: params,
  });
}
export async function getConfig() {
  return request(`${configUrls.serve}/api/config`, {
    method: 'GET',
  });
}
export async function getIcons() {
  return request(`${configUrls.serve}/api/icon`, {
    method: 'GET',
  });
}
export async function getfkForm() {
  return request(`${configUrls.mouldServe}/api/reply-layout`, {
    method: 'GET',
  });
}
export async function questionStatus(params) {
  return request(`${configUrl.questionStatus}/questionDbfk`, {
    method: 'POST',
    body: params,
  });
}
