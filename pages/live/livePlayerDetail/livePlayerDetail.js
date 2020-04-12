var app = getApp();
var WxParse = require('../../../lib/wxParse/wxParse.js');
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    id: 0,
    live: {},
    shareImage: '',
    posterImage: '',
    posterPopupShow: false,
    canWrite: false, //用户是否获取了保存相册的权限
    liveStatus: {
      101: "直播中",
      102: "未开始",
      103: "已结束",
      104: "禁播",
      105: "暂停中",
      106: "异常",
      107: "已过期"
    }
  },

  // 页面分享
  onShareAppMessage: function() {
    var live = this.data.live
    var title = live.title != null ? live.title : live.name
    return {
      title: title,
      imageUrl: this.data.live.anchorImg,
      path: '/pages/live/livePlayerDetail/livePlayerDetail?id=' + this.data.id
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getLiveDetail();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  handleSetting: function(e) {
      var that = this;
      // console.log(e)
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
              title: '警告',
              content: '不授权无法保存',
              showCancel: false
          })
          that.setData({
              canWrite: false
          })
      } else {
          wx.showToast({
              title: '保存成功'
          })
          that.setData({
              canWrite: true
          })
      }
  },
  handleSetting: function(e) {
      var that = this;
      // console.log(e)
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
              title: '警告',
              content: '不授权无法保存',
              showCancel: false
          })
          that.setData({
              canWrite: false
          })
      } else {
          wx.showToast({
              title: '保存成功'
          })
          that.setData({
              canWrite: true
          })
      }
  },
  // 保存分享图
  saveShare: function() {
    let that = this;
    wx.downloadFile({
      url: that.data.posterImage,
      success: function(res) {
        that.checkSaveAuth()
        if(!that.data.canWrite){
          util.showErrorToast('请检查下载权限是否开启')
          return false
        }
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '存图成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function(res) {
            console.log('fail')
          }
        })
      },
      fail: function(e) {
        util.showErrorToast('图片下载失败')
        console.log(e + 'fail')
      }
    })
  },

  // 获取商品信息
  getLiveDetail: function() {
    let that = this;
    util.request(api.LiveRoomDetail, {
      id: that.data.id
    }, "POST").then(function(res) {
      if (res.errcode === '0') {
        if(res.data == null){
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: '直播间不存在'
          });
          return
        }
        that.setData({
          live: res.data
        });
        WxParse.wxParse('liveDetail', 'html', res.data.content, that);

        that.syncLiveStatus()
      }
    });
  },

  onLoad: function(options) {
    const scene = decodeURIComponent(options.scene)
    if(scene){
      var info_arr = [];
      var params = scene.split('&');

      for(var i = 0; i < params.length; i++){
        var info_arr = params[i].split('=');
        options[info_arr[0]] = info_arr[1]
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.id && options.id != 0) {
      this.setData({
        id: parseInt(options.id)
      });
    }

    this.getLiveDetail()
    this.checkSaveAuth()
  },
  onShow: function() {
    // 页面显示
  },
  genSharePoster: function(){
    let that = this;
    var scene = 'id=' + this.data.id

    util.request(api.StorageGeneralLivePoster, {
      "liveId": this.data.id,
      "scene": scene,
      "page": 'pages/live/livePlayerDetail/livePlayerDetail'
    }, "POST").then(function (res) {
      if (res.errcode === '0') {
        that.setData({
          openShare: false,
          posterPopupShow: true,
          posterImage: res.data.url
        });
        return false
      }
      util.showErrorToast('生成海报失败')
      that.setData({
        submitLoading: false
      });
    }).catch((err) => {
      util.showErrorToast('生成海报失败')
      that.setData({
        submitLoading: false
      });
    });
  },
  checkSaveAuth: function(){
    let that = this;
    wx.getSetting({
      success: function (res) {
        console.log(res)
        //不存在相册授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: function () {
                    that.setData({
                        canWrite: true
                    })
                },
                fail: function (err) {
                    that.setData({
                        canWrite: false
                    })
                }
            })
        } else {
            that.setData({
                canWrite: true
            });
        }
      }
    })
  },
  shareFriendOrCircle: function() {
    this.setData({
      openShare: true
    });
  },
  onSharePopupClose: function() {
    this.setData({
      openShare: false
    });
  },
  goLive: function(){
    wx.navigateTo({
      url: "plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=" + this.data.live.roomid
    });
  },
  onPosterClose: function(){
    this.setData({ posterPopupShow: false });
  },
  syncLiveStatus: function() {
    var room = this.data.live
    if(room == null){
      return
    }
    let that = this

    let livePlayer = requirePlugin('live-player-plugin') // 引入获取直播状态接口
    // 首次获取立马返回直播状态，往后间隔1分钟或更慢的频率去轮询获取直播状态
    livePlayer.getLiveStatus({ room_id: room.roomid })
    .then(res => {
      // 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常, 107：已过期 
      const liveStatus = res.liveStatus
      if(liveStatus != 0 && room.liveStatus != liveStatus){
        let live = that.data.live
        live.liveStatus = liveStatus
        that.setData({
          live: live
        })

        util.request(api.LiveRoomStatusUpdate, {
          id: room.id,
          roomid: room.roomid,
          liveStatus: liveStatus
        }, "POST")
        .then(function(res) {
        });
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  onReady: function() {
    // 页面渲染完成
  }
})