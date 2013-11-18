var express     = require('express')
  , formidable  = require('formidable')
  , fs          = require('fs')
  , path        = require('path')
  , app         = express()
  , storedFiles = [];

app.get('/', function(req, res) {
  res.send([
    '<p><a href="/files">Show Files</a></p>'
  , '<form method="post" enctype="multipart/form-data">'
  , '<p>Image: <input type="file" name="image" /></p>'
  , '<p><input type="submit" value="Upload" /></p>'
  , '</form>'
  ].join(''));
});

app.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();

  // Use cloud storage if possible; default to the current working directory.
  form.uploadDir = process.env.CLOUD_DIR || __dirname;
  form.keepExtensions = true;

  form.parse(req, function(err, fields, files) {
    //
    // Grab the temp name of the file. Just store it in an array, but this
    //    be persisted in a db or the directory should be parsed and the array
    //    populated with existing files on module load.
    //

    var bits = files.image.path.split('/')
      , name = bits[bits.length - 1];

    storedFiles.push(name);
    res.redirect('/files');
  });
});

app.get('/files/:uri?', function(req, res) {
  if (req.params.uri) {
    //
    // Read the file as a stream and pipe the data directly to the response
    //    which will use less memory.
    //

    // Read from the cloud storage location if the path exists.
    var file = process.env.CLOUD_DIR ? fs.createReadStream(path.resolve(process.env.CLOUD_DIR, req.params.uri))
      : fs.createReadStream(path.resolve(__dirname, req.params.uri));

    res.header('Content-Type', 'image/' + path.extname(req.params.uri).split('.')[1]);

    file.pipe(res);
  } else {
    var out = '<p><a href="/">Home</a></p>';

    for (var i = 0; i < storedFiles.length; i++) {
      out += '<p><a href="/files/' + storedFiles[i] + '">' + storedFiles[i] + '</a></p>';
    }

    res.send(out);
  }
});

app.listen(process.env.PORT || 3000);
