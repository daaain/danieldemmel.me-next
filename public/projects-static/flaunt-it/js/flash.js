var swfUrl = 'flaunt-it.swf'
var bgColor = '#FFFFFF'
var requiredFlashVersion = 9

var hasFlash = (function () {
  if (navigator.appVersion.indexOf('MSIE') != -1 && navigator.appVersion.indexOf('Windows') != -1) {
    document.write('<script language="VBScript"> \n')
    document.write('on error resume next \n')
    document.write(
      'hasFlash = (IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash." & ' +
        requiredFlashVersion +
        '))) \n',
    )
    document.write('<' + '/script> \n')
    // If executed, the VBScript above checks for Flash and sets the hasFlash variable.
    // If VBScript is not supported it's value will still be undefined, so we'll run it
    // through another test. This will make sure even Opera identified as IE will be
    // tested
    if (window.hasFlash != null) {
      return window.hasFlash
    }
  }
  if (
    navigator.mimeTypes &&
    navigator.mimeTypes['application/x-shockwave-flash'] &&
    navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin
  ) {
    var flashDescription = (
      navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']
    ).description
    return flashDescription != null
  }
  return false
})()

// user agent detection
var sUA = navigator.userAgent.toLowerCase()
var bIsKHTML = sUA.indexOf('applewebkit') > -1 || sUA.indexOf('konqueror') > -1
var bIsOpera = sUA.indexOf('opera') > -1
var bIsGecko = !bIsKHTML && navigator.product != null && navigator.product.toLowerCase() == 'gecko'
var bIsIE = sUA.indexOf('msie') > -1 && !bIsOpera && !bIsKHTML && !bIsGecko
var nOperaVersion = 0
if (bIsOpera) {
  nOperaVersion = new Number(sUA.match(/.*opera(\s|\/)(\d+\.\d+)/)[2])
}

if (hasFlash) {
  // make xhtml markup invisible
  if (document.documentElement) {
    document.documentElement.className = document.documentElement.className + ' hasFlash'
  }
  // attach onload event
  if (window.attachEvent) {
    window.attachEvent('onload', enableFlash)
  } else if (document.addEventListener || window.addEventListener) {
    if (document.addEventListener) {
      document.addEventListener('load', enableFlash, false)
    }
    if (window.addEventListener) {
      window.addEventListener('load', enableFlash, false)
    }
  } else {
    if (typeof window.onload == 'function') {
      var fOld = window.onload
      window.onload = function () {
        fOld()
        enableFlash()
      }
    } else {
      window.onload = enableFlash
    }
  }
}

function createElement(sTagName) {
  if (document.createElementNS && !bIsOpera) {
    return document.createElementNS('http://www.w3.org/1999/xhtml', sTagName)
  } else {
    return document.createElement(sTagName)
  }
}

function createObjectParameter(nodeObject, sName, sValue) {
  var node = document.createElement('param')
  node.setAttribute('name', sName)
  node.setAttribute('value', sValue)
  nodeObject.appendChild(node)
}

function enableFlash() {
  var nodeFlash
  var node = document.getElementsByTagName('body')[0]
  if (bIsOpera && nOperaVersion < 8) {
    //	Opera below 8 only support the object element,
    //	Opera versions below 7.60 use innerHTML:
    if (nOperaVersion < 7.6) {
      node.innerHTML += [
        '<object',
        'id="flash"',
        'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"',
        'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=' +
          requiredFlashVersion +
          ',0,0,0"',
        'width="100%"',
        'height="0"',
        '>',
        '<param name="movie" value="' + swfUrl + '" />',
        '<param name="quality" value="high" />',
        '<param name="bgcolor" value="' + bgColor + '" />',
        '<param name="flashvars" value="baseurl=' + location.href + '" />',
        '</object>',
      ].join('\n')
    } else {
      // from 7.60 and up we use the DOM
      nodeFlash = createElement('object')
      nodeFlash.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000')
      nodeFlash.setAttribute(
        'codebase',
        'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=' +
          requiredFlashVersion +
          ',0,0,0',
      )
      createObjectParameter(nodeFlash, 'movie', swfUrl)
      createObjectParameter(nodeFlash, 'quality', 'high')
      createObjectParameter(nodeFlash, 'bgcolor', bgColor)
      createObjectParameter(nodeFlash, 'flashvars', 'baseurl=' + location.href)
    }
  } else {
    // Other browsers are given the embed element,
    //	for backwards compatibility reasons between different browser versions.
    if (bIsOpera) {
      swfUrl += '?baseurl=' + location.href
    }
    nodeFlash = createElement('embed')
    nodeFlash.setAttribute('src', swfUrl)
    nodeFlash.setAttribute('quality', 'high')
    nodeFlash.setAttribute('bgcolor', bgColor)
    nodeFlash.setAttribute('allowScriptAccess', 'always')
    nodeFlash.setAttribute('type', 'application/x-shockwave-flash')
    nodeFlash.setAttribute('pluginspage', 'http://www.macromedia.com/go/getflashplayer')
    nodeFlash.setAttribute('flashvars', 'baseurl=' + location.href)
  }
  //	This code is shared between the DOM-created objects
  if (!bIsOpera || nOperaVersion >= 7.6) {
    nodeFlash.setAttribute('id', 'flash')
    nodeFlash.setAttribute('width', '100%')
    nodeFlash.setAttribute('height', '0')
    node.appendChild(nodeFlash)
  }
  //	Workaround to force KHTML-browsers to repaint the document.
  //	Additionally, IE for both Mac and PC need this.
  //	See: http://neo.dzygn.com/archive/2004/09/forcing-safari-to-repaint
  if (bIsKHTML || bIsIE) {
    node.innerHTML += ''
  }
}
