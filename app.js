var http = require("http");
var express = require("express");
var superagent = require("superagent");//请求页面
var cheerio = require("cheerio");//抓取页面
var eventproxy = require("eventproxy");//并发控制器
var async = require("async");//线程控制器
var url = require("url");
var app  = express();

var  start = require("./src/home");
app.use(express.static('www'))


var cnodeUrl  = "https://cnodejs.org/";


app.get("/1",(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send(start.start.data)
})


let fet = (url,callback) => {
    superagent.get(url).end( (err,res)=>{//依次获取页面
         let $ = cheerio.load(res.text);//解析页面
         let text= $('.topic_full_title').text();//获取需要数据
        callback(null,text)//返回数据
    });
};




app.get("/2",(req,res,next)=>{
    superagent.get("https://cnodejs.org/").end((err,sres)=>{//获取页面
        if(err) return err;
        var $ = cheerio.load(sres.text);
        var items =[];
        $("#topic_list .topic_title").each((idx,element)=>{
            var $element = $(element);
            items.push({
                title:$element.attr("title"),
                href:$element.attr("href")
            });
        });
        res.send(items)
    });
});







app.get("/3",(req,res,next)=>{
let lres = res; //保存res
var cnodeUrl  = "https://cnodejs.org/";
superagent.get(cnodeUrl)
    .end((err,res)=>{// 获取页面
    if(err) throw err;
    var topicUrls =[];
    var $ = cheerio.load(res.text);//解析数据
    $('#topic_list .topic_title').each((idx,element)=>{
        var $element = $(element);
        var href = url.resolve(cnodeUrl,$element.attr('href'));
        topicUrls.push(href); //获取需要数据
    });

    let ep = new eventproxy( ); //创建eventproxy 实例
    ep.after("topic_html",topicUrls.length,(topics)=>{ //ep.after 1:监控事件名称，2：并发数量 3：回调 监控事件的接受的数据
        topics = topics.map(( topicPair )=>{
            var topicUrl =  topicPair[0];
            var topicHtml = topicPair[1];
            var $ = cheerio.load(topicHtml);
            return({
                title:$(".topic_full_title").text().trim(),
                href:topicUrl,
                comment1:$(".reply_content").eq(0).text().trim()
            });
        });
        lres.send(tem(topics))
    });

    topicUrls.forEach(( topicUrl )=>{
            superagent.get(topicUrl).end((err,res)=>{
                ep.emit("topic_html",[topicUrl,res.text]); //返回给after数据
            })
     });
});
});



app.listen(80,()=>{
    console.log("........");
});

let tem = ( data )=>{
    var html = '';
    for(let i = 0 ; i<data.length;i++){
           html+= "<div><h3>"+data[i]+"</h3> "+i+" </div>"
    }
    return html;
};