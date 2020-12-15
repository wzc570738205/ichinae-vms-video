/*
 * @Author: wangzhichiao<https://github.com/wzc570738205>
 * @Date: 2020-07-27 09:41:20
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-07-27 10:55:35
 */
export function getToken() {
  return localStorage.getItem('vmsToken')
}

export function setToken(token) {
  localStorage.setItem('vmsToken', token)
}

export function clearToken() {
  localStorage.removeItem('vmsToken')
}

export function isLogined() {
  if (localStorage.getItem('vmsToken')) {
    return true
  }
  return false
}
