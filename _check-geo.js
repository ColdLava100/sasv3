var fs = require("fs");
var h = fs.readFileSync("D:\\KPM\\1 Studies\\Sem 8\\SAS BASIC MODULE 1\\studyslide\\sasv3\\quizzes\\geo-maps.html", "utf8");
var regex = /<div class="quiz-q">([\s\S]*?<div[^>]*class="quiz-answer"[^>]*>[\s\S]*?<\/div>\s*<\/div>)/g;
var match;
var total = 0, missing = 0;
while ((match = regex.exec(h)) !== null) {
  total++;
  if (match[1].indexOf("data-correct") === -1) {
    missing++;
    var strong = match[1].match(/\u2705\s*<strong>([^<]+)<\//);
    console.log("Missing: " + (strong ? strong[1] : "?"));
  }
}
console.log("Total: " + total + ", Missing: " + missing);
