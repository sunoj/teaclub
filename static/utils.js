import {DateTime} from 'luxon'

module.exports = {
  rand: function (n){
    return (Math.floor(Math.random() * n + 1));
  },
  price: function(price) {
    return Number(Number(price).toFixed(2))
  },
  getSetting: function (settingKey, defaultValue) {
    let setting = localStorage.getItem(settingKey)
    if (setting) {
      try {
        setting = JSON.parse(setting)
      } catch (error) {}
    }
    return setting ? setting : defaultValue
  },
  readableTime: function (datetime) {
    if (DateTime.local().hasSame(datetime, 'day')) {
      return '今天 ' + datetime.setLocale('zh-cn').toLocaleString(DateTime.TIME_SIMPLE)
    }
    if (DateTime.local().hasSame(datetime.plus({ days: 1 }), 'day')){
      return '昨天 ' + datetime.setLocale('zh-cn').toLocaleString(DateTime.TIME_SIMPLE)
    }
    return datetime.setLocale('zh-cn').toFormat('f')
  },
  versionCompare: function (v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        return -1;
    }
    return 0;
  }
}