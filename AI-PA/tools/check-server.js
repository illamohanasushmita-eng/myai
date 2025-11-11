const http = require('http');
const urls = ['http://localhost:9002/','http://127.0.0.1:9002/','http://[::1]:9002/'];
(async ()=>{
  for(const u of urls){
    console.log('\nTRY',u);
    await new Promise(resolve=>{
      const req = http.get(u, res=>{
        console.log('STATUS', res.statusCode);
        let d='';
        res.on('data', c=> d+=c);
        res.on('end', ()=>{ console.log('BODY_START', d.slice(0,800)); resolve(); });
      }).on('error', e=>{ console.log('ERR', e.message); resolve(); });
      req.setTimeout(10000, ()=>{ console.log('TIMEOUT'); req.abort(); resolve(); });
    });
  }
})();
