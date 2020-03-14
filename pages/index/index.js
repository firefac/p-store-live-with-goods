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
    hotGoodsWithAd:[],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    goodsCount: 0,
    announcements: [],

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
    coupons: [],
    images:[]
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  // 页面分享
  onShareAppMessage: function() {
    let that = this;
    return {
      title: "费尔工坊拼团小程序",
      path: '/pages/index/index'
    }
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
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.resetData()
    this.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  resetData: function () {    
    this.setData({
      newGoods: [],
      hotGoods: [],
      hotGoodsWithAd:[],
      brands: [],
      announcements: [],
      banner: [],
      coupon: [],
      goods: [],
      pageNum: 1,
      pageSize: 10,
      lastPage: false
    })
  },
  onLoad: function () {
    this.getIndexData();
    this.getCategoryInfo()
  },
  getIndexData: function() {
    let that = this;
    util.request(api.IndexUrl).then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          hotGoodsWithAd: res.data.hotGoodsWithAd,
          brands: res.data.brandList,
          announcements: res.data.announcements,
          banner: res.data.banner,
          coupon: res.data.couponList
        });
      }
    });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data
      });
    });
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
  imageLoad: function(e) {
    var $width=e.detail.width,  //获取图片真实宽度
      $height=e.detail.height,
      ratio=$width/$height;  //图片的真实宽高比例
    var viewWidth=718,      //设置图片显示宽度，左右留有16rpx边距
      viewHeight=718/ratio;  //计算的高度值
    var image=this.data.images; 
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index]={
      width:viewWidth,
      height:viewHeight
    }
    this.setData({
       images:image
    })
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
            goods: that.data.goods.concat(res.data.list),
            pageNum: that.data.pageNum + 1
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
        if(res.data.list.length > 0){
          that.setData({
            coupons: res.data.list,
            hasNoCoupons: false
          });
        }

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
  openCartPage: function() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },
  tapBanner: function(e) {
    var ad = e.currentTarget.dataset.ad

    if(ad.linkType == 0){
      return
    }

    if(ad.linkType == 1 && ad.link != ''){
      wx.navigateTo({
        url: ad.link
      })
    }

    if (ad.linkType == 2 && ad.thirdAppid != '' && ad.thirdLink != '') {
      wx.navigateToMiniProgram({
        appId: ad.thirdAppid,
        path: ad.thirdLink,
        success(res) {
          // 打开成功
        }
      })
    }
  },
  tapHotGoodsAd: function(e) {
    var ad = e.currentTarget.dataset.ad

    if(ad.adLinkType == 0){
      return
    }

    if(ad.adLinkType == 1 && ad.adLink != ''){
      wx.navigateTo({
        url: ad.adLink
      })
    }

    if (ad.adLinkType == 2 && ad.adThirdAppid != '' && ad.adThirdLink != '') {
      wx.navigateToMiniProgram({
        appId: ad.adThirdAppid,
        path: ad.adThirdLink,
        success(res) {
          // 打开成功
        }
      })
    }
  },
  jumpToMp: function(e){
    if (e.currentTarget.dataset.link != '') {
      wx.navigateToMiniProgram({
        appId: "wx283419ee2df7ee01",
        path: e.currentTarget.dataset.link,
        success(res) {
          // 打开成功
        }
      })
    }
  },
})
