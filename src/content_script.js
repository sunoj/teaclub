import 'weui';
import weui from 'weui.js';
import '../static/style/style.css'

var observeDOM = (function () {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  return function (obj, callback) {
    // define a new observer
    var obs = new MutationObserver(function (mutations, observer) {
      if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
        callback(observer);
      }
    });
    // have the observer observe foo for changes in children
    obs.observe(obj, { childList: true, subtree: true });
  };
})();

Object.defineProperty(Array.prototype, 'chunk', {
  value: function (chunkSize) {
    var array = this;
    return [].concat.apply([],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }
});


function mockTap(element) {
  let rect = element.getBoundingClientRect()
  sendTouchEvent(rect.x + 3, rect.y + 3, element, 'touchstart');
  sendTouchEvent(rect.x + 3, rect.y + 3, element, 'touchend');
}

// 模拟点击 (原生)
function simulateClick(domNode, mouseEvent) {
  if (mouseEvent && domNode) {
    return mockClick(domNode)
  }
  try {
    mockTap(domNode)
    mockClick(domNode)
  } catch (error) {
    console.log('fullback to mockClick', error)
    mockClick(domNode)
  }
}

function mockClick(element) {
  var dispatchMouseEvent = function (target, var_args) {
    var e = document.createEvent("MouseEvents");
    e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
    target.dispatchEvent(e);
  };
  if (element) {
    dispatchMouseEvent(element, 'mouseover', true, true);
    dispatchMouseEvent(element, 'mousedown', true, true);
    dispatchMouseEvent(element, 'click', true, true);
    dispatchMouseEvent(element, 'mouseup', true, true);
  }
}

/* eventType is 'touchstart', 'touchmove', 'touchend'... */
function sendTouchEvent(x, y, element, eventType) {
  if ('TouchEvent' in window && TouchEvent.length > 0) {
    const touchObj = new Touch({
      identifier: Date.now(),
      target: element,
      clientX: x,
      clientY: y,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 10,
      force: 0.5,
    });
    const touchEvent = new TouchEvent(eventType, {
      cancelable: true,
      bubbles: true,
      touches: [touchObj],
      targetTouches: [],
      changedTouches: [touchObj],
      shiftKey: true,
    });
    element.dispatchEvent(touchEvent);
  } else {
    console.log('no TouchEvent')
  }
}

function injectScript(file, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('charset', "UTF-8");
  s.setAttribute('src', file);
  th.appendChild(s);
}

function injectScriptCode(code, node = 'body') {
  var th = document.getElementsByTagName(node)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('language', 'JavaScript');
  script.textContent = code;
  th.appendChild(script);
}

injectScriptCode(`
  if (typeof hrl != 'undefined' && typeof host != 'undefined') {
    document.write('<a style="display:none" href="' + hrl + '" id="exe"></a>');
    document.getElementById('exe').click()
  }
`, 'body')

function escapeSpecialChars(jsonString) {
  return jsonString.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
}

var pageTaskRunning = false

// 获取设置
function getSetting(name, cb) {
  chrome.runtime.sendMessage({
    text: "getSetting",
    content: name
  }, function (response) {
    cb(response)
    console.log("getSetting Response: ", name, response);
  });
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}


function addDiscountElement() {
  var newDiv = createElementFromHTML(`
    <div id="teaclub">
      <div class="loading">
        <img src="https://jjbcdn.zaoshu.so/teaclub/chicken-serching.gif">
        茶友会正在查询优惠券..
      </div>
      <div id="No-Result" style="display: none;">
        <div class="coupon-not-found">
          <img src="https://jjbcdn.zaoshu.so/teaclub/coupon-not-found.jpg"/>遗憾，此商品没找到渠道优惠券
        </div>
      </div>
      <div id="Coupon-box" style="display: none;">
        <dl class="prop clear">
        <dt class="metatit">优惠券</dt>
          <dd id="Coupon-list">
          </dd>
        </dl>
      </div>
      <div id="PDD-box" style="display: none;">
        <dl class="prop clear">
        <dt class="metatit">拼多多同款</dt>
          <dd id="PDD-goods">
          </dd>
        </dl>
      </div>
      <div class="information-from">🍵茶友会提供</div>
    </div>
  `);

  if (document.getElementById("J_isku")) {
    document.getElementsByClassName("tb-wrap")[0].insertBefore(newDiv, document.getElementById("J_SepLine"));
  } else {
    document.getElementsByClassName("tb-wrap")[0].insertBefore(newDiv, document.getElementsByClassName("tm-ser")[0]);
  }
}

function addCouponElement(coupon) {
  let displayCouponName = coupon.name
  const couponNameParsingResults = /满([0-9]*).([0-9]{2})元减([0-9]*)元/.exec(coupon.name)
  if (couponNameParsingResults && couponNameParsingResults[2] == "00") {
    displayCouponName = `满${couponNameParsingResults[1]}元减${couponNameParsingResults[3]}元`
  }
  var newDiv = createElementFromHTML(`
    <a class="teaclub-coupon" href="${coupon.url}" target="_blank">
      <div class="coupon-bonus-item">
        <div class="coupon-item-left">
          <p class="coupon-item-rmb">
            <span class="rmb">${displayCouponName}</span>
          </p>
          <p class="coupon-item-surplus">剩余：${coupon.remainCount}</p>
        </div>
        <div class="coupon-item-right">
          <p>有效期</p>
          <p>${coupon.startTime}</p>
          <p>- ${coupon.endTime}</p>
        </div>
      </div>
    </a>
  `);
  var currentDiv = document.getElementById("Coupon-list");
  currentDiv.appendChild(newDiv);
}

function buildGoodsBatch(goodsBatch) {
  injectScriptCode(
    `
    var slideIndex = 1;

    // Next/previous controls
    function plusSlides(n) {
      showSlides(slideIndex += n);
    }

    // Thumbnail image controls
    function currentSlide(n) {
      showSlides(slideIndex = n);
    }

    function showSlides(n) {
      var i;
      var slides = document.getElementsByClassName("teaClubSlide");
      var dots = document.getElementsByClassName("dot");
      if (n > slides.length) {slideIndex = 1}
      if (n < 1) {slideIndex = slides.length}
      for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
          dots[i].className = dots[i].className.replace(" active", "");
      }
      if (slides[slideIndex-1]) {
        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].className += " active";
      }
    }
  `, 'body')

  const goodsBatchDom = goodsBatch.map((goods, index) => {
    return `<div class="teaClubSlide fade">
        <div class="number-text">${index} / ${goodsBatch.length}</div>
        <div class="goodCard-list">
        ${
      goods.map((good) => {
        return buildGoodCard(good)
      }).join('')
      }
        </div>
      </div>`
  }).join('')
  const batchDots = goodsBatch.map((goods, index) => {
    return `<span class="dot" onclick="currentSlide(${index + 1})"></span>`
  }).join('')

  let goodsElement = ''
  if (goodsBatch.length > 1) {
    goodsElement = createElementFromHTML(`<div id="teaclub-slides">
      <div class="slideshow-container">
        ${goodsBatchDom}
        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
        <a class="next" onclick="plusSlides(1)">&#10095;</a>
      </div>
      <br>
      <div style="text-align:center">
        ${batchDots}
      </div>
    </div>`)
  } else {
    goodsElement = createElementFromHTML(goodsBatchDom)
  }

  var currentDiv = document.getElementById("PDD-goods");
  currentDiv.appendChild(goodsElement);
}

function buildGoodCard(good) {
  return `<div>
    <a class="PDD-card" href="${good.url}" target="_blank">
    <div class="PDD-cardContainer">
      <div class="PDD-imageContainer PDD-imageContainer--square"><img class="PDD-image"
          src="${good.thumbnail}" alt=""></div>
      <div class="PDD-info">
        <div class="PDD-title">
          <div class="PDD-titleText">${good.name}</div>
          <div class="PDD-tagList PDD-tagList--title">
            <div class="PDD-tag PDD-tag--source PDD-tag--jingdong PDD-tag--plain">销量：${good.sales}</div>
          </div>
        </div>
        <div class="PDD-tool">
          <div class="PDD-toolLeft">
            <div class="PDD-price">￥${good.price}</div>
          </div>
          <div class="PDD-button PDD-button--plain PDD-button--orange">
            去购买
            <svg
              class="Zi Zi--ArrowRight" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M9.218 16.78a.737.737 0 0 0 1.052 0l4.512-4.249a.758.758 0 0 0 0-1.063L10.27 7.22a.737.737 0 0 0-1.052 0 .759.759 0 0 0-.001 1.063L13 12l-3.782 3.716a.758.758 0 0 0 0 1.063z"
                fill-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </a>
  </div>`
}


async function findCoupon(disable_find_coupon) {
  if (disable_find_coupon) return
  addDiscountElement()
  const urlParams = new URLSearchParams(window.location.search);
  const sku = urlParams.get('id') || urlParams.get('skuId')
  const title = document.title.split('-')[0]
  const merchant = window.location.host.indexOf('item.taobao.com') > -1 ? 'taobao' : 'tmall'
  chrome.runtime.sendMessage({
    action: "queryCoupon",
    params: {
      merchant,
      sku,
      title
    }
  })
}

function markCheckinStatus(task, data, cb) {
  chrome.runtime.sendMessage({
    action: "markCheckinStatus",
    taskId: task.id,
    status: "signed",
    ...data
  }, function (response) {
    console.log('markCheckinStatus response', response)
    if (cb && response) { cb() }
  });
}


// 自动登录
function autoLogin() {
  document.getElementById("fm-login-id").focus();
  setTimeout(() => {
    document.getElementById("fm-login-id").blur();
  }, 50);
  setTimeout(() => {
    simulateClick(document.getElementById("login").querySelector(".password-login-tab-item"), false)
    document.getElementById("fm-login-password").focus();
  }, 500);
  setTimeout(() => {
    console.log('尝试自动登录')
    if (document.getElementById("fm-login-id").value && document.getElementById("fm-login-password").value) {
      console.log('正在登录')
      simulateClick(document.getElementById("login-form").querySelector("button.password-login"), true)
    }
  }, 1500);
}


// *********
// 签到任务
// *********

// 飞猪里程
function markFliggyCheckin(task, orderId) {
  const signRes = document.getElementsByClassName("tlc-title")[0] && document.getElementsByClassName("tlc-title")[0].innerText
  const value = (document.getElementsByClassName("tlc-title")[0] && document.getElementsByClassName("tlc-title")[0].getElementsByTagName("span")[0]) ? document.getElementsByClassName("tlc-title")[0].getElementsByTagName("span")[0].innerText : null
  console.log('markFliggyCheckin', task, orderId, signRes, value)
  if (signRes && (signRes.indexOf("获得") > -1)) {
    return markCheckinStatus(task, {
      value: value + '里程',
      orderId: orderId
    }, () => {
      chrome.runtime.sendMessage({
        action: "checkin_notice",
        value: value,
        reward: 'mileage',
        title: orderId ? "茶友会自动为您签订单奖励里程" : "茶友会自动为您签到领里程",
        content: "恭喜您获得了" + value + '个里程奖励'
      }, function (response) {
        console.log("Response: ", response);
      })
    })
  } else if (signRes && (signRes.indexOf("今日已领") > -1)) {
    markCheckinStatus(task, {
      value
    })
  } else if (signRes && (signRes.indexOf("已领取过") > -1) && orderId) {
    markCheckinStatus(task, {
      value,
      orderId: orderId
    })
  } else if (signRes && (signRes.indexOf("本月您已领满") > -1)) {
    markCheckinStatus(task, {
      value,
      month: new Date().getMonth(),
    })
  }
}

function fliggyCheckin(setting) {
  if (setting != 'never') {
    weui.toast('茶友会运行中', 1000);
    chrome.runtime.sendMessage({
      action: "updateRunStatus",
      taskId: 2
    })
    let signInButton = document.getElementsByClassName("J_mySignInBtn")[0]

    if (signInButton && signInButton.innerText == "已签到") {
      markCheckinStatus({
        key: 'fliggy-mytrip',
        id: 2
      })
    } else if (signInButton && signInButton.innerText && signInButton.innerText.indexOf("签到") > -1) {
      simulateClick(signInButton)
      // 监控结果
      observeDOM(document.body, function () {
        markFliggyCheckin({
          key: 'fliggy-mytrip',
          id: 2
        })
      })
    }
  }
}

function fliggyCheckin2(setting) {
  if (setting != 'never') {
    weui.toast('茶友会运行中', 1000);
    chrome.runtime.sendMessage({
      action: "updateRunStatus",
      taskId: 3
    })
    let signInButton = document.getElementsByClassName("J_makesurebuttontvipBtn")[0]
    if (signInButton && signInButton.innerText && signInButton.innerText == "确    认") {
      simulateClick(signInButton)
      // 监控结果
      observeDOM(document.body, function () {
        markFliggyCheckin({
          key: 'fliggy-tvip',
          id: 3
        })
      })
    } else {
      if (signInButton && signInButton.innerText == "已签到") {
        markCheckinStatus({
          key: 'fliggy-tvip',
          id: 3
        })
      }
    }
  }
}

function fliggyCheckin3(setting) {
  if (setting != 'never') {
    weui.toast('茶友会运行中', 1000);
    chrome.runtime.sendMessage({
      action: "updateRunStatus",
      taskId: 4
    })
    let signInButton = null
    let signInReward = null
    let spanElements = document.getElementsByTagName("span")
    Array.prototype.slice.call(spanElements).forEach(function (element) {
      if (element.innerText && /^签到\+[0-9]+里程/.test(element.innerText)) {
        signInButton = element
      }
      if (element.innerText && /^明日\+[0-9]+里程/.test(element.innerText)) {
        signInReward = element
      }
    });
    console.log('signInButton', signInButton)
    if (signInButton) {
      setTimeout(() => {
        simulateClick(signInButton, true)
      }, 500);
      // 监控结果
      observeDOM(document.body, function () {
        markFliggyCheckin({
          key: 'rx-member',
          id: 4
        })
      })
    } else {
      if (signInReward && signInReward.innerText) {
        markCheckinStatus({
          key: 'rx-member',
          id: 4
        })
      }
    }
  }
}

function fliggyCheckin6(setting) {
  if (setting != 'never') {
    weui.toast('茶友会运行中', 1000);
    chrome.runtime.sendMessage({
      action: "updateRunStatus",
      taskId: 6
    })
    const urlParams = new URLSearchParams(window.location.search);
    let orderId = urlParams.get('orderId')
    let signInButton = document.getElementsByClassName("J_makesurebuttontvip")[0]
    if (signInButton && signInButton.innerText && signInButton.innerText == "确    认") {
      simulateClick(signInButton)
      // 监控结果
      observeDOM(document.body, function () {
        markFliggyCheckin({
          key: 'order-fliggy',
          id: 6
        }, orderId)
      })
    }
  }
}

function accountAlive(type, message) {
  chrome.runtime.sendMessage({
    action: "saveLoginState",
    state: "alive",
    message: message,
    type: type
  }, function (response) {
    console.log("accountAlive ", type, message, response);
  });
}

if (document.getElementById("login-info")) {
  observeDOM(document.getElementById("login-info"), function () {
    if (document.getElementsByClassName("j_Username")[0] && document.getElementsByClassName("j_Username")[0].innerText) {
      accountAlive('pc', 'PC网页检测到用户名')
    }
  });
}

if (document.getElementById("mytaobao-panel")) {
  if (document.getElementsByClassName("J_SiteNavUserAvatar")[0]) {
    accountAlive('pc', 'PC网页检测到用户头像')
  }
}

// 主任务
function CheckDom() {
  if (window.location.host.indexOf("m.taobao.com") > -1 && window.location.host.indexOf("item.taobao.com") < 0) {
    injectScript(chrome.extension.getURL('/static/touch-emulator.js'), 'body');
    injectScriptCode(`
      setTimeout(function () {
        TouchEmulator();
      }, 200)
    `, 'body')
  }
  // 判断登录状态
  checkLoginState()

  setTimeout(() => {
    if (window.location.host == 'login.taobao.com') {
      chrome.runtime.sendMessage({
        action: "saveLoginState",
        state: "failed",
        message: "PC网页需要登录",
        type: "pc"
      }, function (response) {
        console.log("Response: ", response);
      });
    }
    if (window.location.host == 'login.m.taobao.com') {
      chrome.runtime.sendMessage({
        action: "saveLoginState",
        state: "failed",
        message: "移动网页需要登录",
        type: "m"
      }, function (response) {
        console.log("Response: ", response);
      });
    }
  }, 5000);

  // 订单
  if (document.title == "已买到的宝贝" && window.location.host == 'buyertrade.taobao.com') {
    let orderElements = document.getElementsByClassName("bought-wrapper-mod__head-info-cell___29cDO")
    let time = 0
    // 只处理最近五个订单
    if (orderElements && orderElements.length > 5) {
      orderElements = Array.prototype.slice.call(orderElements).slice(0, 5);
    }
    Array.prototype.slice.call(orderElements).forEach(function (orderElement) {
      if (orderElement.lastElementChild && orderElement.lastElementChild.lastElementChild) {
        let orderId = orderElement.lastElementChild.lastElementChild.innerText
        if (orderId) {
          setTimeout(function () {
            chrome.runtime.sendMessage({
              action: "getOrderFliggy",
              orderId: orderId
            }, function (response) {
              console.log("Response: ", response);
            });
          }, time)
          time += 15000;
        }
      }
    });
  }

  // 登录页面
  if (window.location.host.indexOf('login') > -1) {
    setTimeout(() => {
      autoLogin()
    }, 2500);
  }
  // 商品页
  if (window.location.host.indexOf('item.taobao.com') > -1 || window.location.host.indexOf('detail.tmall.com') > -1) {
    setTimeout(() => {
      getSetting('disable_find_coupon', (setting) => {
        findCoupon(setting)
      })
    }, 50);
  }
  // 飞猪签到
  if (document.title == "我的旅行" && window.location.host == 'www.fliggy.com') {
    setTimeout(() => {
      if (document.getElementsByClassName("J_mySignInBtn")[0]) {
        getSetting('task-2_frequency', fliggyCheckin)
      } else if (document.getElementsByClassName("J_makesurebuttontvipBtn")[0]) {
        getSetting('task-3_frequency', fliggyCheckin2)
      } else if (document.getElementsByClassName("J_makesurebuttontvip")[0]) {
        getSetting('task-6_frequency', fliggyCheckin6)
      }
    }, 3000);
  };
  if (document.title == "会员中心" && window.location.host == 'h5.m.taobao.com') {
    getSetting('task-4_frequency', fliggyCheckin3)
  }
}


// 检查登录状态
function checkLoginState() {
  // PC 是否登录
  if (document.getElementById("mtb-nickname") && document.getElementById("mtb-nickname").value || document.getElementsByClassName("J_MemberNick")[0]) {
    accountAlive('pc', 'PC网页检测到用户名')
  }
  // M 是否登录
  if (document.getElementsByClassName("tb-toolbar-container")[0] || window.location.href == "https://h5.m.taobao.com/mlapp/mytaobao.html") {
    accountAlive('m', '移动端打开我的淘宝')
  }
}


$(document).ready(function () {
  console.log('茶友会注入页面成功');
  checkLoginState()
  if (!pageTaskRunning) {
    setTimeout(function () {
      console.log('茶友会开始执行任务');
      CheckDom()
    }, 2500)
  }
});


function dealWithSearchRes(content) {
  if (content.coupon) {
    setTimeout(() => {
      document.getElementById("Coupon-box").style.display = 'block';
      addCouponElement(content.coupon)
      document.getElementById("teaclub").getElementsByClassName("loading")[0].style.display = 'none';
    }, 500);
  } else {
    document.getElementById("Coupon-box").style.display = 'none';
  }
  if (content.similarGoods && content.similarGoods.length > 0) {
    setTimeout(() => {
      document.getElementById("teaclub").getElementsByClassName("loading")[0].style.display = 'none';
      document.getElementById("PDD-box").style.display = 'block';
      buildGoodsBatch(content.similarGoods.chunk(3))
    }, 500);
    setTimeout(() => {
      injectScriptCode(`
        showSlides(1);
      `, 'body')
    }, 520);
  } else {
    document.getElementById("PDD-box").style.display = 'none';
  }
  if (!content.coupon && (!content.similarGoods || content.similarGoods.length < 1)) {
    setTimeout(() => {
      document.getElementById("teaclub").getElementsByClassName("loading")[0].style.display = 'none';
      document.getElementById("No-Result").style.display = 'block';
    }, 1500);
  }
}

// 应用消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('onMessage', message)
  switch (message.type) {
    case 'couponInfo':
      dealWithSearchRes(message.content)
      break;
    default:
      break;
  }
})


// 消息
var passiveSupported = false;
try {
  var options = Object.defineProperty({}, "passive", {
    get: function () {
      passiveSupported = true;
    }
  });

  window.addEventListener("test", null, options);
} catch (err) { }

window.addEventListener("message", function (event) {
  if (event.data && event.data.action == 'productPrice') {
    findOrderBySkuAndApply(event.data, event.data.setting)
  }
},
  passiveSupported ? { passive: true } : false
);


var nodeList = document.querySelectorAll('script');
for (var i = 0; i < nodeList.length; ++i) {
  var node = nodeList[i];
  node.src = node.src.replace("http://", "https://")
}