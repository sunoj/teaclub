import {getSetting} from './utils'

module.exports = {
  getLoginState: function () {
    let loginState = {
      pc: getSetting('login-state_pc', {
        state: "unknown"
      }),
      m: getSetting('login-state_m', {
        state: "unknown"
      }),
      class: "unknown"
    }
    // 处理登录状态
    if (loginState.pc.state == 'alive' || loginState.m.state == 'alive') {
      loginState.class = "alive"
    }
    if (loginState.pc.state == 'failed' || loginState.m.state == 'failed') {
      loginState.class = "failed"
    }
    if ( loginState.pc.time && loginState.m.time) {
      if (new Date(loginState.pc.time) > new Date(loginState.m.time)) {
        loginState.class = loginState.pc.state
      } else {
        loginState.class = loginState.m.state
      }
    }
    return loginState
  }
}