/*
 * @Author: wangzhichiao<https://github.com/wzc570738205>
 * @Date: 2020-09-18 17:21:58
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-09-18 17:24:29
 */
/*
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class RangeSeekHandler {
  constructor(zeroStart) {
    this._zeroStart = zeroStart || false
  }

  getConfig(url, range) {
    const headers = {}

    if (range.from !== 0 || range.to !== -1) {
      let param
      if (range.to !== -1) {
        param = `bytes=${range.from.toString()}-${range.to.toString()}`
      } else {
        param = `bytes=${range.from.toString()}-`
      }
      headers['Range'] = param
    } else if (this._zeroStart) {
      headers['Range'] = 'bytes=0-'
    }

    return {
      url: url,
      headers: headers
    }
  }

  removeURLParameters(seekedURL) {
    return seekedURL
  }
}

export default RangeSeekHandler
