var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');

Page({
  data: {
    id: 0,
    roomId: 0,
    goods: {},
    groupon: [], //该商品支持的团购规格
    grouponLink: {}, //参与的团购
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    cutdownTimeData: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    patchGrouponId: 0,
    patchGrouponInstId: 0,
    launchedGrouponPreview: [],
    launchedGroupon: [],
    grouponType: 1,
    number: 1,
    popupShow: false,
    checkedSpecText: '请选择规格数量',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    openAttr: false,
    openShare: false,
    joinGrouponAll: false,
    noCollectImage: '/static/images/icon_collect.png',
    hasCollectImage: '/static/images/icon_collect_checked.png',
    collectImage: '/static/images/icon_collect.png',
    shareImage: '',
    isGroupon: false, //标识是否是一个参团购买
    soldout: false,
    posterImage: '',
    posterPopupShow: false,
    canWrite: false, //用户是否获取了保存相册的权限
  },

  // 页面分享
  onShareAppMessage: function() {
    let that = this;
    var shareUrl = this.data.goods.picUrl
    if(this.data.goods.shareUrl != ''){
      shareUrl = this.data.goods.shareUrl
    }

    return {
      title: this.data.goods.name,
      imageUrl: shareUrl,
      path: '/pages/goods/goods?id=' + this.data.id + '&patchGrouponId=' + this.data.patchGrouponId
    }
  },
  handleSetting: function(e) {
      var that = this;
      // console.log(e)
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
              title: '警告',
              content: '不授权无法保存',
              showCancel: false
          })
          that.setData({
              canWrite: false
          })
      } else {
          wx.showToast({
              title: '保存成功'
          })
          that.setData({
              canWrite: true
          })
      }
  },
  handleSetting: function(e) {
      var that = this;
      // console.log(e)
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
              title: '警告',
              content: '不授权无法保存',
              showCancel: false
          })
          that.setData({
              canWrite: false
          })
      } else {
          wx.showToast({
              title: '保存成功'
          })
          that.setData({
              canWrite: true
          })
      }
  },
  // 保存分享图
  saveShare: function() {
    let that = this;
    wx.downloadFile({
      url: that.data.posterImage,
      success: function(res) {
        that.checkSaveAuth()
        if(!that.data.canWrite){
          util.showErrorToast('请检查下载权限是否开启')
          return false
        }
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '存图成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function(res) {
            console.log('fail')
          }
        })
      },
      fail: function(e) {
        util.showErrorToast('图片下载失败')
        console.log(e + 'fail')
      }
    })
  },

  //从分享的团购进入
  getGrouponInfo: function(grouponId) {
    let that = this;
    util.request(api.GroupOnJoin, {
      grouponId: grouponId
    }).then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          grouponLink: res.data.groupon,
          id: res.data.goods.id
        });
        //获取商品详情
        that.getGoodsInfo();
      }
    });
  },

  // 获取商品信息
  getGoodsInfo: function() {
    let that = this;
    util.request(api.GoodsDetail, {
      id: that.data.id,
      patchGrouponId: that.data.patchGrouponId
    }).then(function(res) {
      if (res.errcode === '0') {

        let _specificationList = res.data.specificationList
        // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
        if (_specificationList.length == 1) {
          if (_specificationList[0].valueList.length == 1) {
            _specificationList[0].valueList[0].checked = true

            // 如果仅仅存在一种货品，那么商品价格应该和货品价格一致
            // 这里检测一下
            let _productPrice = res.data.productList[0].price;
            let _goodsPrice = res.data.info.retailPrice;
            if (_productPrice != _goodsPrice) {
              console.error('商品数量价格和货品不一致');
            }

            that.setData({
              checkedSpecText: _specificationList[0].valueList[0].value,
              tmpSpecText: '已选择：' + _specificationList[0].valueList[0].value,
            });
          }
        }

        var launchedGroupon = res.data.launchedGroupon
        var launchedGrouponPreview = []

        for(var i = 0; i < launchedGroupon.length; i++){
          if(i > 1){
            break
          }
          launchedGrouponPreview[i] = launchedGroupon[i]
        }

        that.setData({
          goods: res.data.info,
          attribute: res.data.attribute,
          issueList: res.data.issue,
          comment: res.data.comment,
          brand: res.data.brand,
          specificationList: res.data.specificationList,
          productList: res.data.productList,
          userHasCollect: res.data.userHasCollect,
          shareImage: res.data.shareImage,
          checkedSpecPrice: res.data.info.retailPrice,
          groupon: res.data.groupon,
          launchedGrouponPreview: launchedGrouponPreview,
          launchedGroupon: launchedGroupon
        });

        //如果是通过分享的团购参加团购，则团购项目应该与分享的一致并且不可更改
        if (that.data.isGroupon) {
          let groupons = that.data.groupon;
          for (var i = 0; i < groupons.length; i++) {
            if (groupons[i].id != that.data.grouponLink.rulesId) {
              groupons.splice(i, 1);
            }
          }
          groupons[0].checked = true;
          //重设团购规格
          that.setData({
            groupon: groupons
          });

        }

        if (res.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.hasCollectImage
          });
        } else {
          that.setData({
            collectImage: that.data.noCollectImage
          });
        }

        WxParse.wxParse('goodsDetail', 'html', res.data.info.detail, that);
        //获取推荐商品
        that.getGoodsRelated();

        // 拼团不存在
      } else if (res.errcode === '72001') {
        wx.redirectTo({
          url: "/pages/groupon/patchGrouponException/patchGrouponException"
        })
        return
      }
    });
  },

  // 获取推荐商品
  getGoodsRelated: function() {
    let that = this;
    util.request(api.GoodsRelated, {
      id: that.data.id
    }).then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          relatedGoods: res.data.list,
        });
      }
    });
  },

  // 团购选择
  clickGroupon: function(event) {
    let that = this;

    //参与团购，不可更改选择
    if (that.data.isGroupon) {
      return;
    }

    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    let _grouponList = this.data.groupon;
    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].id == specValueId) {
        if (_grouponList[i].checked) {
          _grouponList[i].checked = false;
        } else {
          _grouponList[i].checked = true;
        }
      } else {
        _grouponList[i].checked = false;
      }
    }

    this.setData({
      groupon: _grouponList,
    });
  },
  joinGroupon: function(event) {
    let inst = event.currentTarget.dataset.inst;

    this.setData({
      patchGrouponInstId: inst.id,
      joinGrouponAll: false,
      openAttr: true
    });
  },

  // 规格选择
  clickSkuValue: function(event) {
    let that = this;
    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      specificationList: _specificationList,
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的团购信息
  getCheckedGrouponValue: function() {
    let checkedValues = {};
    let _grouponList = this.data.groupon;
    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].checked) {
        checkedValues = _grouponList[i];
      }
    }

    return checkedValues;
  },

  //获取选中的规格信息
  getCheckedSpecValue: function() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;
  },

  //判断规格是否选择完整
  isCheckedAllSpec: function() {
    return !this.getCheckedSpecValue().some(function(v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },

  getCheckedSpecKey: function() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      return v.valueText;
    });
    return checkedValue;
  },

  // 规格改变时，重新计算价格及显示信息
  changeSpecInfo: function() {
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function(v) {
      if (v.valueId != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function(v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: checkedValue.join('　')
      });
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量'
      });
    }

    if (this.isCheckedAllSpec()) {
      this.setData({
        checkedSpecText: this.data.tmpSpecText
      });

      // 规格所对应的货品选择以后
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({
          soldout: true
        });
        console.error('规格所对应货品不存在');
        return;
      }

      let checkedProduct = checkedProductArray[0];
      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecPrice: checkedProduct.price,
          soldout: false
        });
      } else {
        this.setData({
          checkedSpecPrice: this.data.goods.retailPrice,
          soldout: true
        });
      }

    } else {
      this.setData({
        checkedSpecText: '请选择规格数量',
        checkedSpecPrice: this.data.goods.retailPrice,
        soldout: false
      });
    }

  },

  // 获取选中的产品（根据规格）
  getCheckedProductItem: function(key) {
    return this.data.productList.filter(function(v) {
      if (v.specifications.toString() == key.toString()) {
        return true;
      } else {
        return false;
      }
    });
  },

  onLoad: function(options) {
    const scene = decodeURIComponent(options.scene)
    if(scene){
      var info_arr = [];
      var params = scene.split('&');

      for(var i = 0; i < params.length; i++){
        var info_arr = params[i].split('=');
        options[info_arr[0]] = info_arr[1]
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.id && options.id != 0) {
      this.setData({
        id: parseInt(options.id)
      });
    }
    
    if (options.room_id && options.room_id != 0) {
      this.setData({
        roomId: parseInt(options.room_id)
      });
    }

    if (options.patchGrouponId && options.patchGrouponId != 0) {
      this.setData({
        patchGrouponId: parseInt(options.patchGrouponId),
        grouponType: 2
      });
    }

    this.getGoodsInfo();

    if (options.grouponId) {
      this.setData({
        isGroupon: true,
      });
      this.getGrouponInfo(options.grouponId);
    }
    this.checkSaveAuth()
  },
  onShow: function() {
    // 页面显示
    var that = this;
    util.request(api.CartGoodsCount).then(function(res) {
      if (res.errcode === '0') {
        that.setData({
          cartGoodsCount: res.data
        });
      }
    });
  },

  //添加或是取消收藏
  addCollectOrNot: function() {
    let that = this;
    util.request(api.CollectAddOrDelete, {
        //type: 0,
        valueId: this.data.id
      }, "POST")
      .then(function(res) {
        if (that.data.userHasCollect == 1) {
          that.setData({
            collectImage: that.data.noCollectImage,
            userHasCollect: 0
          });
        } else {
          that.setData({
            collectImage: that.data.hasCollectImage,
            userHasCollect: 1
          });
        }

      });

  },

  //立即购买（先自动加入购物车）
  addFast: function() {
    var that = this;
    if (this.data.openAttr == false) {
      //打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr
      });
    } else {

      //提示选择完整规格
      if (!this.isCheckedAllSpec()) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '请选择完整规格'
        });
        return false;
      }

      //根据选中的规格，判断是否有对应的sku信息
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        //找不到对应的product信息，提示没有库存
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      let checkedProduct = checkedProductArray[0];
      //验证库存
      if (checkedProduct.number <= 0) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      //验证团购是否有效
      let checkedGroupon = this.getCheckedGrouponValue();

      //立即购买
      util.request(api.CartFastAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: checkedProduct.id
        }, "POST")
        .then(function(res) {
          if (res.errcode == '0') {

            // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
            try {
              wx.setStorageSync('cartId', res.data);
              wx.setStorageSync('grouponRulesId', checkedGroupon.id);
              wx.setStorageSync('grouponLinkId', that.data.grouponLink.id);
              wx.setStorageSync('patchGrouponId', that.data.patchGrouponId);
              wx.setStorageSync('patchGrouponInstId', that.data.patchGrouponInstId);
              wx.navigateTo({
                url: '/pages/checkout/checkout'
              })
            } catch (e) {}

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: res.errmsg,
              mask: true
            });
          }
        });
    }
  },

  //添加到购物车
  addToCart: function() {
    var that = this;
    if (this.data.openAttr == false) {
      //打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr
      });
    } else {

      //提示选择完整规格
      if (!this.isCheckedAllSpec()) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '请选择完整规格'
        });
        return false;
      }

      //根据选中的规格，判断是否有对应的sku信息
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        //找不到对应的product信息，提示没有库存
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      let checkedProduct = checkedProductArray[0];
      //验证库存
      if (checkedProduct.number <= 0) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '没有库存'
        });
        return false;
      }

      //添加到购物车
      util.request(api.CartAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: checkedProduct.id
        }, "POST")
        .then(function(res) {
          let _res = res;
          if (_res.errcode == '0') {
            wx.showToast({
              title: '添加成功'
            });
            that.setData({
              openAttr: !that.data.openAttr,
              cartGoodsCount: _res.data
            });
            if (that.data.userHasCollect == 1) {
              that.setData({
                collectImage: that.data.hasCollectImage
              });
            } else {
              that.setData({
                collectImage: that.data.noCollectImage
              });
            }
          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }

        });
    }

  },
  genSharePoster: function(){
    let that = this;
    var scene = 'id=' + this.data.id
    if(this.data.patchGrouponId != 0){
      scene = scene + '&patchGrouponId=' + this.data.patchGrouponId
    }

    util.request(api.StorageGeneralGoodsPoster, {
      "goodsId": this.data.id,
      "patchGrouponId": this.data.patchGrouponId,
      "scene": scene,
      "page": 'pages/goods/goods'
    }, "POST").then(function (res) {
      if (res.errcode === '0') {
        that.setData({
          openShare: false,
          posterPopupShow: true,
          posterImage: res.data.url
        });
        return false
      }
      util.showErrorToast('生成海报失败')
      that.setData({
        submitLoading: false
      });
    }).catch((err) => {
      util.showErrorToast('生成海报失败')
      that.setData({
        submitLoading: false
      });
    });
  },
  checkSaveAuth: function(){
    let that = this;
    wx.getSetting({
      success: function (res) {
        console.log(res)
        //不存在相册授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: function () {
                    that.setData({
                        canWrite: true
                    })
                },
                fail: function (err) {
                    that.setData({
                        canWrite: false
                    })
                }
            })
        } else {
            that.setData({
                canWrite: true
            });
        }
      }
    })
  },
  onPosterClose: function(){
    this.setData({ posterPopupShow: false });
  },
  cutNumber: function() {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function() {
    this.setData({
      number: this.data.number + 1
    });
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
    if (this.data.roomId && this.data.roomId != 0) {
      wx.navigateTo({
        url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + this.data.roomId
      })
    }
  },
  switchAttrPop: function() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  }, 
  showPopup() {
    this.setData({
      popupShow: true 
    });
  },
  onPopupClose() {
    this.setData({
      popupShow: false
    });
  },
  closeAttr: function() {
    this.setData({
      openAttr: false,
      patchGrouponInstId: 0
    });
  },
  shareFriendOrCircle: function() {
    this.setData({
      openShare: true
    });
  },
  onSharePopupClose: function() {
    this.setData({
      openShare: false
    });
  },
  onJoinGrouponAllOpen: function(){
    this.setData({
      joinGrouponAll: true
    });
  },
  onJoinGrouponAllClose: function(){
    this.setData({
      joinGrouponAll: false
    });
  },
  openCartPage: function() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },
  imgTap: function(e) {
    var nowImgUrl = e.target.dataset.src;
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: [nowImgUrl]
    })
  },
  onReady: function() {
    // 页面渲染完成

  },
  countdownChange(e) {
    this.setData({
      cutdownTimeData: e.detail
    });
  }

})