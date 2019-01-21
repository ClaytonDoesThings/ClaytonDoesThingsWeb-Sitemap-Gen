var fs = require('fs');
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");
var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'claytondoesthingsxyz.appspot.com'
});

var bucket = admin.storage().bucket();
var db = admin.firestore();

var calls = 0;
var completedCalls = 0;

var url = "https://claytondoesthings.xyz/";

currentXML = (
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
  "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
);

// map root

addUrl({
  loc: url,
  changefreq: "monthly",
  priority: 1
});

// map sub pages

addUrl({
  loc: (url + "games/"),
  changefreq: "weekly",
  priority: "0.9"
});

// map games
mapGameSoftware("games");

// map softwares
calls++;
db.collection("softwares").get().then((softwareQuery) => {
  softwareQuery.forEach((softwareSnapshot) => {
    addUrl({
      loc: (url + "software/" + softwareSnapshot.id + "/"),
      changefreq: "weekly",
      priority: "0.8"
    });

    calls++;
    db.collection("softwares").doc(softwareSnapshot.id).collection("platforms").get().then((platformQuery) => {
      platformQuery.forEach((platform) => {
        addUrl({
          loc: (url + "software/" + softwareSnapshot.id + "/" + platform.data().name + "/"),
          changefreq: "weekly",
          priority: "0.7"
        });

        calls++;
        db.collection("softwares").doc(softwareSnapshot.id).collection("platforms").doc(platform.id).collection("versions").get().then((versionQuery) => {
          versionQuery.forEach((version) => {
            addUrl({
              loc: (url + "software/" + softwareSnapshot.id + "/" + platform.data().name + "/" + version.data().name),
              changefreq: "yearly",
              priority: "0.6"
            })
          });
          checkFinishXML();
        });
      });
      checkFinishXML();
    });
  });
  checkFinishXML();
});

function addUrl(options) {
  currentXML += " <url>\n";
  for (var option in options) {
    currentXML += ("   <" + option + ">" + options[option] + "</" + option + ">\n");
  }
  currentXML += " </url>\n";
}

function checkFinishXML() {
  completedCalls++;
  console.log("calls: " + calls + " completedCalls: " + completedCalls);
  if (calls === completedCalls) {
    currentXML += "</urlset>";
    console.log(currentXML);
    fs.writeFile('./sitemap.xml', currentXML, (err) => {
      bucket.upload('./sitemap.xml', {destination: '/sitemap.xml'}, (err, file, apiResponse) => {
        console.log(err, file, apiResponse);
      });
    })
  }
}

function mapGameSoftware(theOne) {
  calls++;
  db.collection(theOne).get().then((gameQuery) => {
    gameQuery.forEach((gameSnapshot) => {
      addUrl({
        loc: (url + theOne + "/" + gameSnapshot.id + "/"),
        changefreq: "weekly",
        priority: "0.8"
      });

      calls++;
      db.collection(theOne).doc(gameSnapshot.id).collection("platforms").get().then((platformQuery) => {
        platformQuery.forEach((platform) => {
          addUrl({
            loc: (url + theOne + "/" + gameSnapshot.id + "/" + platform.data().name + "/"),
            changefreq: "weekly",
            priority: "0.7"
          });

          calls++;
          db.collection(theOne).doc(gameSnapshot.id).collection("platforms").doc(platform.id).collection("versions").get().then((versionQuery) => {
            versionQuery.forEach((version) => {
              addUrl({
                loc: (url + theOne + "/" + gameSnapshot.id + "/" + platform.data().name + "/" + version.data().name),
                changefreq: "yearly",
                priority: "0.6"
              })
            });
            checkFinishXML();
          });
        });
        checkFinishXML();
      });
    });
    checkFinishXML();
  });
}