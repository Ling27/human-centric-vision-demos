const sections=[...document.querySelectorAll('main section[id]')];
const links=[...document.querySelectorAll('.site-header nav a')];
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;links.forEach(link=>link.classList.toggle('active',link.hash===`#${visible.target.id}`));},{rootMargin:'-20% 0px -65%',threshold:[0,.2,.5]});
sections.forEach(section=>observer.observe(section));
