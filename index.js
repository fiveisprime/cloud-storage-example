var express     = require('express')
  , formidable  = require('formidable')
  , fs          = require('fs')
  , path        = require('path')
  , app         = express()
  , storedFiles = [];

//
// Serve the cloud storage contents.
//
app.use('/files', express.static(process.env.CLOUD_DIR || __dirname));

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

//
// Show a list of uploaded files.
//
app.get('/files', function(req, res) {
  var out = '<p><a href="/">Home</a></p>';

  for (var i = 0; i < storedFiles.length; i++) {
    out += '<p><a href="/files/' + storedFiles[i] + '">' + storedFiles[i] + '</a></p>';
  }

  res.send(out);
});

app.listen(process.env.PORT || 3000);
