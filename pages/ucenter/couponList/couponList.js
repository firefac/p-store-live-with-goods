var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    couponList: [],
    code: '',
    status: 0,
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCouponList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getCouponList: function() {
    let that = this;
    util.request(api.CouponMyList, {
      status: that.data.status,
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize
    }, "POST").then(function(res) {
      if (res.errcode === '0') {

        that.setData({
          couponList: that.data.couponList.concat(res.data.list)
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
    });

  },
  onReachBottom() {
    if(this.data.lastPage){
      wx.showToast({
        title: '没有更多优惠券了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getCouponList();
    }
  },
  bindExchange: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  clearExchange: function () {
    this.setData({
      code: ''
    });
  },
  goExchange: function() {
    if (this.data.code.length === 0) {
      util.showErrorToast("请输入兑换码");
      return;
    }

    let that = this;
    util.request(api.CouponExchange, {
      code: that.data.code
    }, 'POST').then(function (res) {
      if (res.errcode === '0') {
        that.getCouponList();
        that.clearExchange();
        wx.showToast({
          title: "领取成功",
          duration: 2000
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    });
  },
  switchTab: function(e) {

    this.setData({
      couponList: [],
      status: e.currentTarget.dataset.index,
      pageNum: 1,
      pageSize: 10,
      lastPage: false
    });

    this.getCouponList();
  },
})