var express = require('express');
var fs = require('fs');
var multipart = require('connect-multiparty');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var UserDrawingDB = (function () {
  var UserDrawingDB = {};

  UserDrawingDB.insert = (item) => {
    item.id = Date.now();
    fs.readFile(__dirname + '/public/imgData/userDrawing.json', 'utf8', (err, data) => {
      var json = JSON.parse(data),
          drawingLists = json.userDrawingLists;
      drawingLists.push(item);
      fs.writeFile(__dirname + '/public/imgData/userDrawing.json',
        JSON.stringify(json, null, '\t'), 'utf8', (err, data) => {
          //  ...
        });
    });
  };

  // UserDrawingDB.remove = (id) => {
  //   id = (typeof id === 'string') ? Number(id) : id;
  //   for (var i in storage) {
  //     if (storage[i].id == id) {
  //       storage.splice(i, 1);
  //       return true;
  //     }
  //   }
  //   return false;
  // };

  return UserDrawingDB;
})();

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(multipart({ uploadDir: __dirname + '/public/imgData' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan());
app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
  fs.readFile(__dirname + '/views/drawingApp.html', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.type('text/html').send(data);
    }
  });
});

app.get('/drawingList', (req, res) => {
  fs.readFile(__dirname + '/public/imgData/userDrawing.json', 'utf8', (err, data) => {
    var drawingLists = JSON.parse(data).userDrawingLists;
    res.send(drawingLists);
  });
});

app.get('/drawingList/:id', (req, res) => {
  fs.readFile(__dirname + '/public/imgData/userDrawing.json', 'utf8', (err, data) => {
    var drawingLists = JSON.parse(data).userDrawingLists;
    var id = req.params.id;
    if (id) {
      id = (typeof id === 'string') ? Number(id) : id;
      for (var i in drawingLists) {
        if (drawingLists[i].id == id) {
          res.send(drawingLists[i]);
        }
      }
    }
  });
});

app.get('/lookDrawings', (req, res) => {
  fs.readFile(__dirname + '/public/imgData/userDrawing.json', 'utf8', (err, data) => {
    var re = / /g,
        drawingLists = JSON.parse(data).userDrawingLists,
        imgList = "", i;
    for (i in drawingLists) {
      var url = drawingLists[i].url;
      var id = drawingLists[i].id;
      var newURL = drawingLists[i].url.replace(re, '+');
      imgList += `<img src="${newURL}">`;
    }
    res.type('text/html');
    res.send(imgList);
  });
});

app.post('/addDrawing', (req, res) => {
  var drawingUrl = req.body;
  if (drawingUrl) {
    UserDrawingDB.insert(drawingUrl);
  }
  res.redirect(303, '/lookDrawings');
});


app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("500 Server err");
});


app.listen(5555, () => {
  console.log("Express started on http://localhost:5555");
});
