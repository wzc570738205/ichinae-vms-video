/*
 * @Date: 2020-07-02 15:03:04
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-12-15 14:55:14
 */
import base64 from '../utils/base64'
import { getToken } from '../utils/vmsToken'
import axios from 'axios'

var vmsService = {
  login(ipcLinkInfo, data) {
    return axios({
      url: `${ipcLinkInfo.serverIP}/VMS2Service.cgi?Cmd=UserLogin`,
      method: 'get',
      params: {},
      headers: {
        Authorization:
          'Basic ' + base64.base64Encode(data.username + ':' + data.password)
      }
    })
  },
  getIpInfo(ipcLinkInfo, data) {
    return axios({
      url: `${ipcLinkInfo.serverIP}/VMS2Service.cgi?Cmd=DeviceGetIPCLinkInfo`,
      method: 'post',
      data: JSON.stringify(data),
      headers: {
        'auth-token': getToken()
      }
    })
  },
  getRecordList(ip, ipcLinkInfo, data) {
    return axios({
      url: `http://${ip}:${ipcLinkInfo.serverPort}/command?cmd=getrecordlist`,
      method: 'get',
      params: data
    })
  },
  setvideorate(ip, ipcLinkInfo, data) {
    return axios({
      url: `http://${ip}:${ipcLinkInfo.serverPort}/command?cmd=setvideorate`,
      method: 'get',
      params: data
    })
  }
}

export { vmsService }
