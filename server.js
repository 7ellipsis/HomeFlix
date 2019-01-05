const express=require('express');
const PouchDB=require('pouchdb');
const fs=require('fs');
const path=require('path');
const app=express();
var http=require('http').Server(app);
var imgbuffer=[];
var vidbuffer={};
var auxilary=['<html>','<head>','<title>Video stream sample</title>','<style>html,body{font-size:0;margin:0%}</style>','<script src="http://code.jquery.com/jquery-latest.min.js"></script>','<script>(function(){})();</script>','</head>','<body>','</body>','</html>'];
var cuts=[];
var flag=false;
const pp=__dirname+'/assets/image';
var bodyParser = require('body-parser');
var db = new PouchDB('users');
var ip_address=""; //FILL THIS.
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static(__dirname+'/assets/image'));
app.use(express.static(__dirname+'/static'));
app.use(express.static(__dirname+'/assets/video'));
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/login.html');
    flag=true;
   
});
app.get('/log',(req,res)=>{
    res.sendFile(__dirname + '/login.html')
})
app.post('/login',(req,res)=>{
    
    var a = req.body.userName;
      var b= req.body.password;
      var c= req.body.type;
      console.log(a+" "+b+" "+c)
      if(c=="login")
      {
db.get(a).then((doc)=>{
    if(b!=doc.password)
    {
        res.writeHead(400);
        res.end("error");
    }
    else{
        res.writeHead(200);
        res.end("success");
    console.log(doc);}
    }).catch((err)=>{console.log(err);res.writeHead(401); res.end("error")});
      }
      if(c=="sign")
      {
       db.put({
           _id:a,
           password:b
       }).then((resp)=>{console.log(resp);res.writeHead(200);flag=true;
        res.end("success");}).catch((err)=>{console.log(err);res.writeHead(400);res.end("error")})
      }
})
app.get('/signup',(req,res)=>{
    res.sendFile(__dirname + '/signup.html')
    
})
app.get('/index',(req,res)=>{
    if(flag)
    res.sendFile(__dirname + '/index.html')
    else
    res.send("<h1>HOMEFLIX ACCESS DENIED</h1>")
})
app.get('/video/:name',(req,res)=>{
    if(flag)
    {
    var name=req.params.name;
    let ext=vidbuffer[name];
    const path='assets/video/'+name+ext;
    const stat=fs.statSync(path)
    const fileSize=stat.size;
    const range=req.headers.range 
    if(range)
    {
        const parts=range.replace(/bytes=/,"").split("-");  ///Range: bytes=0-1023 range is received like this
        const start=parseInt(parts[0],10)
        const end=parts[1]?parseInt(parts[1],10):fileSize-1
        const chunksize=(end-start)+1
        const file=fs.createReadStream(path,{start,end})
        const head={
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4/mkv',
        }
        res.writeHead(206,head)
        file.pipe(res)
    }
    else
    {
        const head={ 'Content-Length': fileSize,
        'Content-Type': 'video/mp4',}
        res.writeHead(200,head);
    fs.createReadStream(path).pipe(res)

    }
}
else
{
    res.send("<h1>HOMEFLIX ACCESS DENIED</h1>");
}
    })
    http.listen(3000,ip_address, function () {
        console.log('Listening on port 3000!')
        fs.readdirSync(pp).forEach((file)=>imgbuffer.push(path.basename(file)));
        fs.readdirSync(__dirname+'/assets/video').forEach((file)=>{
            let ee=path.basename(file).indexOf('.');
            let sub=path.basename(file).toString().substring('0',ee);
            let sub1=path.basename(file).toString().substring(ee,path.basename(file).length);
            vidbuffer[sub]=sub1;
        });
    fs.readFile(__dirname+'/index.html','utf8',(err,data)=>{
        cuts=data.split('\n');
        imgbuffer.forEach((item)=>{
            let aa=path.basename(item).indexOf('.');
            let ab=path.basename(item).toString().substring('0',aa);
            cuts.splice(5,0,"<span><a href=video/"+ab+"><img src="+item+" height='298px' width='14.27%'></a></span>");
        })
        fs.writeFileSync(__dirname+'/index.html',cuts.join('\n'));
                console.log(flag);
    });
      })
      http.close(()=>{
          fs.writeFileSync(__dirname+'/index.html',auxilary.join('\n'))
        });