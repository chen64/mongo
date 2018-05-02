var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var request = require("request");

var db = require("./models");
var PORT = 3000;
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newscrape";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.get("/", function(req, res){
    var hbsObject = {userData:"data"};
    res.render("index", hbsObject);
    console.log(hbsObject)
})

app.get("/scrape", function(req, res) {
    request("http://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article").each(function(i, element) {
        var result = {};
        var title = $(element).children(".story-heading").text();
        var link = $(element).children(".story-heading").children().attr("href");
        var summary = $(element).children("p.summary").text();
        // result.title = $(this).children("h2 a").text();
        // result.link = $(this).children("h2 a").attr("href");
        // result.summary = $(this).children("p").text();
        result.title = title;
        result.link = link;
        result.summary = summary;

        db.Article.create(result)
        .then(function(dbArticle) {
            console.log(dbArticle);
        })
        .catch(function(err) {
            return res.json(err);
        });
    });
    res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            var object = {articles: dbArticle}
            res.render("index", object);
            //res.json(dbArticle)
        })
        .catch(function(err){
            res.json(err);
        })
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
