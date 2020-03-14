var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    issueList: [],
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIssue();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多帮助了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getIssue();
    }
  },
  getIssue: function () {
    
    wx.showLoading({
      title: '加载中...',
    });

    let that = this;
    util.request(api.IssueList, {
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize
    }, "POST").then(function (res) {
      if (res.errcode === '0') {
        that.setData({
          issueList: res.data.list,
          showPage: true,
          count: res.data.total
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
      wx.hideLoading();
    });

  },
  prevPage: function (event) {
    if (this.data.page <= 1) {
      return false;
    }

    var that = this;
    that.setData({
      pageNum: that.data.page - 1
    });
    this.getIssue();
  }
})