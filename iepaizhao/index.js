import React, { Component } from 'react';
import { base } from 'src';
import $ from 'jquery';
import addWebcam from './jquery.webcam';

import swf from './jscam_canvas_only.swf';

const { NCButton, NCSelect } = base;
console.log('swf', swf);

export default class GaoPaiYi extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    addWebcam($);
  }

  componentDidMount() {
    var w = 320,
      h = 240; //摄像头配置,创建canvas
    var pos = 0,
      ctx = null,
      saveCB,
      image = [];
    const v = document.getElementById('v');
    var canvas = document.createElement('canvas');
    $('body').append(canvas);
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    ctx = canvas.getContext('2d');
    image = ctx.getImageData(0, 0, w, h);

    $('#webcam').webcam({
      width: w,
      height: h,
      mode: 'callback', //stream,save，回调模式,流模式和保存模式
      swffile: swf,
      onTick(remain) {
        if (remain == 0) {
          $('#status').text('拍照成功!');
        } else {
          $('#status').text('倒计时' + remain + '秒钟...');
        }
      },
      onSave(data) {
        //保存图像
        var col = data.split(';');
        var img = image;
        for (var i = 0; i < w; i++) {
          var tmp = parseInt(col[i]);
          img.data[pos + 0] = (tmp >> 16) & 0xff;
          img.data[pos + 1] = (tmp >> 8) & 0xff;
          img.data[pos + 2] = tmp & 0xff;
          img.data[pos + 3] = 0xff;
          pos += 4;
        }
        console.log('img', img);
        console.log('col', col);
        if (pos >= 4 * w * h) {
          ctx.putImageData(img, 0, 0); //转换图像数据，渲染canvas
          pos = 0;
          let Imagedata = canvas.toDataURL().substring(22); //上传给后台的图片数据
          console.log('Imagedata', Imagedata);
        }
      },
      onCapture() {
        console.log('onCapture');
        //捕获图像
        webcam.save();
      },
      debug(type, string) {
        //控制台信息
        //console.log(type + ": " + string);
      },
      onLoad() {
        //flash 加载完毕执行
        //console.log('加载完毕！')
      }
    });
  }

  paizhao() {
    $('.play').click(function() {
      webcam.capture();
    });
  }

  create() {
    return (
      <div>
        <NCButton className="play" onClick={this.paizhao}>
          拍照
        </NCButton>
        <div id="status">倒计时</div>
        <div id="webcam" />
      </div>
    );
  }

  render() {
    return <div>{this.create()}</div>;
  }
}
