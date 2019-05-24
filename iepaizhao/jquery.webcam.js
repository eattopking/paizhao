/**
 * @license jQuery webcam plugin v1.0.0 09/12/2010
 * http://www.xarg.org/project/jquery-webcam-plugin/
 *
 * Copyright (c) 2010, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/

export default function($) {
  let _register;
  let webcam = {
    extern: null, // external select token to support jQuery dialogs
    append: true, // append object instead of overwriting

    width: 320,
    height: 240,

    mode: 'callback', // callback | save | stream

    swffile: 'jscam.swf',
    quality: 85,

    debug() {},
    onCapture() {},
    onTick() {},
    onSave() {},
    onLoad() {}
  };

  window['webcam'] = webcam;

  $['fn']['webcam'] = function(options) {
    if (typeof options === 'object') {
      for (var ndx in webcam) {
        if (options[ndx] !== undefined) {
          webcam[ndx] = options[ndx];
        }
      }
    }

    let source =
      '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' +
      webcam['swffile'] +
      '" width="' +
      webcam['width'] +
      '" height="' +
      webcam['height'] +
      '"><param name="movie" value="' +
      webcam['swffile'] +
      '" /><param name="FlashVars" value="mode=' +
      webcam['mode'] +
      '&amp;quality=' +
      webcam['quality'] +
      '" /><param name="allowScriptAccess" value="always" /></object>';

    if (webcam['extern'] !== null) {
      $(webcam['extern'])[webcam['append'] ? 'append' : 'html'](source);
    } else {
      this[webcam['append'] ? 'append' : 'html'](source);
    }
    let run = 3;
    (_register = function() {
      var cam = document.getElementById('XwebcamXobjectX');
      if (cam && cam['capture'] !== undefined) {
        /* Simple callback methods are not allowed :-/ */
        webcam['capture'] = function(x) {
          try {
            return cam['capture'](x);
          } catch (e) {}
        };
        webcam['save'] = function(x) {
          try {
            return cam['save'](x);
          } catch (e) {}
        };
        webcam['setCamera'] = function(x) {
          try {
            return cam['setCamera'](x);
          } catch (e) {}
        };
        webcam['getCameraList'] = function() {
          try {
            return cam['getCameraList']();
          } catch (e) {}
        };
        webcam['pauseCamera'] = function() {
          try {
            return cam['pauseCamera']();
          } catch (e) {}
        };
        webcam['resumeCamera'] = function() {
          try {
            return cam['resumeCamera']();
          } catch (e) {}
        };
        webcam['onLoad']();
      } else if (run == 0) {
        webcam['debug']('error', 'Flash movie not yet registered!');
      } else {
        /* Flash interface not ready yet */
        run--;
        window.setTimeout(_register, 1000 * (4 - run));
      }
    })();
  };
}
