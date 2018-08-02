// /userinfo/2144/id => ['/userinfo','/useinfo/2144,'/userindo/2144/id']
export function urlToList(url) {
  const urllist = url.split('/').filter(i => i);
  return urllist.map((urlItem, index) => {
    return `/${urllist.slice(0, index + 1).join('/')}`;
  });
}
//带天数的倒计时
export function countDown(times) {
  var timer = null;
  timer = setInterval(function() {
    var day = 0,
      hour = 0,
      minute = 0,
      second = 0; //时间默认值
    if (times > 0) {
      day = parseInt(times / (1000 * 60 * 60 * 24));
      hour = parseInt((times % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minute = parseInt((times % (1000 * 60 * 60)) / (1000 * 60));
      second = parseInt((times % (1000 * 60)) / 1000);
    }
    if (day <= 9) day = '0' + day;
    if (hour <= 9) hour = '0' + hour;
    if (minute <= 9) minute = '0' + minute;
    if (second <= 9) second = '0' + second;
    //
    console.log(hour + '：' + minute + '：' + second);
    times -= 1000;
    // times--;
  }, 1000);
  if (times <= 0) {
    clearInterval(timer);
  }
}
