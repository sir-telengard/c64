// Construct local acceptance images; no original document/font data is bundled.
const fs=require('node:fs'),path=require('node:path');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const text=value=>Buffer.from(value,'ascii');
const font=(style=0,size=12)=>Buffer.from([23,128+size,0,style]);
const directory=path.resolve(__dirname,'../GEOS/research');
fs.mkdirSync(directory,{recursive:true});
for(const reserved of [true,false]){
    const headerHeight=reserved?80:0,footerHeight=reserved?60:0;
    const records=new Map([
        [0,page(Buffer.concat([font(),text('Body begins after the header area.\rScroll down to the footer area.')]))],
        [1,page(Buffer.concat([font(),text(Array.from({length:30},(_,i)=>'Line '+(i+1)+': This long paragraph wraps and makes the page overflow without clipping.').join('\r'))]))],
        [61,page(Buffer.concat([ruler({align:1}),font(64,10),text('HEADER - '+headerHeight+' DOTS')]))],
        [62,page(Buffer.concat([ruler({align:2}),font(16,10),text('FOOTER - '+footerHeight+' DOTS')]))]
    ]);
    const {bytes}=fixture({records,pageHeight:480,headerHeight,footerHeight});
    const filename=reserved?'geoWrite-section-height-demo.d64':'geoWrite-natural-sections-demo.d64';
    fs.writeFileSync(path.join(directory,filename),bytes);
    console.log(filename);
}
