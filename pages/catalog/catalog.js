//index.js
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    goodsCount: 0,

    pageNum: 1,
    pageSize: 10,
    lastPage: false,

    loadingHidden: false , // loading
    userInfo: {},
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    scrollTop:"0",
    loadingMoreHidden:true,

    hasNoCoupons:true,
    coupons: []
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id,
      pageNum: 1,
      goods:[],
      lastPage: false,
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function () {    
    this.getCategoryInfo()
  },
  getCategoryInfo: function() {
    let that = this;
    util.request(api.GoodsCategory, {
        code: "live"
      })
      .then(function(res) {
        if (res.errcode == "0") {
          var parent = res.data.parentCategory
          var categories = [{id:parent.id, name:"全部"}];
          that.setData({
            categories: categories.concat(res.data.brotherCategory),
            activeCategoryId: parent.id
          });
          that.getGoodsList(parent.id);

        } else {
          //显示错误信息
        }

      });
  },
  getGoodsList: function(category) {
    var that = this;

    util.request(api.GoodsList, {
        categoryId: category,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize
      }, "POST")
      .then(function(res) {
        if (res.errcode === '0') {
          that.setData({
            goods: that.data.goods.concat(res.data.list)
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
        title: '没有更多商品了',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else{
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getGoodsList(this.data.activeCategoryId);
    }
  },
  getCouponList: function () {

    let that = this;

    util.request(api.CouponList, {
      pageNum: 1,
      pageSize: 5
    }, "POST").then(function (res) {
      if (res.errcode === '0') {
        that.setData({
          coupons: that.data.coupons.concat(res.data.list),
          hasNoCoupons: false
        });
      }
    });

  },
  getCoupon(e) {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }

    let couponId = e.currentTarget.dataset.index
    util.request(api.CouponReceive, {
      couponId: couponId
    }, 'POST').then(res => {
      if (res.errcode === '0') {
        wx.showToast({
          title: "领取成功"
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    })
  },
  getBannerList: function() {
    let that = this;
    util.request(api.IndexBanner)
    .then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          banner: res.data
        })
      }
    });
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.link != '') {
      wx.navigateTo({
        url: e.currentTarget.dataset.link
      })
    }
  }
})
