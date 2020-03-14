var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    //type: 0,
    collectList: [],
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },
  getCollectList() {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.CollectList, {
      //type: that.data.type,
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize
    }, 'POST').then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          collectList: that.data.collectList.concat(res.data.list)
        });
        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
      wx.hideLoading();
    });
  },
  onLoad: function(options) {
    this.getCollectList();
  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多用户收藏了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getCollectList();
    }
  },
  onReady: function() {

  },
  onShow: function() {

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  openGoods(event) {

    let that = this;
    let index = event.currentTarget.dataset.index;
    let goodsId = this.data.collectList[index].valueId;

    //触摸时间距离页面打开的毫秒数  
    var touchTime = that.data.touchEnd - that.data.touchStart;
    console.log(touchTime);
    //如果按下时间大于350为长按  
    if (touchTime > 350) {
      wx.showModal({
        title: '',
        content: '确定删除吗？',
        success: function(res) {
          if (res.confirm) {

            util.request(api.CollectAddOrDelete, {
              //type: that.data.type,
              valueId: goodsId
            }, 'POST').then(function(res) {
              if (res.errcode === '0') {
                console.log(res.data);
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                that.data.collectList.splice(index, 1)
                that.setData({
                  collectList: that.data.collectList
                });
              }
            });
          }
        }
      })
    } else {

      wx.navigateTo({
        url: '/pages/goods/goods?id=' + goodsId,
      });
    }
  },
  //按下事件开始  
  touchStart: function(e) {
    let that = this;
    that.setData({
      touchStart: e.timeStamp
    })
  },
  //按下事件结束  
  touchEnd: function(e) {
    let that = this;
    that.setData({
      touchEnd: e.timeStamp
    })
  },
})