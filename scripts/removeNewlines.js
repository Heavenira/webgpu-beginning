const fs = require('fs');
const path = require('path');

const filePath = path.join('dist', 'main.js');

fs.readFile(filePath, 'utf8', function(err, data){
    if (err){
        return console.log(err);
    }
    let result = data.replace(/\n/g, '\\n');
    result = result.replace(/\\n$/, '');


    fs.writeFile(filePath, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});