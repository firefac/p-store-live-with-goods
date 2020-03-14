var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();

Page({
  data: {
    bannerInfo: {
      'imgUrl': 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png',
      'name': '大家都在买的'
    },
    categoryFilter: false,
    filterCategory: [],
    goodsList: [],
    categoryId: 0,
    currentSortType: 'default',
    currentSort: 'create_time',
    currentSortOrder: 'desc',
    pageNum: 1,
    pageSize: 10,
    lastPage: false
  },
  getCategoryList: function() {
    var that = this;

    util.request(api.GoodsFilter, {
        isHot: 1
      })
      .then(function(res) {
        if (res.errcode === '0') {
          that.setData({
            filterCategory: res.data.filterCategoryList,
          });
        }
      });
  },
  getGoodsList: function() {
    var that = this;

    util.request(api.GoodsList, {
        isHot: 1,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        order: that.data.currentSortOrder,
        sort: that.data.currentSort,
        categoryId: that.data.categoryId
      }, "POST")
      .then(function(res) {
        if (res.errcode === '0') {
          that.setData({
            goodsList: that.data.goodsList.concat(res.data.list)
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
      this.getGoodsList();
    }
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getGoodsList();
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
  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'categoryFilter':
        this.setData({
          categoryFilter: !this.data.categoryFilter,
          currentSortType: 'category',
          currentSort: 'create_time',
          currentSortOrder: 'desc',
          goodsList: [],
          pageNum: 1,
          pageSize: 10,
          lastPage: false
        });
        break;
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          currentSortType: 'price',
          currentSort: 'retail_price',
          currentSortOrder: tmpSortOrder,
          categoryFilter: false,
          goodsList: [],
          pageNum: 1,
          pageSize: 10,
          lastPage: false
        });

        this.getGoodsList();
        break;
      default:
        //综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'create_time',
          currentSortOrder: 'desc',
          categoryFilter: false,
          categoryId: 0,
          goodsList: [],
          pageNum: 1,
          pageSize: 10,
          lastPage: false
        });
        this.getGoodsList();
    }
  },
  selectCategory: function(event) {
    let currentIndex = event.target.dataset.categoryIndex;
    this.setData({
      'categoryFilter': false,
      'categoryId': this.data.filterCategory[currentIndex].id
    });
    this.getGoodsList();
  }
})