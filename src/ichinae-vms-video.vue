<!--
 * @Author: wangzhichiao<https://github.com/wzc570738205>
 * @Date: 2020-07-08 09:48:06
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-12-15 17:54:38
-->
<template>
  <div class="videotemplate">
    <el-row :gutter="10">
      <el-col
        v-for="(item, index) in videoList"
        :key="index"
        :span="item.span"
        class="animate__animated"
        style="overflow: hidden"
        :class="[{show:item.show},{hide:!item.show},{ 'animate__shakeX' : item.isChecked}]"
      >
        <div
          v-loading="item.loading"
          :class="item.fullScreen ? 'fullScreen' : 'videowrap'"
          element-loading-text="加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          @dblclick="dbclick(index)"
        >
          <div class="videoTitle">{{ item.name }}</div>
          <video
            :id="item.id"
            width="100%"
            :style="item.live ? 'height: calc(100% - 100px);' : 'height: 100%;'"
            :autoplay="item.autoplay"
          />
          <!-- 水印 start -->
          <span class="water">{{ videoOption.text }}</span>
          <span class="water water2">{{ videoOption.text }}</span>
          <span class="water water3">{{ videoOption.text }}</span>
          <!-- 水印 end -->

          <!-- 视频加载失败 loading start -->
          <div v-show="item.error" class="error">
            <span>视频加载失败</span>
            <el-button type="info" round @click="loadvideo(index, item)">重新加载</el-button>
            <!--             <span>{{ item.live?'录像加载失败':'视频加载失败' }}</span>
            <el-button type="info" round @click="loadvideo(index, item)">{{ item.live?'返回实时视频':'重新加载' }}</el-button> -->
          </div>
          <!-- 视频加载失败 loading end -->

          <!-- 视频关闭按钮 s -->
          <div v-if="item.flvPlayer&&!item.fullScreen" class="closrControl">
            <el-button @click="destroy(index)">
              <el-tooltip class="item" effect="dark" content="关闭视频" placement="left">
                <img src="./assets/video/close.png" alt>
              </el-tooltip>
            </el-button>
          </div>
          <!-- 视频关闭按钮 e -->

          <div v-if="item.mediaRecord" class="tcl">TCL</div>
          <div v-if="item.flvPlayer && !item.error" class="control">
            <!-- 视频截图 -->
            <el-button @click.stop="capture(index, item)">
              <el-tooltip class="item" effect="dark" content="截图" placement="top">
                <img src="./assets/video/capture.png" alt>
              </el-tooltip>
            </el-button>

            <!-- 视频录制  -->
            <!--    <el-button v-if="!item.mediaRecord" round @click="mediaRecording(index, item)">录屏</el-button>
            <el-button v-if="item.mediaRecord" round @click="stopAndblobDownload(index, item)">结束录屏</el-button>-->

            <!-- 视频播放/暂停  -->
            <el-button @click="toggle(index)">
              <!--    <i :class="item.playState ? 'el-icon-video-pause' : 'el-icon-video-play'"/> -->
              <el-tooltip class="item" effect="dark" content="暂停" placement="top">
                <img v-show="item.playState" src="./assets/video/pause.png" alt>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="播放" placement="top">
                <img v-show="!item.playState" title="播放" src="./assets/video/play.png" alt>
              </el-tooltip>
            </el-button>

            <!-- 视频实时/回放 -->
            <!--  <el-button circle @click="toggleReplay(index)">{{ item.live ? '实时' : '回放' }}</el-button> -->
            <el-button @click="toggleReplay(index)">
              <el-tooltip class="item" effect="dark" content="实时" placement="top">
                <img v-show="item.live" src="./assets/video/live.png" alt>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="回放" placement="top">
                <img v-show="!item.live" src="./assets/video/replay.png" alt>
              </el-tooltip>
            </el-button>

            <!-- 1分屏全屏 -->
            <el-button v-show="item.span === 24" @click="fullScreen(index)">
              <el-tooltip class="item" effect="dark" content="全屏" placement="top">
                <img v-show="!item.fullScreen" src="./assets/video/full.png" alt>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="退出全屏" placement="top">
                <img v-show="item.fullScreen" src="./assets/video/small.png" alt>
              </el-tooltip>
            </el-button>

            <!--          <div class="play-speed">
              <div class="active">1.0X</div>
              <div>2.0X</div>
              <div>4.0X</div>
            </div>-->

            <el-button v-show="item.live" class="play-speed">
              <span class="speed" :class="item.speed===1?'active':''" @click="changeSpeed(item,index,1)">1.0X</span>
              <span class="speed" :class="item.speed===2?'active':''" @click="changeSpeed(item,index,2)">2.0X</span>
              <span class="speed" :class="item.speed===4?'active':''" @click="changeSpeed(item,index,4)">4.0X</span>
            </el-button>
            <el-date-picker
              v-show="item.live"
              v-model="item.startTime"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
              :clearable="false"
              @change="pickerchange($event,item,index)"
            />
          </div>
          <timeline
            v-if="item.live&&item.flvPlayer"
            :key="item.timeKey"
            :ref="item.id"
            :timecell="item.timecell"
            :timers="item.speed"
            :play-cell-index="item.playCellIndex"
            :start-time="item.startTime"
            :start-play-time="item.startPlayTime"
            :canvasid="'canvas' + item.id"
            style="width:100%"
            @playReplayStop="playReplayStop($event,item,index)"
            @changeLine="changeLine($event,item,index)"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import './poster.js'
