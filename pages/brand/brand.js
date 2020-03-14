var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({
  data: {
    brandList: [],
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getBrandList();
  },
  getBrandList: function() {
    wx.showLoading({
      title: '加载中...',
    });
    let that = this;
    util.request(api.BrandList, {
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize
    }, "POST").then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          brandList: that.data.brandList.concat(res.data.list),
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
      wx.hideLoading();
    });
  },
  onReachBottom() {

    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多商品了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
    }

    this.getBrandList();
  },
  onReady: function() {

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