'use strict';
const   fs = require("fs");
const osmosis = require('osmosis');
const {chain}  = require('stream-chain');

const url= "https://www.parliament-of-enterprises.eu/mepes/?ctr=&nace=&submit=Search+participants%C2%A0%C2%A0%E2%86%92";

const promises= [];
const pipes={};
  pipes['participants']=streamCSV('participant.csv');
  promises.push(new Promise((resolve, reject) => {
    pipes['participants'].on("close",() => {console.log("close");resolve});
  }));


scrape(url,(d)=>{
  pipes['participants'].write(d);
//  console.log(d);
})

Promise
  .all(promises)
  .then(() => { 
    console.log("aaa");
    for (var i in pipes) {
    console.log("closing")
      pipes[i].end(); //closing
    }
    console.log("all finished")
  });

function streamCSV(file){
  const head = "civility,participant,company,title,country,desc".split(",");
  const csvwriter = require('csv-write-stream')({separator:",",headers: head,sendHeaders:true});


  const pipeline = chain([
    csvwriter,
    fs.createWriteStream(file)
  ]);
  pipeline.on("close", () => console.log("close" +file));
  return pipeline;
};

function scrape(docurl,callback) {
return new Promise((resolve, reject) => {
  osmosis.get(docurl)
  .log(console.log)
.error(console.log)
//    .paginate('.ep_boxpaginate a#nav_next',1000)
    .find('tbody tr')
    .set({
      'civility':'th',
      'title':'td[0]',
      'participant':'td[1] strong',
      'title':'td[1]',
      'company':'td[2]',
      'desc':'img@title',
      'country':'td[3]',
    })
    .then((context, d) => {
      d.title=d.title.replace(d.participant,"");
      d.civility=d.civility.replace(".","");
//      console.log(d);
    })
    .data(callback)
    .done (d => {
      console.log("done");
      resolve(docurl);
    });
});
};
