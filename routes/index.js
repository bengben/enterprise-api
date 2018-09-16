let express    = require('express');
let superagent = require("superagent");
let cheerio    = require("cheerio");
let router     = express.Router();
let db         = require('../model/db'); 

const prefix_url = 'https://www.qichacha.com/g_SC_';
const basic_url  = 'https://www.qichacha.com';



// p.then(doneCallbacks, failCallbacks)

//插入测试
router.get('/dbtest',function(req, res){
    let project    = {project_name: 'test', create_time: '2017-03-28 14:09:29'};
    let sqlString  = 'INSERT INTO project SET ?';
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
	let enterprise,address,name,create_date,money,tag,money_str,isgn,etp_obj,sql;
	let complete_url;
	let connection = db.connection();
	for(let i=1;i<=500;i++){

		complete_url = prefix_url+i+'.html';
		console.log('完整URL:',complete_url);
		superagent.get(complete_url).end((err, sres) => {
			if(err){
				next(err);
			}
			$ = cheerio.load(sres.text);
			
			$('.panel.panel-default').each(function(idx,element){
				address     = $(element).find('.text-muted.clear.text-ellipsis.m-t-xs').eq(1).text().trim();
				money_str   = $(element).find('.text-muted.clear.text-ellipsis.m-t-xs').eq(0).text().trim();
				enterprise  = $(element).find('.name').text();
				money_str   = money_str.replace('  \t\t\t\t\t\t\t\t   ','&');
				money_str   = money_str.replace(' \t\t\t\t\t\t\t\t ','&');
				money_str   = money_str.replace('万元人民币\t \n                                  ','&');
				money_arr   = money_str.split('&');
				name        = money_arr[0]; //法人
				create_date = money_arr[1]; //企业创建时间
				money       = money_arr[2]; //注册资金
				tag         = money_arr[3]; //企业类型
				isgn        = 0;
				if(address.indexOf('广安')>=0){
					isgn      = 1;
				}
				//items.push({enterprise,money,name,create_date,tag,address,isgn});
				etp_obj = {'enterprise':enterprise,'money':money,'name':name,'create_date':create_date,'tag':tag,'address':address,'isgn':isgn}
				sql 	  = 'INSERT INTO enterprise SET ?';
				db.insert(connection, sql, etp_obj, function(id){
        console.log('[ok] insert success :'+ id );
    });
			});//end $...element
			// console.log('cnt:',items.length);
			// db.close(connection);
		});//end superagent.=>{}
		
	} //end for
	// res.send(items);


	// setTimeout(function(){
	// 	res.send(items);
	// },3000)
	
  
});




module.exports = router;
