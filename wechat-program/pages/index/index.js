// index.js
// 获取应用实例
const app = getApp()
var times = 0
var flag = 0
var motto
var left = 0
var right = 0
var have_a_rest = 0
var receieve_backmessage = 0
var first_takephoto = 0
Page({
  data: {
    motto: '暂无识别对象',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    //页面加载时开启socket连接
    this.ws = wx.connectSocket({
      // url:'ws://10.192.162.233:8866'
      url:'ws://172.20.10.4:8866',//此处开发者热点接口地址
      //url:'ws://10.214.199.32:8866' , //此处开发者服务器接口地址
      //url:'ws://192.168.0.106:8866' , //此处开发者服务器接口地址
    })
    
    wx.onSocketOpen((result) => {
      console.log('WebSocket连接成功')
    })
    wx.onSocketError((result) => {
      console.log('WebSocket连接失败')
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  takePhoto(){


    var that = this;
    var base64;
    var Base64;
    var send = 0;
    var Recognition_results;
    flag = 1
    console.log(flag)
    this.listener = wx.createCameraContext().onCameraFrame((frame) => {
            // console.log(111)
      //         if(flag2==1)
      //         {
      //           this.listener.stop({ 
      //           success : function(e)
      //           {console.log( "stop success" );}
      //           }); 
      //         }
              // count ++
              // if(count == 20)
              if(send == 0)
              {
                 if (!this.data.isReuqest) {
      //              console.log(222)
                  this.setData({
                    Height: frame.height,
                    Width: frame.width
                  })
                  var data = new Uint8Array(frame.data);
                  var clamped = new Uint8ClampedArray(data);
      //             console.log(frame.width, frame.height, clamped)
                  this.temframe = {};
                  this.temframe.width = frame.width;
                  this.temframe.height = frame.height;
                  this.temframe.data = clamped;
                  this.transformArrayBuffer();
                }
                send=1
              }

      wx.onSocketMessage((result) => {
        send = 0
        console.log('已收到识别结果回传')
          receieve_backmessage = 1
          console.log('识别结果  '+result.data)
          Recognition_results = result.data
          if(Recognition_results == 0 && left>=3){
            this.setData({ motto:"识别结果：左转"})
            let srcurl = "/pages/index/turn-left.mp3"
            var innerAudioContext = wx.createInnerAudioContext()
            innerAudioContext.src = srcurl
            innerAudioContext.autoplay = true
            innerAudioContext.onPlay()
            left = 0
          }
          else if(Recognition_results == 0 && left<3){
            left++
            right = 0
            have_a_rest = 0
          }
          else if(Recognition_results == 1 && right<3){
            right++
            left = 0
            have_a_rest = 0
          }
          else if(Recognition_results == 2 && left<3){
            left++
            right = 0
            have_a_rest = 0
          }
          else if(Recognition_results == 3 && have_a_rest<3){
            have_a_rest++
            left = 0
            right = 0
          }
          else if(Recognition_results == 1 && right>=3){
            this.setData({ motto:"识别结果：向右走"})
            let srcurl = "/pages/index/turn-right.mp3"
            var innerAudioContext = wx.createInnerAudioContext()
            innerAudioContext.src = srcurl
            innerAudioContext.autoplay = true
            innerAudioContext.onPlay()
            right = 0
          }
          else if(Recognition_results == 2 && left>=3){
            this.setData({ motto:"识别结果：向左走"})
            let srcurl = "/pages/index/turn-left.mp3"
            var innerAudioContext = wx.createInnerAudioContext()
            innerAudioContext.src = srcurl
            innerAudioContext.autoplay = true
            innerAudioContext.onPlay()
            left = 0
          }
          else if(Recognition_results == 3 && have_a_rest>=3){
            this.setData({ motto:"识别结果：已到达安全出口"})
            let srcurl = "/pages/index/emergency_exit.mp3"
            var innerAudioContext = wx.createInnerAudioContext()
            innerAudioContext.src = srcurl
            innerAudioContext.autoplay = true
            innerAudioContext.onPlay()
            have_a_rest = 0
          }
          else if(Recognition_results == 9){
            this.setData({ motto:"识别失败"})
            left = 0
            right = 0
            have_a_rest =0
          }
          else{
            this.setData({motto:"识别失败"})
          }
      })
            });
    this.listener.start()
  },

  StoptakePhoto(){
    flag = 0
    this.listener.stop()
  },


  error(e){
    console.log(e.detail)
  },
  
  transformArrayBuffer: function () {
        this.setData({
          isReuqest:false
        });
        var tf = this.temframe;
    //      console.log(tf)
        var _this = this;
        wx.canvasPutImageData({
          canvasId: 'tempCanvas',
          x: 0,
          y: 0,
          width: tf.width,
          height: tf.height,
           canvas: _this.canvas,
          data: tf.data,
          success: function (res) {
    //          console.log('绘制成功', res)
            _this.scaning = true;
            var that=_this;
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: tf.width,
              height: tf.height,
              canvasId: 'tempCanvas',
               canvas: _this.canvas,
              fileType: 'png',
              destWidth: tf.width* 750 / wx.getSystemInfoSync().windowWidth,
              destHeight: tf.height* 750 / wx.getSystemInfoSync().windowWidth,
              // 精度修改
              quality: 1,
              success(res) {
    //              console.log(res.tempFilePath)
                var _that=that;
                var FSM = wx.getFileSystemManager()
                FSM.readFile({
                  filePath: res.tempFilePath,
                  encoding: "base64",
                  success: function(data) {
                    _that.ws.send({
                      data: data.data
                    })
                  },
                  fail: function (e) {
                    console.log(222);
                  }
                });
    //             setTimeout(() => {
    //               _this._takePhoto();
    //             }, 50);
              },
    //           fail(res) {
    //             setTimeout(() => {
    //               _this._takePhoto();
    //             }, 500);
    //           }
            });
          },
    //       fail: function (e) {
    //         console.log('res', e);
    //         setTimeout(() => {
    //           _this._takePhoto();
    //         }, 500);
    //       }
        });
      },
})

function sendSocketMessage(msg) {
  if (socketOpen) {
    wx.sendSocketMessage({
      data:msg
    })
  } else {
    socketMsgQueue.push(msg)
  }
};

//"usingComponents": {}

function transformArrayBuffer() {
    this.setData({
      isReuqest:false
    });
    var tf = this.temframe;
    // console.log(tf)
    var _this = this;
    wx.canvasPutImageData({
      canvasId: 'tempCanvas',
      x: 0,
      y: 0,
      width: tf.width,
      height: tf.height,
      // canvas: _this.canvas,
      data: tf.data,
      success: function (res) {
//          console.log('绘制成功', res)
        _this.scaning = true;
        var that=_this;
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: tf.width,
          height: tf.height,
          canvasId: 'tempCanvas',
          // canvas: _this.canvas,
          fileType: 'png',
          destWidth: tf.width* 750 / wx.getSystemInfoSync().windowWidth,
          destHeight: tf.height* 750 / wx.getSystemInfoSync().windowWidth,
          // 精度修改
          quality: 1,
          success(res) {
//             console.log(res.tempFilePath)
            var _that=that;
            var FSM = wx.getFileSystemManager()
            FSM.readFile({
              filePath: res.tempFilePath,
              encoding: "base64",
              success: function(data) {
                _that.ws.send({
                  data: data.data
                })
              },
              fail: function (e) {
                console.log(222);
              }
            });
//             setTimeout(() => {
//               _this._takePhoto();
//             }, 50);
          },
//           fail(res) {
//             setTimeout(() => {
//               _this._takePhoto();
//             }, 500);
//           }
        });
      },
//       fail: function (e) {
//         console.log('res', e);
//         setTimeout(() => {
//           _this._takePhoto();
//         }, 500);
//       }
    });
  }