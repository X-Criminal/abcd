var superagent = require("superagent");//请求页面
var cheerio = require("cheerio");//抓取页面
var url = require("url")
var async = require("async");//线程控制器

var cnodeUrl  = "https://cnodejs.org";


class start {
    constructor( data ){
        this.data =data;
    }

    init(){
        let _this = this;
        setInterval(function(){
            superagent.get(cnodeUrl)
                .end((err,res)=> {  //请求页面
                    var topicUrls =[]; // 保存链接
                    if (err) throw err; // 返回常规错误
                    var $ = cheerio.load(res.text);//通过cheerio 解析页面（类似jq操作）
                    $('#topic_list .topic_title').each((idx, element) => { //获取指定标签下数据并遍历
                        let $element = $(element);//保存节点
                        let href = url.resolve(cnodeUrl, $element.attr('href'));//获取节点链接
                        topicUrls.push(href);//保存链接
                    });
                    async.mapLimit(topicUrls,5,(url,callback )=>{//线程控制，1：传输数据，2：线程并发数量，3:传输回调(3.1传入链接，3.2完成后回调  )
                        fet(url,callback);
                    },(err,result)=>{//result  所有任务完成后返回数据
                        _this.data=result
                    });
                });
        },1000*60*5)

    }

}

let fet = (url,callback) => {
    superagent.get(url).end( (err,res)=>{//依次获取页面
        let $ = cheerio.load(res.text);//解析页面
        let text={
            title : $('.topic_title').text(),
            href: cnodeUrl + $('.topic_title').attr("href"),
            img: $(".user_avatar img, .user_big_avatar img").attr("src"),
            username: $(".user_avatar img, .user_big_avatar img").attr("title")
        };//获取需要数据
        callback(null,text)//返回数据
    });
};


exports.start = new  start()

