var express = require('express');
var bodyParser = require('body-parser');
var app     = express();
var fs      = require('fs');
var json2xls = require('json2xls');
var json2html = require('node-json2html');
const axios = require('axios');
const cheerio = require('cheerio');
var p

app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/', function(req, res) {
  p = req.body.name;
  const url = 'http://www.mca.gov.in/mcafoportal/companyMasterDataPopup.do?companyid='+p;
 

    axios(url).then(res => {
        const html = res.data;
        const $ = cheerio.load(html)

        const CompanyMasterData = [];
        const DirectorData =[];
        var only_din=[];

        const Charges =[];


        $("#resultsTab2 tr").each(function () {
        var resultsTab2 = $(this);
        CompanyMasterData.push({
        'Key': resultsTab2.find("td").first().text(),
        'value': resultsTab2.find("td").last().text()
        });
        });

        $("#resultsTab7 tr").each(function () {
          var resultsTab7 = $(this);
        DirectorData.push({
          'DIN': resultsTab7.find("td").first().text().trim(),
          'Name': resultsTab7.find("td").first().next().text(),
          'Date': resultsTab7.find("td").first().next().next().text()

          });
          only_din.push({
            'din': resultsTab7.find("td").first().text().trim(),
            'Name': resultsTab7.find("td").first().next().text()
          });

        });


        $("#resultsTab6 tr").each(function () {
          var resultsTab6 = $(this);
          Charges.push({
            'Assets_under_charge': resultsTab6.find("td").first().text().trim(),
            'Charge_Amount': resultsTab6.find("td").first().next().text(),
            'Date_Creation': resultsTab6.find("td").first().next().next().text(),
            'Date_Modification': resultsTab6.find("td").first().next().next().next().text(),
            'status': resultsTab6.find("td").first().next().next().next().next().text(),
          });
        });


        //on every entry if cin to empty the html file
        var tq =""
        fs.writeFile('trial.html',tq,function(err){ 
          console.log("new entry")
        })

        var companyName =[];
        Object.entries(CompanyMasterData).forEach((data, index) =>{
            if(index == 1) {
                    data.forEach((data1,index)=>{
                  this.companyName = data1["value"]
                })    
            }
            if(index == 2){
                  data.forEach((data,index)=>{
                      this.roccode = data["value"]
                  })
            }
        });
              
        console.log("roc",this.roccode);
        var dir = './Company_Data';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        var dir1 = './Company_Data/'+this.companyName;
        if (!fs.existsSync(dir1)){
            fs.mkdirSync(dir1);
        }
        var cin = json2xls(CompanyMasterData);
        fs.writeFileSync('./Company_Data/'+this.companyName+'/'+p+'.xlsx', cin, 'binary');

        var din = json2xls(DirectorData);
        fs.writeFileSync('./Company_Data/'+this.companyName+'/DIN.xlsx', din, 'binary');

        var charges = json2xls(Charges);
        fs.writeFileSync('./Company_Data/'+this.companyName+'/Charges.xlsx', charges, 'binary');
    


        var trans ={
          "<>":"option","type":"submit","value":"${Name}","target":"popup","id":"${din}"
          ,"html":"${din} - ${Name}"
          }
        
  
        var arr =['<body><p id="result"> <br/><h4>FOR CIN :',
          p,
          '</h4> <h4>Company Name :',
          this.companyName,
          '</h4> <h4>ROC Code  :',
          this.roccode,
          '</h4> </p> <br/><br/><form><fieldset><h4>Select DIN : </h4> <select id="country">',
          json2html.transform(only_din,trans),
          '</select><script>  ',
          "  window.onload = function() { if(!window.location.hash) { window.location = window.location + '#loaded'; window.location.reload()}};",
          'function GetSelectedText(){var e = document.getElementById("country");var result = e.options[e.selectedIndex].id; 				var result_id = e.options[e.selectedIndex].value; ',
          "var target = 'C:/Users/tarun/Desktop/skyrush/Company_Data/' + result_id;",
          '   window.open('
          ,"'http://www.mca.gov.in/mcafoportal/viewDirectorMasterData.do?din=' + result, 'popup', 'width=1200,height=700,scrollbars=no,resizable=no' );} ",
        '</script>  <br/><br/><button type="button" onclick="GetSelectedText();">  DIN Details</button></fieldset></form> ',
        '<div> C:/Users/tarun/Desktop/skyrush/Company_Data/',
        this.companyName,
        '</div></body>'];
  
   
  
        var prc = arr[0]+arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+arr[10]+arr[11]+arr[12]+arr[13]+arr[14]+arr[15]+arr[16]+arr[17]
          
            fs.appendFile('trial.html',prc,function(err){
              console.log("append data");
            })

    }).catch(console.error);

 
  res.sendfile("trial.html");
  res.setHeader("Refresh", 1);


});



  app.get('/',function(req,res) {
    res.sendfile('trial.html');
  });



app.listen(8080, function() {
  console.log('Server running at http://127.0.0.1:8080/');
});