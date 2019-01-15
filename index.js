var gcloud = require('gcloud');

var storage = gcloud.storage({
  projectId: 'claytondoesthingsxyz',
  keyFilename: 'service-account-credentials.json'
});

var bucket = storage.bucket('claytondoesthingsxyz.appspot.com');