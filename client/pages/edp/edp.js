// pages/edp/edp.js
var devices = []
var pageObject;
//选择连接的BLE设备ID
var selectedBLEId = ''
var command = new ArrayBuffer(5);


//发送数据
function sendMsg(buffer,onSuccess){
  wx.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: selectedBLEId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: '0000fff0-0000-1000-8000-00805f9b34fb',
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: '0000fff4-0000-1000-8000-00805f9b34fb',
    // 这里的value是ArrayBuffer类型
    value: buffer,
    success: function (res) {
      console.log('writeBLECharacteristicValue success', res.errMsg)
      onSuccess()
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus: false,
    dev_status: '未连接',
    devConnected: false,

    device_array: [],
    frequency_array: ["5次/分钟", "6次/分钟", "7次/分钟", "8次/分钟", "9次/分钟", "10次/分钟", "11次/分钟", "12次/分钟", "13次/分钟", "14次/分钟", "15次/分钟"],
    frequency_index: 0,

    time_array: ['5分钟','10分钟','15分钟','20分钟','25分钟','30分钟'],
    time_index: 5,

    mc_array: ["30赫兹", "35赫兹", "40赫兹", "45赫兹", "50赫兹"],
    mc_index: 2,

    strength_array: ["30单位", "29单位", "28单位", "27单位", "26单位", "25单位", "24单位", "23单位", "22单位", "21单位", "20单位", "19单位", "18单位", "17单位", "16单位", "15单位", "14单位", "13单位", "12单位", "11单位", "10单位", "9单位", "8单位", "7单位", "6单位", "5单位", "4单位", "3单位", "2单位", "1单位", "0单位"],
    strength_index: 25,

    aa: 'img/aa.png'
  },

  frequencyChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let dataView = new DataView(command)
    dataView.setUint8(0, 3)
    dataView.setUint8(2, 5 + e.detail.value)

    sendMsg(command, function(){
      console.log('e.detail.value--------->' + e.detail.value)
      pageObject.setData({
        frequency_index: e.detail.value
      })
    })
    
  },

  //设定时间
  timeChange: function(e){
    let dataView = new DataView(command)
    dataView.setUint8(0, 3)
    dataView.setUint8(1, 1 + e.detail.value)

    sendMsg(command,function(){
      pageObject.setData({
        time_index: e.detail.value
      })
    })
    
  },

  mcChange: function (e) {
    let dataView = new DataView(command)
    dataView.setUint8(0, 3)
    dataView.setUint8(3, 1 + e.detail.value)

    sendMsg(command, function () {
      pageObject.setData({
        mc_index: e.detail.value
      })
    })

  },

  strengthChange: function(e){
    let dataView = new DataView(command)
    dataView.setUint8(0, 3)
    dataView.setUint8(4, 30 - e.detail.value)

    sendMsg(command, function () {
      pageObject.setData({
        strength_index: e.detail.value
      })
    })

  },

  //开机函数
  turnOn: function(e){
    let dataView = new DataView(command)
    //开机
    dataView.setUint8(0, 1)
    sendMsg(command, function () {
      console.log('开机成功')
    })
  },

  turnOff: function (e) {
    let dataView = new DataView(command)
    
    dataView.setUint8(0, 2)
    sendMsg(command, function () {
      console.log('关机成功')
    })
  },

  search_device: function (e) {
    wx.getBluetoothAdapterState({
      success: function (res) {
        if (!res.available) {
          //藍牙沒打開，或者不可用
          wx.showToast({
            title: '蓝牙未打开',
            icon: 'fail',
            duration: 2000
          })
        } else {
          console.log('打开搜索设备框')
          var currentStatu = e.currentTarget.dataset.statu
          pageObject.util(currentStatu)
        }
      },
    })

  },

  close_search_dialog: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },

  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      )



      //搜索蓝牙设备
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log('搜索蓝牙设备成功--->' + res.errMsg)
          //清空设备列表
          devices = []
        },
      })

      wx.onBluetoothDeviceFound(function (res) {
        console.log('new device list has founded')
        console.dir(res)
        // console.log(ab2hex(res[0].advertisData))
        for (var i in res.devices) {
          var device = res.devices[i]
          console.log('device--->' + device.name)
          devices.push(device)
        }
        pageObject.setData({
          device_array: devices
        })

      })



      //超过5s停止搜索
      setTimeout(function () {
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log('已超过10S停止搜索蓝牙设备成功--->' + res)
          },
        })
      }.bind(this), 10 * 1000)


    }

  },

  connectDevice: function (e) {
    selectedBLEId = e.currentTarget.dataset.id;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log('已选择BLE，停止搜索成功----->'+res)
      },
    })
    // 根据device id连接蓝牙设备
    wx.createBLEConnection({
      deviceId: selectedBLEId,
      success: function (res) {
        //关闭搜索对话框
        pageObject.util("close")
      },
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    pageObject = this;
    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res)

      },
      fail: function (res) {
        console.log(res)
      },

      complete: function (res) {
        console.log(res)
        //监听蓝牙状态变化
        wx.onBluetoothAdapterStateChange(function (res) {
          //
          if (res.available) {
            //蓝牙打开了

          } else {
            //蓝牙被关闭了
            if(selectedBLEId != ''){
              wx.closeBLEConnection({
                deviceId: selectedBLEId,
                success: function (res) { },
              })
            }
            
          }

        })

        //监听BLE连接状态
        wx.onBLEConnectionStateChange(function (res) {
          console.log("ble connected--->" + res.connected)
          if (res.connected) {
            pageObject.setData({
              dev_status: '已连接：' + res.deviceId,
              devConnected: true
            })

            wx.getBLEDeviceServices({
              deviceId: res.deviceId,
              success: function(res) {

                wx.getBLEDeviceCharacteristics({
                  deviceId: res.deviceId,
                  serviceId: '0000fff0-0000-1000-8000-00805f9b34fb',
                  success: function(res) {
                    // 到这里后可以进行数据读写操作了
                    
                  },
                })
              },
            })

            


          } else {
            
            pageObject.setData({
              dev_status: '未连接',
              devConnected: false
            })

            // 重新连接
            if (selectedBLEId != '') {
              wx.closeBLEConnection({
                deviceId: selectedBLEId,
                success: function (res) { },
              })

              wx.createBLEConnection({
                deviceId: selectedBLEId,
                success: function (res) { 

                },
              })
            }

          }
        })
      },

    })
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
    console.log('page onUnload...')
    //关闭BLE连接
    if(selectedBLEId != ''){
      wx.closeBLEConnection({
        deviceId: selectedBLEId,
        success: function (res) {
          console.log(res)
          console.log('关闭连接至---->'+selectedBLEId)
          selectedBLEId = ''
        },
      })

    }
    

    //关闭蓝牙适配器
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log('成功关闭蓝牙适配器---->' + res)
      },

      fail: function (res) {
        console.log(res)
      },

      complete: function (res) {
        console.log(res)
      }
    })

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

  }
})