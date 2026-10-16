const tracks=Array.from({length:35},(_,i)=>i<17?21:i<24?19:i<30?18:17);
function ruler({left=0,right=480,first=left,align=0,tabs=[]}={}){const data=Buffer.alloc(27);data[0]=17;data.writeUInt16LE(left,1);data.writeUInt16LE(right,3);data.writeUInt16LE(first,21);data[23]=align;tabs.slice(0,8).forEach((t,i)=>data.writeUInt16LE(typeof t==='number'?t:t.position|(t.decimal?32768:0),5+i*2));return data;}
function page(text){return Buffer.concat([ruler(),Buffer.from([23,0,65,64]),Buffer.isBuffer(text)?text:Buffer.from(text,'ascii'),Buffer.from([0])]);}
function fixture({records=new Map([[0,page('A constructed geoWrite reader test.\rFirst page.\tTab preserved.')],[1,page('Second page.\rThe original image stays read only.')],[61,page('Sample header')],[62,page('Sample footer')]]),version='2.1',startPage=1}={}){
    const bytes=Buffer.alloc(174848);
    function sector(t,s){const offset=(tracks.slice(0,t-1).reduce((a,b)=>a+b,0)+s)*256;return bytes.subarray(offset,offset+256);}
    function text(block,offset,value,length){block.fill(160,offset,offset+length);Buffer.from(value).copy(block,offset);}
    const bam=sector(18,0);bam.set([18,1,65]);text(bam,144,'READER TEST',16);text(bam,173,'GEOS format V1.0',16);
    for(let t=1;t<=35;t++){bam[t*4]=tracks[t-1];for(let s=0;s<tracks[t-1];s++)bam[t*4+1+Math.floor(s/8)]|=1<<(s%8);}
    function used(t,s){bam[t*4]--;bam[t*4+1+Math.floor(s/8)]&=~(1<<(s%8));}
    for(const [t,s] of [[18,0],[18,1],[1,0],[1,1]])used(t,s);
    const dir=sector(18,1);dir.set([0,255,131,1,0]);text(dir,5,'READ ME',16);dir.set([1,1,1,7,86,5,10,12,34],21);
    const header=sector(1,1);header.set([0,255,3,21,191]);header[5]=255;header[137]=startPage&255;header[138]=startPage>>8;text(header,77,'Write Image V'+version,19);text(header,117,'geoWrite    V2.1',20);
    const index=sector(1,0);index.set([0,255]);for(let i=0;i<127;i++)index[3+i*2]=255;
    let track=1,number=2,blocks=2;const locations=new Map();
    function allocate(){if(number===tracks[track-1]){track++;number=0;}if(track===18){track++;number=0;}const pos=[track,number++];used(...pos);blocks++;return pos;}
    for(const [record,data] of records){
        const positions=Array.from({length:Math.max(1,Math.ceil(data.length/254))},allocate);locations.set(record,positions);index.set(positions[0],2+record*2);
        positions.forEach((pos,i)=>{const block=sector(...pos),chunk=data.subarray(i*254,(i+1)*254);block.set(i===positions.length-1?[0,chunk.length+1]:positions[i+1]);block.set(chunk,2);});
    }
    dir[30]=blocks&255;dir[31]=blocks>>8;return {bytes,sector,index,header,dir,locations};
}
module.exports={fixture,page,ruler};
