var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')
var movies = []

var requstMovie = function(url){
    request(url, function(error, response, body){
        if (error === null && response.statusCode === 200){
            var e = cheerio.load(body)  //使用cheerio来解析body（网页内容），提取我们想要的信息
            var movieDiv = e('.item')   //通过分析网页结构，我们发现豆瓣每部电影都通过item属性隔开
            for (let i = 0; i < movieDiv.length; i++) {
                let movieInfo = takeMovie(movieDiv[i])
                console.log('正在爬取' + movieInfo.name)
                movies.push(movieInfo)
            }
            //判断movies数量
            if (movies.length === 250){
            	//通过sort将数组内每两个元素放入比较函数
                var sortM = movies.sort(sortMovie('id'))
                //保存文件
                saveMovie(sortM)
            }
        } else {
            console.log('爬取失败', error)
        }
    })
}

//电影的类
var movie = function(){
    this.id = 0
    this.name = ''
    this.score = 0
    this.pic = ''
}

var takeMovie = function(div){
    var e = cheerio.load(div)
    //将类初始化
    var m = new movie()
    m.name = e('.title').text()
    m.score = e('.rating_num').text()
    var pic = e('.pic')
    //cheerio如果要提取某个属性的内容，可以通过attr()
    m.pic = pic.find('img').attr('src')
    m.id = pic.find('em').text()
    return m
}

var top250Url = function(){
    let l = ['https://movie.douban.com/top250']
    var urlContinue = 'https://movie.douban.com/top250?start='
    let cont = 25
    for (let i = 0; i < 10; i++) {
        l.push(urlContinue+cont)
        cont += 25
    }
    return l
}

//爬取所有网页
var main = function(){
    var url = top250Url()
    for (let i = 0; i < url.length; i++) {
        requstMovie(url[i])
    }
}

var sortMovie = function(id){
    return function(obj ,obj1){
        var value = obj[id]
        var value1 = obj1[id]
        return value - value1
    }
}

//保存文件
var saveMovie = function(movies){
    var path = './movie.txt'
    var data = JSON.stringify(movies, null, 2)
    fs.appendFile(path, data, function(error){
        if(error == null){
            console.log('保存成功！')
        } else {
            console.log('保存失败',error)
        }
    })
}

main()

