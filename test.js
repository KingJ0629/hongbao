const puppeteer = require('puppeteer');

var cookie = "%7B%22city%22%3A%22%E6%9D%AD%E5%B7%9E%22%2C%22constellation%22%3A%22%22%2C%22eleme_key%22%3A%229874261516b71c1c6621a82179f85fc5%22%2C%22figureurl%22%3A%22http%3A%2F%2Fqzapp.qlogo.cn%2Fqzapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F30%22%2C%22figureurl_1%22%3A%22http%3A%2F%2Fqzapp.qlogo.cn%2Fqzapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F50%22%2C%22figureurl_2%22%3A%22http%3A%2F%2Fqzapp.qlogo.cn%2Fqzapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F100%22%2C%22figureurl_qq_1%22%3A%22http%3A%2F%2Fthirdqq.qlogo.cn%2Fqqapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F40%22%2C%22figureurl_qq_2%22%3A%22http%3A%2F%2Fthirdqq.qlogo.cn%2Fqqapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F100%22%2C%22gender%22%3A%22%E7%94%B7%22%2C%22is_lost%22%3A0%2C%22is_yellow_vip%22%3A%220%22%2C%22is_yellow_year_vip%22%3A%220%22%2C%22level%22%3A%220%22%2C%22msg%22%3A%22%22%2C%22nickname%22%3A%22Libertine%22%2C%22openid%22%3A%2202648EFD6526A29FBE5B363CBDF2BE11%22%2C%22province%22%3A%22%E6%B5%99%E6%B1%9F%22%2C%22ret%22%3A0%2C%22vip%22%3A%220%22%2C%22year%22%3A%221993%22%2C%22yellow_vip_level%22%3A%220%22%2C%22name%22%3A%22Libertine%22%2C%22avatar%22%3A%22http%3A%2F%2Fthirdqq.qlogo.cn%2Fqqapp%2F101204453%2F02648EFD6526A29FBE5B363CBDF2BE11%2F40%22%7D; track_id=1535083207%7Cbbb39d41e51fbc71898c0fceac77d93b94c571fb99845aa952%7C34f9af60a359354b11fc5233fd843670";
var url_ = "https://h5.ele.me/hongbao/?from=groupmessage&isappinstalled=0#hardware_id=&is_lucky_group=True&lucky_number=9&track_id=&platform=0&sn=2a06282ad6ac943b&theme_id=2969&device_id=&refer_user_id=7045342";

(async () => {

  getRedHacket();
  
})();

async function getRedHacket() {
  const browser = await puppeteer.launch({
    //关闭无头模式，方便我们看到这个无头浏览器执行的过程
    headless: false,
  });
  const page = await browser.newPage();
  //设置UA头
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 5.1; m1 metal Build/LMY47I; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043409 Safari/537.36 V1ANDSQ7.2.5744YYBD QQ/7.2.5.3305 NetType/WIFI WebP/0.3.0 Pixel/1080')
  //此处只需要设置cookie中的snsInfo[101204453]即可无需设置全部cookie信息
  await page.setCookie({
    name: 'snsInfo[101204453]',
    value: cookie,
    domain: '.ele.me',
    path: '/',
    expires: 4070851200,//过期时间
  });
  //开启监听请求
  await page.setRequestInterception(true);
  page.on('request', request => {
    request.continue(); // pass it through.
  });
  page.on('response', response => {
    const req = response.request();
    if(response.url().match('h5.ele.me/restapi/marketing/promotion/weixin')) {
      console.log(response.url());
      response.text().then(
        (res)=>{
          console.log(res)
          var obj = JSON.parse(res)
          // 抢红包的人数
          console.log(obj.promotion_records.length)
        }
      );
    }
  });

  await page.evaluateOnNewDocument(function() {
    navigator.geolocation.getCurrentPosition = function (cb) {
      setTimeout(() => {
        cb({
          'coords': {
            accuracy: 21,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            latitude: 23.129163,
            longitude: 113.264435,
            speed: null
          }
        })
      }, 1000)
    }
  });

  await page.goto(url_, {
          // 配置项
    waitUntil: 'networkidle2', // 等待网络状态为空闲的时候才继续执行
  });
  //为了看清楚延迟6s
  await page.waitFor(116000)
  await browser.close();
}
