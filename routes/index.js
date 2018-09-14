var express = require('express');
var superagent=require("superagent");
var cheerio=require("cheerio");
var router = express.Router();
let db = require('../model/db'); 


const prefix_url = 'https://www.qichacha.com/g_SC_';
const basic_url= 'https://www.qichacha.com';


//插入测试
router.get('/dbtest',function(req, res){
    let project = {project_name: 'test', create_time: '2017-03-28 14:09:29'};
    let sqlString = 'INSERT INTO project SET ?';
    let connection = db.connection();
    db.insert(connection, sqlString, project, function(id){
        console.log('inserted id is:' + id);
    });
    db.close(connection);
    return;
});

/* GET home page. */
router.get('/', function(req, res, next) {

	let items = [];
	let name,add,is;
	let complete_url;
	for(let i=1;i<=500;i++){

		complete_url = prefix_url+i+'.html';
		console.log('完整URL:',complete_url);

		superagent.get(complete_url).end((err, sres) => {
			if(err){
				next(err);
			}
			$ = cheerio.load(sres.text);
			$('.panel.panel-default').each(function(idx,element){
				add = $(element).find('.text-muted.clear.text-ellipsis.m-t-xs').eq(1).text().trim()	;
				if(add.indexOf('广安')>=-1){
					console.log(items,is,add);
					name = $(element).find('.name').text();
					items.push({name,add});
				}
			});//end $...element
		});//end superagent.=>{}
		
	} //end for

	setTimeout(function(){
		res.send(items);
	},60000)
	
  
});

module.exports = router;
