(async()=>{
 await new Promise(r=>setTimeout(r,1000));
 const cards=[...document.querySelectorAll('.location-callouts__card')].filter(e=>getComputedStyle(e).visibility==='visible');
 const overlaps=[];for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
 const a=cards[i].getBoundingClientRect(),b=cards[j].getBoundingClientRect();
 if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)overlaps.push([cards[i].textContent,cards[j].textContent]);}
 return {visibleLabels:cards.length,overlaps,placementEnabled:!!document.querySelector('.placement-panel')};
})()
