import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  // return request('/api/login/account', {
  return request(`${configUrl.testUrl}/api/login`, {
    method: 'POST',
    body: params,
  });
}

export async function getUpdatePassword(params) {
  // return request(`${configUrl.testUrl}/login/updatePassword`, {
  return request(`${configUrl.testUrl}/login/updatePassword`, {
    method: 'POST',
    body: params,
  });
}

export async function getUpdateLoginSetting(params) {
  return request(`${configUrl.testUrl}/LoginSetting/updateLoginSetting`, {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function getLoginSetting(params) {
  return request(`${configUrl.testUrl}/LoginSetting/getLoginSetting`, {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
export async function getQuestionList(params) {
  return request(`${configUrl.ywzxUrl}/queryQuestionList`, {
    method: 'POST',
    body: params,
  });
}
export async function getSaveList(params) {
  return request('https://www.easy-mock.com/mock/5b2de5fd3bd2c939a1040679/Collection', {
    method: 'POST',
    body: params,
  });
}
export async function getCancelCollection(params) {
  return request('https://www.easy-mock.com/mock/5b2de5fd3bd2c939a1040679/CancelCollection', {
    method: 'POST',
    body: params,
  });
}