import flvjs from 'flv.js'
import timeline from './timeline.vue'
import { vmsService } from './api/vms'
import { clearToken, setToken } from './utils/vmsToken'
import ElementUI from 'element-ui';
import '../node_modules/element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
Vue.use(ElementUI);

export default {
  name: 'IchinaeVmsVideo',
  components: { timeline },
  props: {
    videoOption: {
      type: Object,
      required: true
    },
    vmsOption: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      timeKey: new Date().getTime(),
      activeIndex: null,
      videoList: [], // 视频dom
      imgsrc: '', // 截图
      startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
        }
      },
      ipcLinkInfo: {}
    }
  },
  computed: {

  },
  watch: {
    videoOption: {
      handler(newValue, oldValue) {
        if (this.videoOption.size === 1 && this.videoOption.isReplay) {
          this.dbclick(0)
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.destroyAll()
    flvjs.LoggingControl.enableWarn = false // 去掉警告日志的打印
    flvjs.LoggingControl.enableVerbose = false
    flvjs.LoggingControl.forceGlobalTag = true
    this.addVideo(4)
    if (this.videoOption.size === 1) {
      this.dbclick(0)
    }
    document.addEventListener(
      'keydown',
      event => {
        const keyCode = event.keyCode
        if (keyCode === 27) {
          this.fullScreen(this.activeIndex, 'esc')
        }
        // 空格播放暂停
        /* if (keyCode === 32) {
            this.toggle(this.activeIndex)
          } */
      },
      false
    )
    window.onbeforeunload = (e) => {
      clearToken()
    }
    window.addEventListener('storage', () => {
      this.videoOption.text = localStorage.getItem('userName') ? localStorage.getItem('userName') : this.videoOption.text
      this.$forceUpdate()
    })
    this.videoOption.text = localStorage.getItem('userName') ? localStorage.getItem('userName') : this.videoOption.text
  },
  beforeDestroy() {
    this.destroyAll()
  },
  methods: {
    pickerchange(e, item, index) {
      e = new Date(e).getTime() + 12 * 3600 * 1000
      this.changeLine(e, item, index, 'picker')
    },
    destroyAll() {
      this.videoList.forEach((e, index) => {
        this.destroy(index)
      })
    },
    // 下载截图
    download(bolb, item) {
      var a = document.createElement('a')
      var imgblob = new Blob([bolb], { type: 'application/octet-stream' })
      a.href = URL.createObjectURL(imgblob)
      var filename = `${item.name}${new Date().toLocaleString()}.jpg`
      a.download = filename
      a.click()
    },
    // 截图
    capture(index, item) {
      if (!item['canPlay']) {
        this.$message.info('暂无视频播放')
        return
      }
      // eslint-disable-next-line no-undef
      $poster.videoScreenshot(
        document.getElementById('videoElement' + index),
        0,
        async(e, res) => {
          const img = await this.blobToImg(res[0].blob)
          const canvas = this.imgToCanvas(img)
          const blob = await this.watermark(canvas, this.videoOption.text)
          const newImage = await this.blobToImg(blob)
          this.imgsrc = newImage.src
          this.download(blob, item)
        }
      )
    },
    blobToImg(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          const img = new Image()
          img.src = reader.result
          img.addEventListener('load', () => resolve(img))
        })
        reader.readAsDataURL(blob)
      })
    },
    imgToCanvas(img) {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      return canvas
    },
    // 水印
    watermark(canvas, text) {
      return new Promise((resolve, reject) => {
        const ctx = canvas.getContext('2d')
        //  ctx.fillStyle = 'rgb(255, 235, 59, .5)'
        // ctx.fillRect(50, 20, 40, 30)
        ctx.fillStyle = 'rgb(255, 255, 255, .6)'
        ctx.font = 'bold 45px 微软雅黑'
        ctx.textAlign = 'left'
        ctx.fillText(text, canvas.width * 0.15, canvas.height * 0.10)
        ctx.fillText(text, canvas.width * 0.45, canvas.height * 0.40)
        ctx.fillText(text, canvas.width * 0.75, canvas.height * 0.70)
        canvas.toBlob(blob => resolve(blob))
      })
    },
    reloadVideo() {
      this.$nextTick(res => {
        if (flvjs.isSupported()) {
          this.videoList.forEach((item, index) => {
            setTimeout(() => {
              this.loadvideo(index, item)
            }, 100)
          })
        }
      })
    },
    loadvideo(index, item, type) {
      this.$set(this.videoList[index], 'loading', true)
      this.$set(this.videoList[index], 'error', false)
      var videoElement = document.getElementById(item.id)
      this.videoList[index].flvPlayer = flvjs.createPlayer(
        {
          type: 'flv',
          isLive: true,
          url: type ? item.replaySrc : item.src
        },
        {
          enableWorker: true,
          enableStashBuffer: false,
          stashInitialSize: 128
        }
      )
      this.videoList[index].flvPlayer.attachMediaElement(videoElement)
      this.videoList[index].flvPlayer.load()
      this.videoList[index].flvPlayer.on(
        flvjs.Events.ERROR,
        (errorType, errorDetail, errorInfo) => {
          console.error('errorType:', errorType)
          console.error('errorDetail:', errorDetail)
          console.error('errorInfo:', errorInfo)
          // 如果视频播放出错就销毁player，用当前的url重新创建一个
          if (this.videoList[index].flvPlayer) {
            this.videoList[index].flvPlayer.destroy()
            if (errorInfo.code === 11) {
              this.loadvideo(index, item, type)
            }
            if (errorInfo.code < 2) {
              this.$set(this.videoList[index], 'canPlay', false)
              this.$set(this.videoList[index], 'loading', false)
              this.$set(this.videoList[index], 'error', true)
              this.$set(this.videoList[index], 'startPlayTime', false)
              if (!this.videoList[index].live) {
                this.$message.error('视频加载失败')
              } else {
                this.$message.error('回放录像加载失败')
                this.$set(this.videoList[index], 'error', false)
                this.$set(this.videoList[index], 'replaySrc', '')
              }
            }
          }
        }
      )
      this.eventTester(index, videoElement, 'progress')
      this.eventTester(index, videoElement, 'loadeddata')
      this.eventTester(index, videoElement, 'waiting')
      // this.eventTester(index, videoElement, 'error')
      // this.eventTester(index, videoElement, 'stalled')
    },
    // play pause
    toggle(index) {
      if (!this.videoList[index]['canPlay']) {
        this.$message.info('暂无视频播放')
        return
      }
      this.$set(
        this.videoList[index],
        'playState',
        !this.videoList[index].playState
      )
      this.$set(
        this.videoList[index],
        'startPlayTime',
        this.videoList[index].playState
      )
      if (this.videoList[index].playState) {
        this.videoList[index].flvPlayer.play()
        this.videoList[index].flvPlayer.load()
      } else {
        this.videoList[index].flvPlayer.pause()
        this.videoList[index].flvPlayer.unload()
      }
    },
    // 1 4 分屏
    addVideo(num) {
      this.videoList.forEach((e, index) => {
        if (e.flvPlayer && e.flvPlayer._receivedCanPlay) {
          e.flvPlayer.destroy()
        }
      })
      this.videoList = []
      for (let index = 0; index < num; index++) {
        this.videoList.push({
          id: 'videoElement' + index,
          show: true, // 是否展示 4<=>1
          isChecked: false, // 是否在视频窗格中
          autoplay: true, // 自动播放
          playState: true, // 播放状态
          mediaRecord: false, // 录像状态
          loading: false,
          fullScreen: false,
          span: this.formatSpam(num), // 分屏
          timecell: [], // 录像段
          speed: 1, // 回放速度 1 2 4
          playCellIndex: 0, // 当前播放录像段
          startPlayTime: false, // 时间轴是否走动
          startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          timeKey: new Date().getTime()
        })
      }
    },
    async pushvideo(name, id, isReolay, replayTime) {
      replayTime = new Date(replayTime).getTime() - 1 * 60 * 1000
      // 一屏播放替换url
      if (this.videoOption.size === 1) {
        const vmsInfo = await this.getVMSTOKEN(id)
        if (!vmsInfo) {
          return
        }
        this.$set(this.videoList[this.activeIndex], 'loading', true)
        this.commontPushVideo(this.activeIndex, vmsInfo.url, name, id, vmsInfo.ipcLinkInfo)
        if (isReolay) {
          this.toggleReplay(this.activeIndex)
          this.changeLine(replayTime, this.videoList[this.activeIndex], this.activeIndex, 'picker', true)
        }
      } else {
        // 4屏播放替换push url，末尾替换url
        const index = this.videoList.findIndex(
          e => JSON.stringify(e.flvPlayer) === '{}' || e.flvPlayer === undefined
        )
        if (index > -1) {
          const vmsInfo = await this.getVMSTOKEN(id)
          if (!vmsInfo) {
            return
          }
          this.$set(this.videoList[index], 'loading', true)
          this.commontPushVideo(index, vmsInfo.url, name, id, vmsInfo.ipcLinkInfo)
          if (isReolay) {
            this.toggleReplay(index)
            this.changeLine(replayTime, this.videoList[index], index, 'picker', true)
          }
        }
        if (index === -1) {
          const itemLength = this.videoList.length - 1
          const vmsInfo = await this.getVMSTOKEN(id)
          if (!vmsInfo) {
            return
          }
          this.$set(this.videoList[itemLength], 'loading', true)
          this.commontPushVideo(itemLength, vmsInfo.url, name, id, vmsInfo.ipcLinkInfo)
          if (isReolay) {
            this.toggleReplay(itemLength)
            this.changeLine(replayTime, this.videoList[itemLength], itemLength, 'picker', true)
          }
        }
      }
    },
    async getVMSTOKEN(id) {
      // vms 登录
      await this.vmsLogin(this.vmsOption.vmslogin, this.vmsOption.ipcLinkInfo)
      const { ipcLinkInfo } = await vmsService.getIpInfo(this.vmsOption.ipcLinkInfo, {
        'ipcID': id
      }).then(res => {
        return res.data
      })
      if (!ipcLinkInfo) {
        this.$message.error('获取视频地址失败')
        return
      }
      this.ipcLinkInfo = ipcLinkInfo
      // eslint-disable-next-line require-atomic-updates
      const url = `http://${ipcLinkInfo.serverIP}:${this.vmsOption.ipcLinkInfo.serverPort}/live?devid=${id}&channel=0`

      // 重复点击视频视觉提示
      const isplay = this.videoList.findIndex(e => e.src === url)
      if (isplay > -1) {
        this.$set(this.videoList[isplay], 'isChecked', true)
        setTimeout(() => {
          this.$set(this.videoList[isplay], 'isChecked', false)
        }, 500)
        return
      }
      return Promise.resolve({ url: url, ipcLinkInfo: ipcLinkInfo })
    },
    commontPushVideo(index, url, name, id, ipcLinkInfo) {
      this.destroy(index)
      this.$set(this.videoList[index], 'src', url)
      this.$set(this.videoList[index], 'name', name)
      this.$set(this.videoList[index], 'videoId', id)
      this.$set(this.videoList[index], 'serverIP', ipcLinkInfo.serverIP)
      this.loadvideo(index, this.videoList[index])
    },
    // 销毁
    destroy(index) {
      if (
        this.videoList[index].flvPlayer &&
        this.videoList[index].canPlay &&
        this.videoList[index].flvPlayer._receivedCanPlay
      ) {
        this.videoList[index].flvPlayer.destroy()
      }
      // this.fullScreen(index, 'esc')
      this.$delete(this.videoList[index], 'flvPlayer')
      this.$set(this.videoList[index], 'loading', false)
      this.$set(this.videoList[index], 'error', false)
      this.$set(this.videoList[index], 'live', false)
      this.$set(this.videoList[index], 'src', '')
      this.$set(this.videoList[index], 'replaySrc', '')
      this.$set(this.videoList[index], 'name', '')
    },
    formatSpam(num) {
      switch (num) {
        case 1:
          return 24
          // eslint-disable-next-line no-unreachable
          break
        case 4:
          return 12
          // eslint-disable-next-line no-unreachable
          break
        default:
          return 24
          // eslint-disable-next-line no-unreachable
          break
      }
    },
    // 全屏
    fullScreen(index, key) {
      if (index === null) {
        return
      }
      if (!this.videoList[index].flvPlayer) {
        return
      }
      this.$set(this.videoList[index], 'timeKey', new Date().getTime())
      this.$nextTick(() => {
        if (this.videoList[index].live) {
          this.pickerchange(this.videoList[index].startTime, this.videoList[index], index)
        }
      })
      if (key) {
        this.$set(this.videoList[index], 'fullScreen', false)
      } else {
        this.activeIndex = index
        this.$set(
          this.videoList[index],
          'fullScreen',
          !this.videoList[index].fullScreen
        )
      }
    },
    // 4 <=> 1 屏切换
    dbclick(index) {
      if (this.videoList[index].fullScreen) {
        return
      }
      this.$set(this.videoList[index], 'timeKey', new Date().getTime())
      this.$nextTick(() => {
        if (this.videoList[index].live) {
          this.pickerchange(this.videoList[index].startTime, this.videoList[index], index)
        }
      })
      this.activeIndex = index
      if (this.videoList[index].span === 12) {
        this.videoOption.size = 1
        this.$set(this.videoList[index], 'span', 24)
        this.$set(this.videoList[index], 'show', true)
        for (let i = this.videoList.length - 1; i >= 0; i--) {
          /* const e = this.videoList[i]
           if (e.flvPlayer && e.flvPlayer._receivedCanPlay && i !== index) {
            e.flvPlayer.destroy()
            this.$delete(this.videoList[i], 'flvPlayer')
          } */
          if (i !== index) {
          //  this.destroy(i)
            this.$set(this.videoList[i], 'show', false)
            // this.$set(this.videoList[i], 'src', '')
          }
        }
      } else if (this.videoList[index].span === 24) {
        if (this.videoOption.disabledDb) {
          return
        }
        this.videoOption.size = 4
        this.$set(this.videoList[index], 'span', 12)
        this.videoList.forEach((e, index) => {
          this.$set(this.videoList[index], 'show', true)
        })
      }
    },
    eventTester(index, Media, e) {
      Media.addEventListener(
        e,
        () => {
          if (e === 'loadeddata') {
            // console.log(e + ':' + Media.readyState)
            this.$set(this.videoList[index], 'loading', false)
            const item = this.videoList[index]
            if (!item.live && item.speed !== 1) {
              this.$set(this.videoList[index], 'speed', 1)
              this.changeSpeed(this.videoList[index], index, this.videoList[index].speed)
            }
            if (item.live) {
              this.changeSpeed(this.videoList[index], index, this.videoList[index].speed)
            }
            this.$set(this.videoList[index], 'startPlayTime', true)
            this.$set(this.videoList[index], 'canPlay', true)
            this.$set(this.videoList[index], 'playState', true)
          }
          if (e === 'progress') {
            // 获取当前播放时间
            const curr = Media.currentTime
            // 直播流缓存的最新帧
            const buffer = Media.buffered.end(0) - 0.5
            // 计算延迟
            const delayTime = buffer - curr
            // console.info(e + ':' + Media.readyState + '-----' + '延迟:' + delayTime)
            Media.currentTime = delayTime >= 3 ? Media.buffered.end(0) : Media.currentTime
          }
          if (e === 'error') {
            // console.info(e + ':' + Media.readyState)
          }
          if (e === 'stalled') {
            // console.info(e + ':' + Media.readyState)
          }
          if (e === 'waiting') {
            // console.info(e + ':' + Media.readyState)
          }
        },
        false
      )
    },
    // 开始录屏
    mediaRecording(index, item) {
      var canvas = document.getElementById(item.id)
      this.$set(this.videoList[index], 'mediaRecord', true)
      item.allChunks = []
      const stream2 = canvas.captureStream(60) // 60 FPS recording
      item.recorder = new MediaRecorder(stream2, {
        mimeType: 'video/webm;codecs=vp9'
      })
      item.recorder.ondataavailable = e => {
        item.allChunks.push(e.data)
      }
      item.recorder.start(10)
    },
    // 结束录屏
    stopAndblobDownload(index, item) {
      this.$set(this.videoList[index], 'mediaRecord', false)
      item.recorder.stop()
      const link = document.createElement('a')
      link.style.display = 'none'
      const fullBlob = new Blob(item.allChunks)
      const downloadUrl = window.URL.createObjectURL(fullBlob)
      link.href = downloadUrl
      link.download = `${item.name}${new Date().toLocaleString()}.webm`
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    // 回放 实时
    toggleReplay(index) {
      const item = this.videoList[index]
      this.$set(this.videoList[index], 'loading', false)
      if (!item.live) {
        item.flvPlayer.destroy()
        this.$set(this.videoList[index], 'canPlay', false)
        this.$set(this.videoList[index], 'startPlayTime', false)
        // this.changeLine(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), item, index, 'first')
      } else {
        if (item.replaySrc) {
          item.flvPlayer.destroy()
        }
        this.videoList[index].replaySrc = ''
        this.loadvideo(index, item)
      }
      // vmsService.getRecordList
      this.$set(this.videoList[index], 'live', !item.live)
    },
    // 回放时间线控制
    changeLine(e, item, index, type, replayTime) {
      if (
        this.videoList[index].flvPlayer &&
        this.videoList[index].replaySrc &&
        this.videoList[index].flvPlayer._receivedCanPlay
      ) {
        this.videoList[index].flvPlayer.destroy()
      }
      this.$set(this.videoList[index], 'startTime', new Date(new Date(e).getTime()))
      const hs = new Date(new Date(e).toISOString().slice(0, 10) + ' 00:00:00').getTime()
      const playtime = this.getPlayTime(e)
      // 选择日期触发
      if (type) {
        this.$set(this.videoList[index], 'timeKey', new Date().getTime())
        vmsService.getRecordList(this.ipcLinkInfo.serverIP, this.vmsOption.ipcLinkInfo, {
          devid: item.videoId,
          playtime: playtime
        }).then(res => {
          res = res.data
          if (res.returnState) {
            this.videoList[index].replaySrc = ''
            this.$message.error(`${new Date(e).toJSON().slice(0, 10)}没有录像`)
            this.$set(this.videoList[index], 'startPlayTime', false)
            return
          }
          this.videoList[index].timecell = []
          if (!replayTime) {
            this.$set(this.videoList[index], 'startTime', new Date(hs + res.recordList[0].startTime * 1000))
          }
          res.recordList.forEach(el => {
            const beginTime = new Date(hs + el.startTime * 1000).getTime()
            const endTime = new Date(hs + el.endTime * 1000).getTime()
            this.videoList[index].timecell.push({
              beginTime: beginTime,
              endTime: endTime,
              style: {
                background: 'rgba(132, 244, 180, 0.498039)'
              }
            })
          })
          let playStart = null
          if (!replayTime) {
            playStart = playtime + '' + this.secondToDate(res.recordList[0].startTime)
            this.$set(this.videoList[index], 'playCellIndex', 0)
          } else {
            const seconds = (e - new Date(this.getPlayTime(e, true)).getTime()) / 1000
            playStart = playtime + '' + this.secondToDate(seconds)
            const playCellIndex = res.recordList.findIndex(element => (seconds <= element.endTime && seconds >= element.startTime))
            this.$set(this.videoList[index], 'playCellIndex', playCellIndex)
          }
          this.videoList[index].sid = new Date().getTime()
          this.videoList[index].replaySrc = `http://${this.videoList[index].serverIP}:${this.vmsOption.ipcLinkInfo.serverPort}/playback?devid=${this.videoList[index].videoId}&playtime=${playStart}&sid=` + this.videoList[index].sid
          this.loadvideo(index, this.videoList[index], 'replay')
        })
      } else {
        // 拖动时间轴触发
        const clickTime = new Date(e).getTime()
        var isClickStart = false
        // eslint-disable-next-line no-unused-vars
        this.$set(this.videoList[index], 'playCellIndex', 0)

        this.videoList[index].timecell.forEach((el, dx) => {
          if (!type) {
            if (clickTime > el.beginTime && clickTime < el.endTime) {
              isClickStart = true
              this.$set(this.videoList[index], 'playCellIndex', dx)
            }
          }
        })

        if (!isClickStart) {
          this.videoList[index].replaySrc = ''
          this.$message.error('当前时间段无录像')
          this.$set(this.videoList[index], 'startPlayTime', false)
          return
        }
        var mimute = clickTime - hs
        const playStart = playtime + '' + this.secondToDate(mimute / 1000)
        this.videoList[index].replaySrc = `http://${this.videoList[index].serverIP}:${this.vmsOption.ipcLinkInfo.serverPort}/playback?devid=${this.videoList[index].videoId}&playtime=${playStart}&sid=` + this.videoList[index].sid
        this.loadvideo(index, this.videoList[index], 'replay')
      }
    },
    getPlayTime(e, type) {
      const y = new Date(e).getFullYear()
      const m = (new Date(e).getMonth() + 1) > 10 ? (new Date(e).getMonth() + 1) : ('0' + (new Date(e).getMonth() + 1))
      const d = (new Date(e).getDate()) > 10 ? (new Date(e).getDate()) : ('0' + (new Date(e).getDate()))
      if (type) {
        return y.toString() + '-' + m.toString() + '-' + d.toString() + ' ' + '00:00:00'
      }
      return y.toString() + m.toString() + d.toString()
    },
    secondToDate(result) {
      var h = Math.floor(result / 3600)
      var m = Math.floor((result / 60 % 60))
      var s = Math.floor((result % 60))
      h = h >= 24 ? h - 24 : h
      h = h >= 10 ? h : '0' + h

      m = m >= 10 ? m : '0' + m
      s = s >= 10 ? s : '0' + s
      // eslint-disable-next-line no-return-assign
      return result = h.toString() + m.toString() + s.toString()
    },
    vmsLogin(userInfo, url) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        vmsService.login(url, { username: username, password: password }).then(response => {
          const { headers } = response
          setToken(headers['auth-token'])
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    changeSpeed(item, index, speed) {
      const video = document.getElementById(item.id)
      vmsService.setvideorate(this.ipcLinkInfo.serverIP, this.vmsOption.ipcLinkInfo, {
        devid: item.videoId,
        scale: speed,
        sid: item.sid
      }).then(res => {
        res = res.data
        if (res.returnState.stateCode === 0) {
          this.$set(this.videoList[index], 'speed', speed)
        } else {
          this.$set(this.videoList[index], 'speed', 1)
        }
        video.playbackRate = this.videoList[index].speed
      })
    },
    playReplayStop(playIndex, item, index) {
      this.videoList[index].replaySrc = ''
    }
  }
}
</script>

<style lang="scss">
.videotemplate {
  user-select: none;
  height: 100%;
  width: 100%;

  .el-row {
    width: 100%;
    height: 100%;
    padding: 0 5px !important;
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
    height: 100%;
  }

  .fullScreen {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    transition: all 0.5s;
  }

  .videowrap {
    position: relative;
    transition: all 0.5s;
  }

  .el-col-12 {
    height: 50%;
  }

  .videowrap,
  .fullScreen {
    border: 2px solid #000;
    height: 100%;
    width: 100%;
    background: #1e2427;

    .videoTitle {
      position: absolute;
      z-index: 5;
      color: #fff;
      top: 0;
      left: 0;
    }

    .water {
      user-select: none;
      position: absolute;
      color: rgb(255, 255, 255);
      opacity: 0.6;
      z-index: 99;
      top: 15%;
      left: 10%;
      text-align: center;
      line-height: 30px;
      font-size: 30px;
      font-weight: 600;
    }

    .water3 {
      top: 75%;
      left: 70%;
    }

    .water2 {
      top: 45%;
      left: 40%;
    }

    video {
      object-fit: fill;
    }

    .control {
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.5s;
      width: 100%;
      height: 40px;
      position: absolute;
      bottom: 2px;
      left: 2px;
      button {
        background: none;
        border: none;
        padding: 0;
        float: left;
      }
      .play-speed {
        width: 130px;
        height: 40px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.5);
       float: left;
        color: #fff;
        &:hover {
          color: #fff;
        }
        bottom: 0;
        .speed {
          width: 50px;
          height: 100%;
          text-align: center;
          cursor: pointer;
          padding: 0 5px;
          &:hover {
            color: #3075ff;
          }
          &.active {
            color: #3075ff;
          }
        }
      }
      .el-date-editor {
        height: 40px !important;
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 10px;
        right: 5px;
        bottom: 0;
        width: 150px;
        .el-input__inner {
          height: 40px !important;
          background: rgba(0, 0, 0, 0.5);
          border: none;
        }
        .el-input__icon {
          line-height: 40px;
        }
      }
    }
  }

  .videowrap,
  .fullScreen {
    &:hover {
      .control,
      .closrControl {
        cursor: pointer;
        opacity: 1;
        transition: opacity 0.5s;
      }
    }
  }

  .tcl {
    position: absolute;
    opacity: 0;
    color: red;
    top: 10px;
    font-weight: 600;
    left: 10px;
    font-size: 20px;
    animation: flash 1s infinite;
  }

  @keyframes flash {
    0%,
    50%,
    to {
      opacity: 1;
    }

    25%,
    75% {
      opacity: 0;
    }
  }

  .closrControl {
    position: absolute;
    opacity: 0;
    top: 10px;
    right: 10px;
    z-index: 999999999;
    button {
      background: none;
      border: none;
      padding: 0;
    }
  }

  .error {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    > span {
      padding: 20px 0;
      font-size: 20px;
      color: red;
    }
  }

  .timeline {
    canvas {
      width: 100%;
    }
  }

  .show {
    display: block;
  }

  .hide {
    display: none;
  }

  .animate__animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }

  .animate__shakeX {
    -webkit-animation-name: shakeX;
    animation-name: shakeX;
  }

  @-webkit-keyframes shakeX {
    from,
    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }

    10%,
    30%,
    50%,
    70%,
    90% {
      -webkit-transform: translate3d(-10px, 0, 0);
      transform: translate3d(-10px, 0, 0);
    }

    20%,
    40%,
    60%,
    80% {
      -webkit-transform: translate3d(10px, 0, 0);
      transform: translate3d(10px, 0, 0);
    }
  }
  @keyframes shakeX {
    from,
    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }

    10%,
    30%,
    50%,
    70%,
    90% {
      -webkit-transform: translate3d(-10px, 0, 0);
      transform: translate3d(-10px, 0, 0);
    }

    20%,
    40%,
    60%,
    80% {
      -webkit-transform: translate3d(10px, 0, 0);
      transform: translate3d(10px, 0, 0);
    }
  }
}
</style>
