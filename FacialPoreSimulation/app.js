const state={subject:'a',time:'tw10'};
const names={a:'Subject A',b:'Subject B',c:'Subject C'};
const times={tw10:'Day 10',tw20:'Day 20',tw30:'Day 30'};
const baseline=document.querySelector('#baseline-image');
const real=document.querySelector('#real-image');
const simulated=document.querySelector('#sim-image');
const title=document.querySelector('#selection-title');

function setActive(selector,key,value){document.querySelectorAll(selector).forEach(button=>button.classList.toggle('active',button.dataset[key]===value));}
function update(){const root=`cases/${state.subject}-${state.time}`;baseline.src=`cases/${state.subject}-baseline.png`;baseline.alt=`Initial facial image for ${names[state.subject]}`;real.src=`${root}-real.png`;real.alt=`Real observation for ${names[state.subject]} at ${times[state.time]}`;simulated.src=`${root}-simulated.png`;simulated.alt=`Simulated result for ${names[state.subject]} at ${times[state.time]}`;title.textContent=`${names[state.subject]} · ${times[state.time]}`;setActive('#subject-controls button','subject',state.subject);setActive('#time-controls button','time',state.time);}

function configureZoom(viewId,image,sliderId,outputId){const view=document.querySelector(viewId);const slider=document.querySelector(sliderId);const output=document.querySelector(outputId);let zoom=1;slider.addEventListener('input',()=>{zoom=Number(slider.value);image.style.transform=`scale(${zoom})`;output.value=`${zoom.toFixed(1)}×`;});view.addEventListener('dblclick',event=>{if(zoom===1)return;const rect=view.getBoundingClientRect();const x=((event.clientX-rect.left)/rect.width)*100;const y=((event.clientY-rect.top)/rect.height)*100;image.style.transformOrigin=`${x}% ${y}%`;});}

document.querySelector('#subject-controls').addEventListener('click',event=>{if(!event.target.dataset.subject)return;state.subject=event.target.dataset.subject;update();});
document.querySelector('#time-controls').addEventListener('click',event=>{if(!event.target.dataset.time)return;state.time=event.target.dataset.time;update();});
configureZoom('#baseline-view',baseline,'#baseline-zoom','#baseline-zoom-value');
configureZoom('#real-view',real,'#real-zoom','#real-zoom-value');
configureZoom('#sim-view',simulated,'#sim-zoom','#sim-zoom-value');
update();
