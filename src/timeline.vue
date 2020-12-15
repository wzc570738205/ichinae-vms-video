<!--
 * @Author: wangzhichiao<https://github.com/wzc570738205>
 * @Date: 2020-07-08 09:48:06
 * @LastEditors: wangzhichiao<https://github.com/wzc570738205>
 * @LastEditTime: 2020-08-04 09:10:03
-->
<template>
  <div :id="'wrap' + canvasid" class="canvas">
    <canvas
      :id="canvasid"
      width="100%"
      height="100"
      style="cursor: pointer;border:1px solid #2b2f33;background-color: #2b2f33;"
      ondragstart="return false;"
    />

    <!--   <div class="btn">
      <el-date-picker v-model="startTime" type="date" placeholder="选择日期" @change="pickerchange" />
      <div class="play-speed">
        <div class="active">1.0X</div>
        <div>2.0X</div>
        <div>4.0X</div>
      </div>
    </div>
    <button id="setTimeMove" type="info" @click="replay">setTimeMove</button>
    <button id="stopTimeMove">stopTimeMove</button>
    <button id="setTime">setTime</button>-->
  </div>
</template>

<script>
export default {
  props: {
    canvasid: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    timecell: {
      type: Array,
      required: true
    },
    timers: {
      type: Number,
      required: true
    },
    playCellIndex: {
      type: Number,
      required: true
    },
    startPlayTime: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      setTimeMove: null,
      /* timecell: [
        {
          beginTime: new Date('2020/7/26 02:05:14').getTime(),
          endTime: new Date('2020/7/27').getTime(),
          style: {
            background: 'rgba(132, 244, 180, 0.498039)'
          }
        }
      ],*/
      canvas: null,
      ctx: null,
      canvansW: null,
      canVansH: null,
      minutes_per_step: [
        1,
        2,
        5,
        10,
        15,
        20,
        30,
        60,
        120,
        180,
        240,
        360,
        720,
        1440
      ], // min/格
      graduation_step: 20, // 刻度间最小宽度，单位px,
      hours_per_ruler: 24, // 时间轴显示24小时,
      start_timestamp: null, // 开始时间
      distance_between_gtitle: 80,
      zoom: 24,
      g_isMousedown: false, // 拖动mousedown标记,
      g_isMousemove: false, // 拖动mousemove标记,
      g_mousedownCursor: null, // 拖动mousedown的位置,
      returnTime: null // mouseup返回时间,
    }
  },
  watch: {
    startTime: {
      handler(newName, oldName) {
        if (this.ctx) {
          this.pickerchange(newName)
        }
      },
      immediate: true,
      deep: true
    },
    timecell: {
      handler(newName, oldName) {
        if (this.ctx) {
          this.add_cells(newName)
        }
      },
      immediate: true,
      deep: true
    },
    timers: {
      handler(newName, oldName) {
        if (this.ctx) {
          this.replay(newName)
        }
      },
      immediate: true,
      deep: true
    },
    startPlayTime: {
      handler(newName, oldName) {
        if (!newName) {
          clearInterval(this.setTimeMove)
        } else {
          this.replay(this.timers)
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.$nextTick(e => {
      this.canvas = document.getElementById(this.canvasid)
      this.canvas.width = document.getElementById(
        'wrap' + this.canvasid
      ).offsetWidth
      this.ctx = this.canvas.getContext('2d')
      this.canvansW = this.canvas.width
      this.canVansH = this.canvas.height
      this.start_timestamp =
        new Date(this.startTime).getTime() - 12 * 60 * 60 * 1000 // this.timecell[0].beginTime - 12 * 60 * 60 * 1000
      this.init(this.start_timestamp, this.timecell, false)
      // this.replay(this.timers)
    })
  },
  beforeDestroy() {
    clearInterval(this.setTimeMove)
  },
  methods: {
    /**
     * 初始化
     * @param {*} start_timestamp 最左侧时间
     * @param {*} timecell 录像段数组
     */
    init(start_timestamp, timecell, redrawFlag) {
      this.drawCellBg()
      this.add_graduations(start_timestamp)
      this.add_cells(timecell)
      this.drawLine(
        0,
        this.canVansH,
        this.canvansW,
        this.canVansH,
        'rgb(151, 158, 167)',
        1
      ) // 底线
      this.drawLine(
        this.canvansW / 2,
        0,
        this.canvansW / 2,
        33,
        'rgb(244, 67, 54)',
        2
      ) // 中间播放点时间线
      if (!redrawFlag) {
        // 只有第一次进入才需要添加事件
        this.add_events()
      }
      var time = start_timestamp + (this.hours_per_ruler * 3600 * 1000) / 2
      this.ctx.fillStyle = 'rgb(244, 67, 54)' // 中间时间文字
      this.ctx.fillText(this.changeTime(time), this.canvansW / 2 - 60, 50)
    },
    /**
     * 绘制添加刻度
     */
    add_graduations(start_timestamp) {
      var px_per_min = this.canvansW / (this.hours_per_ruler * 60) // px/min
      var px_per_ms = this.canvansW / (this.hours_per_ruler * 60 * 60 * 1000) // px/ms
      var px_per_step = this.graduation_step // px/格 默认最小值20px
      var min_per_step = px_per_step / px_per_min // min/格
      for (let i = 0; i < this.minutes_per_step.length; i++) {
        if (min_per_step <= this.minutes_per_step[i]) {
          // 让每格时间在minutes_per_step规定的范围内
          min_per_step = this.minutes_per_step[i]
          px_per_step = px_per_min * min_per_step
          break
        }
      }

      var medium_step = 30
      // eslint-disable-next-line no-redeclare
      for (let i = 0; i < this.minutes_per_step.length; i++) {
        if (
          this.distance_between_gtitle / px_per_min <=
          this.minutes_per_step[i]
        ) {
          medium_step = this.minutes_per_step[i]
          break
        }
      }

      var num_steps = this.canvansW / px_per_step // 总格数
      var graduation_left
      var graduation_time
      // eslint-disable-next-line no-unused-vars
      var caret_class
      var lineH
      var ms_offset = this.ms_to_next_step(
        start_timestamp,
        min_per_step * 60 * 1000
      ) // 开始的偏移时间 ms
      var px_offset = ms_offset * px_per_ms // 开始的偏移距离 px
      var ms_per_step = px_per_step / px_per_ms // ms/step
      for (let i = 0; i < num_steps; i++) {
        graduation_left = px_offset + i * px_per_step // 距离=开始的偏移距离+格数*px/格
        graduation_time = start_timestamp + ms_offset + i * ms_per_step // 时间=左侧开始时间+偏移时间+格数*ms/格
        var date = new Date(graduation_time)
        if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) {
          caret_class = 'big'
          lineH = 25
          var big_date = this.graduation_title(date)
          this.ctx.fillText(big_date, graduation_left - 20, 30)
          this.ctx.fillStyle = 'rgba(151,158,167,1)'
        } else if ((graduation_time / (60 * 1000)) % medium_step === 0) {
          caret_class = 'middle'
          lineH = 15
          var middle_date = this.graduation_title(date)
          this.ctx.fillText(middle_date, graduation_left - 20, 30)
          this.ctx.fillStyle = 'rgba(151,158,167,1)'
        } else {
          lineH = 10
        }
        // drawLine(graduation_left,0,graduation_left,lineH,"rgba(151,158,167,0.4)",1);
        this.drawLine(
          graduation_left,
          0,
          graduation_left,
          lineH,
          'rgba(151,158,167,1)',
          1
        )
      }
    },

    /**
     * 绘制线
     * @param {*} beginX
     * @param {*} beginY
     * @param {*} endX
     * @param {*} endY
     * @param {*} color
     * @param {*} width
     */
    drawLine(beginX, beginY, endX, endY, color, width) {
      this.ctx.beginPath()
      this.ctx.moveTo(beginX, beginY)
      this.ctx.lineTo(endX, endY)
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = width
      this.ctx.stroke()
    },

    /**
     * 添加录像段
     * @param {*} cells 录像数组
     */
    add_cells(cells) {
      cells.forEach(cell => {
        this.draw_cell(cell)
      })
    },

    /**
     * 绘制录像块
     * @param {*} cell cell包括beginTime ms;endTime ms;style
     */
    draw_cell(cell) {
      var px_per_ms = this.canvansW / (this.hours_per_ruler * 60 * 60 * 1000) // px/ms
      var beginX = (cell.beginTime - this.start_timestamp) * px_per_ms
      var cell_width = (cell.endTime - cell.beginTime) * px_per_ms
      this.ctx.fillStyle = cell.style.background
      // console.log(cell.beginTime + '-' + this.start_timestamp)
      this.ctx.fillRect(beginX, 0, cell_width, 15)
    },

    /**
     * 绘制录像块背景
     */
    drawCellBg() {
      this.ctx.fillStyle = 'rgba(69, 72, 76, 0.5)'
      this.ctx.fillRect(0, 0, this.canvansW, 15)
    },

    /**
     * 时间轴事件
     */
    add_events() {
      this.canvas.addEventListener('mousewheel', this.mousewheelFunc)
      this.canvas.addEventListener('mousedown', this.mousedownFunc)
      this.canvas.addEventListener('mousemove', this.mousemoveFunc)
      this.canvas.addEventListener('mouseup', this.mouseupFunc)
      this.canvas.addEventListener('mouseout', this.mouseoutFunc)
    },

    /**
     * 拖动/点击 mousedown事件
     */
    mousedownFunc(e) {
      this.g_isMousedown = true
      this.g_mousedownCursor = this.get_cursor_x_position(e) // 记住mousedown的位置
    },

    /**
     * 拖动/鼠标hover显示 mousemove事件
     */
    mousemoveFunc(e) {
      var pos_x = this.get_cursor_x_position(e)
      var px_per_ms = this.canvansW / (this.hours_per_ruler * 60 * 60 * 1000) // px/ms
      this.clearCanvas()
      if (this.g_isMousedown) {
        var diff_x = pos_x - this.g_mousedownCursor
        this.start_timestamp =
          this.start_timestamp - Math.round(diff_x / px_per_ms)
        this.init(this.start_timestamp, this.timecell, true)
        this.g_isMousemove = true
        this.g_mousedownCursor = pos_x
      } else {
        var time = this.start_timestamp + pos_x / px_per_ms
        this.init(this.start_timestamp, this.timecell, true)
        this.drawLine(pos_x, 0, pos_x, 50, 'rgb(194, 202, 215)', 1)
        this.ctx.fillStyle = 'rgb(194, 202, 215)'
        this.ctx.fillText(this.changeTime(time), pos_x - 50, 60)
      }
    },

    /**
     * 拖动/点击 mouseup事件
     */
    mouseupFunc(e) {
      if (this.g_isMousemove) {
        // 拖动 事件
        this.g_isMousemove = false
        this.g_isMousedown = false
        this.returnTime =
          this.start_timestamp + (this.hours_per_ruler * 3600 * 1000) / 2
      } else {
        // click 事件
        this.g_isMousedown = false
        var posx = this.get_cursor_x_position(e) // 鼠标距离 px
        var ms_per_px = (this.zoom * 3600 * 1000) / this.canvansW // ms/px
        this.returnTime = this.start_timestamp + posx * ms_per_px
        this.set_time_to_middle(this.returnTime)

        if (new Date(this.returnMouseupTime()).getTime() > new Date().getTime()) {
          console.log('超过当日时间')
          this.set_time_to_middle(new Date().getTime())
          this.start_timestamp = new Date().getTime() - 12 * 60 * 60 * 1000
        } else {
          console.log('正常时间')
        }
      }
      this.$emit(
        'changeLine',
        new Date(this.returnMouseupTime())
      )
      this.replay(this.timers)
    },

    /**
     * 鼠标移出隐藏时间 mouseout事件
     * @param {*} e
     */
    mouseoutFunc(e) {
      this.clearCanvas()
      this.init(this.start_timestamp, this.timecell, true)
    },

    /**
     * 滚轮放大缩小，以时间轴中心为准 mousewheel事件
     */
    mousewheelFunc() {
      if (event && event.preventDefault) {
        event.preventDefault()
      } else {
        window.event.returnValue = false
        return false
      }

      var e = window.event || event
      var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      var middle_time =
        this.start_timestamp + (this.hours_per_ruler * 3600 * 1000) / 2 // ms 记住当前中间的时间
      if (delta < 0) {
        this.zoom = this.zoom + 4
        if (this.zoom >= 24) {
          this.zoom = 24 // 放大最大24小时
        }
        this.hours_per_ruler = this.zoom
      } else if (delta > 0) {
        // 放大
        this.zoom = this.zoom - 4
        if (this.zoom <= 1) {
          this.zoom = 1 // 缩小最小1小时
        }
        this.hours_per_ruler = this.zoom
      }

      this.clearCanvas()
      this.start_timestamp =
        middle_time - (this.hours_per_ruler * 3600 * 1000) / 2 // start_timestamp = 当前中间的时间 - zoom/2
      this.init(this.start_timestamp, this.timecell, true)
    },

    /**
     * 获取鼠标posx
     * @param {*} e
     */
    get_cursor_x_position(e) {
      var posx = 0

      if (!e) {
        e = window.event
      }

      if (e.offsetX || e.pageY) {
        posx = e.offsetX
      } else if (e.clientX || e.clientY) {
        posx =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft
      }

      return posx
    },

    /**
     * 返回时间轴上刻度的时间
     * @param {*} datetime new Date 格式
     */
    graduation_title(datetime) {
      if (
        datetime.getHours() === 0 &&
        datetime.getMinutes() === 0 &&
        datetime.getMilliseconds() === 0
      ) {
        return (
          ('0' + datetime.getDate().toString()).substr(-2) +
          '.' +
          ('0' + (datetime.getMonth() + 1).toString()).substr(-2) +
          '.' +
          datetime.getFullYear()
        )
      }
      return (
        datetime.getHours() +
        ':' +
        ('0' + datetime.getMinutes().toString()).substr(-2)
      )
    },

    /**
     * 返回 2018-01-01 10:00:00 格式时间
     * @param {*} time
     */
    changeTime(time) {
      var newTime = new Date(time)
      var year = newTime.getFullYear()
      var month = newTime.getMonth() + 1
      if (month < 10) {
        // eslint-disable-next-line no-redeclare
        var month = '0' + month
      }
      var date = newTime.getDate()
      if (date < 10) {
        // eslint-disable-next-line no-redeclare
        var date = '0' + date
      }
      var hour = newTime.getHours()
      if (hour < 10) {
        // eslint-disable-next-line no-redeclare
        var hour = '0' + hour
      }
      var minute = newTime.getMinutes()
      if (minute < 10) {
        // eslint-disable-next-line no-redeclare
        var minute = '0' + minute
      }
      var second = newTime.getSeconds()
      if (second < 10) {
        // eslint-disable-next-line no-redeclare
        var second = '0' + second
      }
      return (
        year +
        '-' +
        month +
        '-' +
        date +
        ' ' +
        hour +
        ':' +
        minute +
        ':' +
        second
      )
    },

    /**
     * 左侧开始时间的偏移，返回单位ms
     * @param {*} timestamp
     * @param {*} step
     */
    ms_to_next_step(timestamp, step) {
      var remainder = timestamp % step
      return remainder ? step - remainder : 0
    },

    /**
     * 设置时间，让这个时间点跳到中间红线处
     *  @param {*} time 单位ms
     */
    set_time_to_middle(time) {
      this.clearCanvas()
      this.start_timestamp = time - (this.hours_per_ruler * 60 * 60 * 1000) / 2
      this.init(this.start_timestamp, this.timecell)
    },
    // eslint-disable-next-line no-unused-vars
    returnMouseupTime() {
      if (this.returnTime != null) {
        return this.returnTime
      }
    },

    /**
     * 清除canvas 每次重新绘制需要先清除
     */
    clearCanvas() {
      if (this.ctx && this.ctx.clearRect) {
        this.ctx.clearRect(0, 0, 1500, 150)
      }
    },
    replay(s) {
      clearInterval(this.setTimeMove)
      if (!this.startPlayTime) {
        return
      }
      let time
      if (this.returnMouseupTime()) {
        time = new Date(this.returnMouseupTime()).getTime()
      } else {
        time = new Date(this.start_timestamp).getTime() + 12 * 60 * 60 * 1000
      }
      this.setTimeMove = setInterval(() => {
        time += 1000
        this.start_timestamp = time
        this.set_time_to_middle(time)
        if (time >= this.timecell[this.playCellIndex].endTime) {
          clearInterval(this.setTimeMove)
          this.$emit(
            'playReplayStop',
            this.playCellIndex
          )
          setTimeout(() => {
            this.$message.success('当前时间段录像播放完毕')
          }, 2000)
        }
      }, 1000 / s) // 1-1000 2-500 4-250 8/125
    },
    pickerchange(e) {
      this.$nextTick(el => {
        this.start_timestamp =
        new Date(this.startTime).getTime() // - 12 * 60 * 60 * 1000 // this.timecell[0].beginTime - 12 * 60 * 60 * 1000
        this.set_time_to_middle(new Date(this.start_timestamp).getTime())
        this.replay(this.timers)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.canvas {
  width: 100%;
}
.btn {
  .play-speed {
    width: 167px;
    height: 25px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.5);
    float: right;
    display: flex;
    color: #fff;
    justify-content: space-around;
    align-content: center;
    line-height: 25px;

    > div {
      width: 50px;
      height: 100%;
      text-align: center;
      cursor: pointer;
      &.active{
        color: #3075FF;
      }
    }
  }
  ::v-deep .el-date-editor {
    float: right;
    height: 25px !important;
    width: 150px;
    .el-input__inner {
      height: 25px !important;
    }
    .el-input__icon {
      line-height: 25px;
    }
  }
}
</style>
