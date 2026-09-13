const state={subject:'a',time:'tw10'};
const names={a:'Subject A',b:'Subject B',c:'Subject C'};
const times={tw10:'Day 10',tw20:'Day 20',tw30:'Day 30'};
const baseline=document.querySelector('#baseline-image');
const real=document.querySelector('#real-image');
const simulated=document.querySelector('#sim-image');
const title=document.querySelector('#selection-title');
const compare=document.querySelector('#compare');
function setActive(selector,key,value){document.querySelectorAll(selector).forEach(button=>button.classList.toggle('active',button.dataset[key]===value));}
function update(){const root=`cases/${state.subject}-${state.time}`;baseline.src=`cases/${state.subject}-baseline.png`;baseline.alt=`Initial facial image for ${names[state.subject]}`;real.src=`${root}-real.png`;simulated.src=`${root}-simulated.png`;title.textContent=`${names[state.subject]} · ${times[state.time]}`;setActive('#subject-controls button','subject',state.subject);setActive('#time-controls button','time',state.time);}
document.querySelector('#subject-controls').addEventListener('click',e=>{if(!e.target.dataset.subject)return;state.subject=e.target.dataset.subject;update();});
document.querySelector('#time-controls').addEventListener('click',e=>{if(!e.target.dataset.time)return;state.time=e.target.dataset.time;update();});
document.querySelector('#comparison-slider').addEventListener('input',e=>compare.style.setProperty('--position',`${e.target.value}%`));
document.querySelector('#zoom').addEventListener('input',e=>{compare.style.setProperty('--zoom',e.target.value);document.querySelector('#zoom-value').value=`${Number(e.target.value).toFixed(1)}×`;});
compare.addEventListener('pointermove',e=>{const rect=compare.getBoundingClientRect();compare.style.setProperty('--origin-x',`${((e.clientX-rect.left)/rect.width)*100}%`);compare.style.setProperty('--origin-y',`${((e.clientY-rect.top)/rect.height)*100}%`);});
update();
