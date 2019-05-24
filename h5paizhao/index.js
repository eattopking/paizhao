import React, { Component } from 'react';
import { base } from 'src';

const { NCButton, NCSelect } = base;
const Option = NCSelect.NCOption;

export default class GaoPaiYi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoPlaying: false,
      mediaStreamTrack: null,
      childrens: [],
      selectValue: '',
      file: null,
      allImages: []
    };
  }

  componentDidMount() {
    navigator.mediaDevices.enumerateDevices().then(mediaDevices => this.gotDevices(mediaDevices));
  }

  //获取驱动
  gotDevices(mediaDevices) {
    let count = 1;
    var childrens = [];
    var defaultSelectValue = '';
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        var value = mediaDevice.deviceId;
        defaultSelectValue == '' && (defaultSelectValue = mediaDevice.deviceId);
        var label = mediaDevice.label || `Camera ${count++}`;
        childrens.push(<Option key={value}>{label}</Option>);
      }
    });
    this.setState({
      selectValue: defaultSelectValue,
      childrens
    });
  }

  //显示摄像头
  showVideo = () => {
    let _this = this;
    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        // 首先，如果有getUserMedia的话，就获得它
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // 否则，为老的navigator.getUserMedia方法包裹一个Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    const videoConstraints = {};
    if (this.state.selectValue === '') {
      videoConstraints.facingMode = 'environment';
    } else {
      videoConstraints.deviceId = { exact: this.state.selectValue };
    }
    const constraints = {
      video: videoConstraints,
      audio: false
    };

    const v = document.getElementById('v');
    let promise = navigator.mediaDevices.getUserMedia(constraints);

    promise
      .then(stream => {
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in v) {
          v.srcObject = stream;
        } else {
          // 防止再新的浏览器里使用它，应为它已经不再支持了
          v.src = window.URL.createObjectURL(stream);
        }
        v.onloadedmetadata = function(e) {
          v.play();
          _this.setState({
            videoPlaying: true,
            mediaStreamTrack: stream
          });
        };
      })
      .catch(err => {
        console.error(err.name + ': ' + err.message);
      });
  };

  /**
   * 拍照
   */
  takeOnclick = () => {
    if (this.state.videoPlaying) {
      const v = document.getElementById('v');
      const canvas = document.getElementById('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      canvas.getContext('2d').drawImage(v, 0, 0);
      const data = canvas.toDataURL('image/png');
      this.state.allImages.push(data);
      const file = this.dataURLtoFile(data, '1001A41000000000ELID.jpg');

      this.setState({
        file,
        allImages: this.state.allImages
      });
    }
  };

  dataURLToBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * 将url转换为file
   */
  dataURLtoFile = (dataurl, filename) => {
    //将base64转换为文件
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: 'image/png' });
  };

  /**
   * 关闭摄像头
   */

  stopOnclick = () => {
    this.state.mediaStreamTrack.getTracks()[0].stop();
  };

  // 下拉框改变事件
  handleSelectChange = value => {
    let _this = this;
    _this.setState({
      selectValue: value
    });
  };

  /**
   * 组装数据
   */
  formSubmit = () => {
    let billId = 'printimage';
    let fullPath = billId;
    const up_data = {
      billId,
      fullPath
    };
    const file = this.state.file;

    const options = {
      action: '/nccloud/platform/attachment/upload.do',
      filename: 'file',
      file,
      data: up_data,
      withCredentials: false,
      onProgress: event => {
        //this.makeInfo(info, file, event, undefined, fileList, fileListMap);
      },
      onSuccess: response => {
        //this.makeInfo(info, file, undefined, response, fileList, fileListMap);
      }
    };
    // 开始上传
    const againUploadProgress = (e, progress) => {};
    const res = this.request(options, againUploadProgress);
  };

  /**
   * 发送http请求，提交form
   */
  request = (option, againUploadProgress) => {
    const xhr = new XMLHttpRequest();
    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
          againUploadProgress(e, e.percent);
        }

        option.onProgress(e);
      };
    }

    const formData = new FormData();

    if (option.data) {
      Object.keys(option.data).map(key => {
        formData.append(key, option.data[key]);
      });
    }

    formData.append(option.filename, option.file);

    xhr.onerror = function error(e) {
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(option, xhr), _this.getBody(xhr));
      }
      option.onSuccess(_this.getBody(xhr));
    };

    xhr.open('post', option.action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    const headers = option.headers || {};

    if (headers['X-Requested-With'] !== null) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    for (const h in headers) {
      if (headers.hasOwnProperty(h) && headers[h] !== null) {
        xhr.setRequestHeader(h, headers[h]);
      }
    }
    xhr.send(formData);

    return {
      abort() {
        xhr.abort();
      }
    };
  };

  // 获取相应体
  getBody = xhr => {
    const text = xhr.responseText || xhr.response;
    let response;

    if (!text) {
      response = text;
    }
    try {
      response = JSON.parse(text);
    } catch (e) {
      response = text;
    }
    return response;
  };

  render() {
    return (
      <div>
        <div style={{display: 'flex'}}>
          <NCButton id="open" onClick={this.showVideo}>
            打开摄像头
          </NCButton>
          <NCButton id="take" onClick={this.takeOnclick}>
            拍照
          </NCButton>
          <NCButton id="stop" onClick={this.stopOnclick}>
            关闭
          </NCButton>
          <NCButton id="stop" onClick={this.formSubmit}>
            上传
          </NCButton>
          <NCSelect
            style={{ width: '100px' }}
            searchPlaceholder="选择摄像头"
            value={this.state.selectValue}
            multiple={false}
            onChange={this.handleSelectChange}
          >
            {this.state.childrens}
          </NCSelect>
        </div>
        <video id="v" width="400" height="248px" />
        <div style={{ width: '400px', height: '248px', overflowX: 'auto', display: 'inline-block' }}>
          <div style={{ width: `${this.state.allImages.length * 400}px` }}>
            {this.state.allImages.map(src => {
              return (
                <div style={{ display: 'inline-block' }}>
                  <img style={{ width: '400px', height: '248px' }} id="img" src={src} />
                </div>
              );
            })}
          </div>
        </div>
        <canvas id="canvas" style={{ display: 'none' }} />
      </div>
    );
  }
}
