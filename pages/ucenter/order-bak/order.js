var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();

Page({
  data: {
    active: 0,
    orderList: [],
    grouponOrderList: [],
    showType: 0,
    promotionType: 0,
    pageNum: 1,
    pageSize: 10,
    lastPage: true,
    loading: true,
    grouponPageNum: 1,
    grouponPageSize: 10,
    grouponLastPage: true
  },
  onLoad: function(options) {

    //获取用户的登录信息
    if (!app.globalData.hasLogin) {      
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
      return
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.resetData()
    this.getOrderList()
    this.getGrouponOrderList()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  resetData:function(){
    this.setData({
      orderList: [],
      grouponOrderList: [],
      pageNum: 1,
      pageSize: 10,
      lastPage: false,
      grouponPageNum: 1,
      grouponPageSize: 10,
      grouponLastPage: true
    })
  },
  getOrderList() {

    let that = this;
    util.request(api.OrderList, {
      showType: that.data.showType,
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize,
      promotionType: 0
    }, "POST").then(function(res) {
      if (res.errcode === '0') {
        console.log(res.data);
        that.setData({
          orderList: that.data.orderList.concat(res.data.list)
        });

        if(res.data.list.length < that.data.pageSize){
          that.data.lastPage = true
        }
      }
    });
  },
  getGrouponOrderList() {

    let that = this;
    util.request(api.OrderList, {
      showType: 0,
      pageNum: that.data.grouponPageNum,
      pageSize: that.data.grouponPageSize,
      promotionType: 1
    }, "POST").then(function(res) {
      if (res.errcode === '0') {
        console.log(res.data);
        that.setData({
          grouponOrderList: that.data.grouponOrderList.concat(res.data.list)
        });

        if(res.data.list.length < that.data.grouponPageSize){
          that.data.grouponLastPage = true
        }
      }
    });
  },
  onReachBottom() {
    if(this.data.promotionType == 0){
      if(this.data.lastPage){
        wx.showToast({
          title: '没有更多订单了',
          icon: 'none',
          duration: 2000
        });
        return false;
      }else{
        this.setData({
          pageNum: this.data.pageNum + 1
        });
        this.getOrderList();
      }
    }else if(this.data.promotionType == 1){
      if(this.data.grouponLastPage){
        wx.showToast({
          title: '没有更多拼团订单了',
          icon: 'none',
          duration: 2000
        });
        return false;
      }else{
        this.setData({
          grouponPageNum: this.data.grouponPageNum + 1
        });
        this.getGrouponOrderList();
      }
    }
    
  },
  shareGroupon: function(event) {
    let orderId = event.currentTarget.dataset.orderId;

    wx.navigateTo({
      url: "/pages/groupon/patchGrouponShare/patchGrouponShare?orderId=" + orderId
    });
  },
  reBuy: function(event){
    let order = event.currentTarget.dataset.order;

    wx.navigateTo({
      url: "/pages/goods/goods?id=" + order.goodsList[0].goodsId + "&patchGrouponId=" + order.patchGrouponId
    });
  },
  onChange(event) {
    var tabindex = event.detail.name

    if(tabindex == 0){
      this.setData({
        promotionType: 0
      });
    }else if(tabindex == 1){
      this.setData({
        promotionType: 1
      });
    }

  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    this.resetData()
    this.getOrderList()
    this.getGrouponOrderList()
    // 页面显示
    /*if(app.globalData.hasLogin && this.data.orderList.length == 0){
      this.resetData()
      this.getOrderList()
      this.getGrouponOrderList()
    }*/
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})