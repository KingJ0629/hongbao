const puppeteer = require('puppeteer');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'jinjinjin',
  database : 'hongbao'
});

// input 输入内容
var url = "https://h5.ele.me/hongbao/?from=groupmessage&isappinstalled=0#hardware_id=&is_lucky_group=True&lucky_number=8&track_id=&platform=0&sn=2a06f1b939afc0fe&theme_id=2985&device_id=&refer_user_id=252137080"
var userPhone = "15757101582"

// 用来存放排除的user的数组
var notArray = [];

var userEntity //需要最大红包的人的手机号对应的cookie
var luckyNumber; //最大红包数位置

(async () => {

  notArray.push(userPhone);

  var array = parseUrl(url)
  if (array != null && array.length == 2) {
    // 拿到最大红包的序号 array[1]
    console.log('The results is: ', array[0] + "----" + array[1]); 
    luckyNumber = array[1]
  }

  {
    //get user cookie
    connection.connect();
    connection.query('SELECT * from ele_user where phone = ' + userPhone + ' limit 1', function (error, results, fields) {
      if (error) throw error;

      // 最大红包数解析不为null & lucky number有值
      if (results[0] != null && results[0].cookie != null && luckyNumber != null) {
        userEntity = results
        console.log('The results is: ', userEntity[0].cookie.length + "  luckyNumber:" + luckyNumber);

        scape()
      }
    });
  }
  
})();

async function scape() {
  connection.query('select * from ele_user where ele_user.phone not in (' + notArray + ') and ele_user.count > 0 and ele_user.count >= (select ele_status.number from ele_status limit 1) limit 1', function (error, results, fields) {
    if (error) throw error;

    // 去拿到垫刀的cookie
    if (results[0] != null && results[0].cookie != null) {
      console.log('The temp cookie is: ', results[0].cookie.length + "   phone:" + results[0].phone);

      goPuppeteer(results)
    } else {
      //如果已经没有该count下的cookie了，status下的count减1,在回调自己
      connection.query('select ele_status.number from ele_status limit 1', function (error, results, fields) {
        if (error) throw error;

        var newCount = results[0].number - 1
        if (newCount <= 0) {
          console.log('数据量用尽了！！！')
          return
        }
        connection.query('update ele_status set ele_status.number = ' + newCount, function (error_, results_, fields) {
          if (error_) throw error_;

          scape()
        });
      });
    }
  });
}

async function goPuppeteer(resultsParam) {

  const browser = await puppeteer.launch({
    //关闭无头模式，方便我们看到这个无头浏览器执行的过程
    headless: true,
  });
  const page = await browser.newPage();
  //设置UA头
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 5.1; m1 metal Build/LMY47I; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043409 Safari/537.36 V1ANDSQ7.2.5744YYBD QQ/7.2.5.3305 NetType/WIFI WebP/0.3.0 Pixel/1080')
  //此处只需要设置cookie中的snsInfo[101204453]即可无需设置全部cookie信息
  await page.setCookie({
    name: 'snsInfo[101204453]',
    value: resultsParam[0].cookie,
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

          // await browser.close();

          notArray.push(resultsParam[0].phone)

          console.log(res)
          var obj = JSON.parse(res)
          // 抢红包的人数
          var numberNow = obj.promotion_records.length
          if (numberNow >= luckyNumber) {
            // 已经没有最大红包的情况
            console.log('已经没有最大红包的情况')

            if (obj.is_new_supervip) {
              connection.query('select ele_user.count from ele_user where ele_user.phone = ' + resultsParam[0].phone, function (error, results, fields) {
                if (error) throw error;

                var newCount = results[0].count - 1
                connection.query('update ele_user set ele_user.count = ' + newCount + ' where ele_user.phone = ' + resultsParam[0].phone, function (error_, results_, fields) {
                  if (error_) throw error_;
                });
              });
            }
          } else {
            connection.query('select ele_user.count from ele_user where ele_user.phone = ' + resultsParam[0].phone, function (error, results, fields) {
              if (error) throw error;

              var newCount = results[0].count - 1
              connection.query('update ele_user set ele_user.count = ' + newCount + ' where ele_user.phone = ' + resultsParam[0].phone, function (error_, results_, fields) {
                if (error_) throw error_;

                if (luckyNumber == numberNow + 1) {
                  // 该拿大红包了
                  console.log('1该拿大红包了')
                  getBig()
                } else {
                  // 继续垫刀
                  console.log('继续1垫刀')
                  scape()
                }
              });
            });
          }
          console.log(numberNow)
        }
      );
    } else if (response.url().match('h5.ele.me/restapi/marketing/')) {
      console.log(response.url());
      response.text().then(
        (res)=>{
          console.log(res)
        }
      );
    } else if (response.url().match('https://shadow.elemecdn.com/crayfish/h5.ele.me/hongbao.js')) {
      console.log(response.url());
      response.text().then(
        (res)=>{
          console.log(res)
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

  await page.goto(url, {
          // 配置项
    waitUntil: 'networkidle2', // 等待网络状态为空闲的时候才继续执行
  });
}

function parseUrl(url_) {
  var array = url_.split("?")

  if (array.length == 1) {
    array = url_.split("#")
  }

  if (array.length == 2) {
    var array2 = array[1].split("&")
    for (var i = 0; i < array2.length; i++) {
      if (array2[i].indexOf("lucky_number") > -1) {
        var array3 = array2[i].split("=")
        return array3
      }
    }
  }
}

async function getBig() {

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
    value: userEntity[0].cookie,
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

          // await browser.close();

          console.log(res)
          var obj = JSON.parse(res)
          // 抢红包的人数
          var numberNow = obj.promotion_records.length
          connection.query('select ele_user.count from ele_user where ele_user.phone = ' + userEntity[0].phone, function (error, results, fields) {
            if (error) throw error;

            var newCount = results[0].count - 1
            connection.query('update ele_user set ele_user.count = ' + newCount + ' where ele_user.phone = ' + userEntity[0].phone, function (error_, results_, fields) {
              if (error_) throw error_;

              if (numberNow == luckyNumber) {
                // 已经没有最大红包的情况
                console.log('抢到大红包啦')
              } else {
                // 出问题啦
                console.log('出问题啦')
              }
            });
          });
          
          console.log(numberNow)
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

  await page.goto(url, {
          // 配置项
    waitUntil: 'networkidle2', // 等待网络状态为空闲的时候才继续执行
  });
}
