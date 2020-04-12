var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    rooms:[],
    historyShow: false,
    tabIndex: 0,
    pageNum: 1,
    pageSize: 5,
    lastPage: false,
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
  onLoad: function () {    
    this.getRoomsList();    
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.resetData();
    this.getRoomsList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  resetData: function() {
    this.setData({
      rooms:[],
      pageNum: 1,
      lastPage: false
    })
  },
  getRoomsList: function() {
    let that = this;
    util.request(api.LiveRoomList, {
        sort: "desc",
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }, "POST")
      .then(function(res) {
        if (res.errcode === '0') {

          that.setData({
            rooms: that.data.rooms.concat(res.data.list)
          })

          if(that.data.pageNum == 1){
            that.syncLiveStatus(that.data.rooms[0])
          }

          if(res.data.list.length < that.data.pageSize){
            that.data.lastPage = true
          }
        }
      });
  },
  syncLiveStatus: function(room) {
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
      if(room.liveStatus != liveStatus){
        let rooms = that.data.rooms
        rooms[0].liveStatus = liveStatus
        that.setData({
          rooms: rooms
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
  showHistoryPopup: function(e){
    var room = e.currentTarget.dataset.room

    this.setData({
      historyShow: true,
      liveHistoryRoom: room.liveRoomReplyList[0]
    });
  },
  onClose() {
    this.setData({
      historyShow: false,
      liveHistoryRoom: {}
    });
  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多直播了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getRoomsList();
    }
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})