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
export async function getSocketList(params) {
  return request(`${configUrl.slkMessage}/message/query`, {
    method: 'POst',
    body: params,
  });
}
export async function getRead(params) {
  return request(`${configUrl.slkMessage}/message/update/read`, {
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
  return request(`${configUrl.rybjxx}/getDataInfo`, {
    method: 'Post',
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
    method: 'post',
    body: params,
  });
}
export async function getSaveXmpp(params) {
  return request(params.id ? `${configUrl.xmpp_save}${params.id}` : `${configUrl.xmpp_save}`, {
    method: 'post',
    body: params.item,
  });
}
export async function getSearch(params) {
  return request(`${configUrl.jz_search}/information/informationSearchGet`, {
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
export async function getConfigUrl() {
  return request(`configUrl.json`, {
    method: 'GET',
  });
}
export async function getOnline(params) {
  return request(`${configUrl.GMUrl}/datahandle/online`, {
    method: 'POST',
    body: params,
  });
}
export async function getClosepc(params) {
  return request(`${configUrl.GMUrl}/datahandle/closepc`, {
    method: 'POST',
    body: params,
  });
}
export async function getfkForm() {
  return request(`${configUrls.serve}/api/reply-layout`, {
    method: 'GET',
  });
}
export async function questionStatus(params) {
  return request(`${configUrl.questionStatus}/questionDbfk`, {
    method: 'POST',
    body: params,
  });
}
export async function getiNactive(params) {
  return request(`${configUrl.slkMessage}/message/update/inactive`, {
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
export async function getAgSerach() {
  return request(`${configUrl.jz_search}/information`, {
    method: 'get',
  });
}
export async function getDateLists(params) {
  return request(`${configUrl.slkMessage}/user/message/datelist`, {
    method: 'POST',
    body: params,
  });
}
