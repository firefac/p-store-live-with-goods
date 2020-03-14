var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()
Page({
  data: {
    topicList: [],
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getTopic();
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
  },
  getTopic: function() {

    let that = this;
    // 页面渲染完成
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 2000
    });

    util.request(api.TopicList, {
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize
    }, "POST").then(function(res) {
      if (res.errcode === '0') {

        that.setData({
          topicList: that.data.topicList.concat(res.data.list),
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
      wx.hideToast();
    });

  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多主题了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getTopic();
    }
  }
})