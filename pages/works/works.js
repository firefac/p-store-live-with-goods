var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    id: 0,
    works: {}
  },
  onShareAppMessage: function(res) {
    var works = this.data.works
    var title = ''
    var imageUrl = ''
    if(works.type == 1 || works.type == 2){
      title = works.content
      imageUrl = works.imageList[0]
    }else if(works.type == 3 || works.type == 4){
      title = works.title
      imageUrl = works.coverUrl
    }

    return {
      title: title,
      imageUrl: imageUrl,
      path: '/pages/works/works?id=' + works.id
    }
  },
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: parseInt(options.id)
      });
      this.getworksInfo();
    }
  },
  // 获取商品信息
  getworksInfo: function() {
    let that = this;
    util.request(api.SnsWorksDetail, {
      id: that.data.id
    }, "POST").then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          works: res.data
        });

        if(res.data.type === 3){
          WxParse.wxParse('detail', 'html', res.data.longContent, that);
        }
      }
    });
  },
  upAction(e) {
    var actiontype = e.target.dataset.type;
    var works = e.target.dataset.works;

    var that = this;

    util.request(api.SnsUpAction, {
        type: 2,
        refId: works.id,
        upActionType: actiontype
      }, "POST")
      .then(function(res) {
        if (res.errcode === '0') {
          let userInfo = wx.getStorageSync('userInfo');

          // 点赞处理
          if(actiontype == 1){
            works.uped = 1
            works.upCt = works.upCt + 1

            userInfo.avatar = userInfo.avatarUrl
            userInfo.userId = userInfo.id
            works.upVos.unshift(userInfo)
          }else if(actiontype == 2){
            // 取消点赞处理
            works.uped = 0
            works.upCt = works.upCt - 1

            var upVOs = works.upVos
            for(var j = 0; j < upVOs.length; j++){
              if(upVOs[j].userId == userInfo.id){
                works.upVos.splice(j, 1)
                break
              }
            }
          }
          
          that.setData({
            works: works
          });
        }
      });
  },
 
  onShow: function() {
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  onReady: function() {
    // 页面渲染完成
  },
  // 图片点击事件
  imgTap(e) {
    var nowImgUrl = e.target.dataset.src;
    var tagFrom = e.target.dataset.from;
    if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
      wx.previewImage({
        current: nowImgUrl, // 当前显示图片的http链接
        urls: tagFrom // 需要预览的图片http链接列表
      })
    }
  },
  linkToHashtag:function(event){
    var hashtag = event.target.dataset.hashtag
    var naviUrl = '/pages/worksList-tag/worksList?hashtagId=' + hashtag.id + '&hashtagName=' + hashtag.name

    if(hashtag != null){
      wx.navigateTo({
        url: naviUrl
      });
    }
  }

})