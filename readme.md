# 茶友会 - 淘宝查券助手

茶友会是自动为你查找淘宝优惠券，自动签到领飞猪里程的多功能购物助手。

**强烈推荐使用 Chrome 商店安装**（这样才能获得自动更新）：

<a target='_blank' rel='nofollow' href='https://chrome.google.com/webstore/detail/igedhbjllcmgidlmhclmphmhlllkibkb'>
  <img alt='Chrome
  web store' width='496' height='150' src='https://jjbcdn.zaoshu.so/web/cws_badge_496x150.png' />
</a>

或者直接下载的 CRX文件手动安装（非常不建议）

<a href="http://jjb.zaoshu.so/updates/latest?app=teaclub" target="_black">
  <img alt="下载 CRX 文件" class="firefox" src="https://jjbcdn.zaoshu.so/crx-icon.png" width="32px">
</a>

*此方法通常只适用于 Chromium 内核的国产浏览器，因为 Chrome 出于安全原因已禁止通过除 Chrome 官方商店以外的其他渠道安装拓展。*

## 主要功能

* 自动查询当前浏览商品的渠道优惠券
* 自动签到领取飞猪里程
* 自动找拼多多低价同款

## 演示

![自动查券](https://jjbcdn.zaoshu.so/teaclub/find-coupon.gif)


## 重要提示

1. 茶友会并非开源软件，不许可您以任何形式进行再发行，请仔细阅读[#协议和授权](https://github.com/sunoj/teaclub#%E5%8D%8F%E8%AE%AE%E5%92%8C%E6%8E%88%E6%9D%83)。

2. 当前仓库是插件源代码，无法直接安装，如需安装请自行参考 [#如何开发](https://github.com/sunoj/teaclub#%E5%A6%82%E4%BD%95%E5%BC%80%E5%8F%91) 编译。

3. 茶友会绝对不会在任何情况下强行劫持任何网页的访问，如果发现类似问题请善用 Google 搜索并使用二分法停用插件排除，同时考虑运营商劫持的可能性。或者，为了防止茶友会的影响亦可直接卸载茶友会。故不再回复类似的 Issue。详情参考：[#安全提示](https://github.com/sunoj/teaclub#%E5%AE%89%E5%85%A8%E6%8F%90%E7%A4%BA)


## 如何开发

* 安装依赖
> yarn

* 开始开发
>  BUILDID=1 VERSION=1.1.1 BROWSER=chrome yarn build

`主要作用就是合并压缩代码，质疑代码和市场版本不一致，请先自行打包一下再对比`


## 安全提示

茶友会不会在任何情况下强行劫持访问、插入恶意代码、上传隐私信息或利用你的电脑挖矿。

若你发现任何类似问题，请首先确保你使用的是商店版本，不建议在任何情况下使用第三方提供的安装包。

## 系统支持

目前茶友会对 Windows 和 Mac 平台的 Chrome 有较好的支持。

Ubuntu 有明确的兼容问题，由于作者不拥有任何 Ubuntu 设备，因此暂时无法解决。

## 协议和授权

茶友会并非一个开源软件，作者保留全部的权利。
公开源代码的目的是为了让使用者能够审计代码，但是你仍然可以就以下方式合法的使用本项目的全部代码和资源：

1. 个人使用
2. 以学习目的使用全部或部分代码

但你不可以：

1. 将本项目的部分或全部代码和资源进行任何形式的再发行（尤其是上传到 Chrome 商店）
2. 利用本项目的部分或全部代码和资源进行任何商业行为

## 贡献代码

茶友会并非一个开源项目，也不是社区共同创造，其全部功能由作者独立完成。

如果你愿意放弃所有权利，并将权利无条件转让给茶友会作者，欢迎您贡献代码。

## 提交反馈

欢迎提交 issue，请写清楚遇到问题的原因，浏览器和操作系统环境，重现的流程。

任何反馈问题的 issue 均需按照模板格式填写，否则将被直接关闭。

如果有开发能力，建议在本地调试出出错的代码。

## 联系作者

请发邮件至：`ming@tiny.group`

请勿发送功能咨询邮件，将不会收到回复。相关功能细节请自行了解。

## 相关项目

<h3>
  <a href="https://github.com/sunoj/jjb" target="_blank">京价保</a>
</h3>
