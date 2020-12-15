const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789[]-'

export default {
  base64Encode(input, flag) {
    var output = ''
    var chr1; var chr2; var chr3 = ''
    var enc1; var enc2; var enc3; var enc4 = ''
    var i = 0
    do {
      chr1 = input.charCodeAt(i++)
      chr2 = input.charCodeAt(i++)
      chr3 = input.charCodeAt(i++)
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63

      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3)) {
        enc4 = 64
      }

      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4)
      chr1 = chr2 = chr3 = ''
      enc1 = enc2 = enc3 = enc4 = ''
    } while (i < input.length)
    return output
  },

  base64Decode(input) {
    var output = ''
    var chr1; var chr2; var chr3 = ''
    var enc1; var enc2; var enc3; var enc4 = ''
    var i = 0
    if (input.length % 4 !== 0) {
      return ''
    }
    var base64test = /[^A-Za-z0-9\[\/\]\-]/g
    if (base64test.exec(input)) {
      return ''
    }
    do {
      enc1 = keyStr.indexOf(input.charAt(i++))
      enc2 = keyStr.indexOf(input.charAt(i++))
      enc3 = keyStr.indexOf(input.charAt(i++))
      enc4 = keyStr.indexOf(input.charAt(i++))
      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4
      output = output + String.fromCharCode(chr1)
      if (enc3 !== 64) {
        output += String.fromCharCode(chr2)
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3)
      }
      chr1 = chr2 = chr3 = ''
      enc1 = enc2 = enc3 = enc4 = ''
    } while (i < input.length)
    return output
  },

  utf16to8(input) {
    var out, i, len, c
    out = ''
    len = input.length
    for (i = 0; i < len; i++) {
      c = input.charCodeAt(i)
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += input.charAt(i)
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
      } else {
        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
      }
    }
    return out
  },

  utf8to16(input) {
    var out, i, len, c
    var char2, char3
    out = ''
    len = input.length
    i = 0
    while (i < len) {
      c = input.charCodeAt(i++)
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += input.charAt(i - 1)
          break
        case 12:
        case 13:
          // 110x xxxx 10xx xxxx
          char2 = input.charCodeAt(i++)
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
          break
        case 14:
          // 1110 xxxx 10xx xxxx 10xx xxxx
          char2 = input.charCodeAt(i++)
          char3 = input.charCodeAt(i++)
          out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0))
          break
      }
    }
    return out
  },

  /**
     * 如果输入为空，则返回defaultValue，否则返回字符串解析后的值（先base64解码，再utf8to16）
     * @param input
     * @param defaultValue
     * @returns {string}
     */
  utf8to16_base64Decode(input, defaultValue = '') {
    return input ? this.utf8to16(this.base64Decode(input)) : defaultValue
  },

  base64Encode_utf16to8(input) {
    return this.base64Encode(this.utf16to8(input))
  }
}
