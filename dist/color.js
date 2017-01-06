!function(t){"use strict";var Color=function(t,o){this._callbacks=[],this._colors=null,this._data=null,this._img=null,this._running=!0,this._url=null;var o=o||{};if(this.amount=o.amount||3,this.format=o.format||"rgb",this.group=o.group||20,this.sample=o.sample||10,"function"==typeof t&&(t=t()),"object"==typeof t&&t.src)this._url=t.src;else{if("string"!=typeof t)throw new TypeError("Invalid image type.");this._url=t}this._createImage()};Color.prototype._rgbToHex=function(t,o,r){return"#"+[t,o,r].map(function(t){var o=parseInt(t).toString(16);return 1===t.toString(10).length?"0"+o:o}).join("")},Color.prototype._format=function(t){switch(this.format){case"array":t.forEach(function(o,r){t[r]=o.split(", ")});break;case"hex":t.forEach(function(o,r){var s=o.split(", ");t[r]=this._rgbToHex(s[0],s[1],s[2])},this);break;default:t.forEach(function(o,r){t[r]="rgb("+o.split(",")+")"})}return 1===t.length?t[0]:t},Color.prototype._roundToGroups=function(t){var o=Math.round(t/this.group)*this.group;return o>=255?255:o},Color.prototype._createImage=function(){this._img=document.createElement("img"),this._img.crossOrigin="Anonymous",this._img.src=this._url,this._img.addEventListener("load",function(){this._createCanvas(),this._running=!1,this._runCallbacks()}.bind(this))},Color.prototype._createCanvas=function(){var t=document.createElement("canvas");if("undefined"==typeof t.getContext)throw new Error("HTML5 canvas is not supported.");var o=t.getContext("2d");t.height=this._img.height,t.style.display="none",t.width=this._img.width,o.drawImage(this._img,0,0),document.body.appendChild(t);var r=o.getImageData(0,0,this._img.width,this._img.height);this._data=r.data,document.body.removeChild(t)},Color.prototype._runCallbacks=function(){this._callbacks.forEach(function(t,o){this._callbacks[o].method.call(this,this._callbacks[o].call)},this),this._callbacks=[]},Color.prototype._extractChannels=function(){for(var t={amount:0,colors:{r:0,g:0,b:0}},o=0;o<this._data.length;o+=4*this.sample)if(!(this._data[o+3]<127.5)){var r=o;t.amount++;for(var s in t.colors)t.colors[s]+=this._data[r],r++}return t},Color.prototype._extractColorGroups=function(){for(var t={},o=[],r=0;r<this._data.length;r+=4*this.sample)if(!(this._data[r+3]<127.5)){var s=[this._roundToGroups(this._data[r]),this._roundToGroups(this._data[r+1]),this._roundToGroups(this._data[r+2])].join(", ");s in t?t[s]++:t[s]=1}for(var i in t)o.push({color:i,count:t[i]});return o.sort(function(t,o){return t.count<o.count?1:t.count>o.count?-1:0})},Color.prototype._average=function(t){var o=[],r=this._extractChannels();for(var s in r.colors)o.push(Math.round(r.colors[s]/r.amount));o=[o.join(", ")],t(this._format(o))},Color.prototype._process=function(t,o){this._colors||(this._colors=this._extractColorGroups());var r=[];o(r),t(this._format(r))},Color.prototype._leastUsed=function(t){this._process(t,function(t){for(var o=1;o<=this.amount;o++)this._colors[this._colors.length-o]&&t.push(this._colors[this._colors.length-o].color)}.bind(this))},Color.prototype._mostUsed=function(t){this._process(t,function(t){for(var o=0;o<this.amount;o++)this._colors[o]&&t.push(this._colors[o].color)}.bind(this))},Color.prototype._call=function(t,o){if("function"!=typeof t)throw new ReferenceError("Callback is not provided.");this._running?this._callbacks.push({call:t,method:o}):o.call(this,t)},Color.prototype.average=function(t){this._call(t,this._average)},Color.prototype.leastUsed=function(t){this._call(t,this._leastUsed)},Color.prototype.mostUsed=function(t){this._call(t,this._mostUsed)},"object"==typeof module?module.exports=Color:t.Color=Color}(this);