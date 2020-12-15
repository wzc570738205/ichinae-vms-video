
<!--
 * @Author: wangzhichiao<https://github.com/wzc570738205>
 * @Date: 2020-08-13 13:10:16
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-12-15 18:37:08
-->
<script>
import IchinaeVmsVideo from '@/ichinae-vms-video'
import Vue from 'vue'
export default Vue.extend({
  name: 'ServeDev',
  components: {
    IchinaeVmsVideo
  },
  data() {
    return {
      videoOption: {
        size: 4, // 分频数  1 4
        fontSize: 100,
        text: 'admin' // 水印名字
      },
      vmsOption: {
        ipcLinkInfo: {
          serverIP: 'http://10.0.20.126',
          serverPort: '8000'
        },
        vmslogin: {
          username: 'admin',
          password: '123456'
        }
      }
    }
  },
  methods: {
    play() {
      this.$refs.video.pushvideo('data[this.defaultProps.label]', '100252')
    }
  }
})
</script>

<template>
  <div id="app">
    <el-button type="primary" @click="play">西安</el-button>
    <div class="videoWrap">
      <IchinaeVmsVideo ref="video" :video-option="videoOption" :vms-option="vmsOption" />

    </div>
  </div>
</template>
<style scoped>

.videoWrap{
  width: 100%;
  height: 90vh;
}
</style>
