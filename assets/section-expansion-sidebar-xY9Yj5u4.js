import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              *//* empty css                          */function s(){const n=document.getElementById("expandSidebar");if(n){n.style.display="block";const t=document.getElementById("sidebarClose");t&&t.addEventListener("click",c),document.querySelectorAll(".expand-suggestion__action").forEach(e=>{e.addEventListener("click",d)})}}function c(){const n=document.getElementById("expandSidebar");n&&(n.style.display="none")}function d(n){const t=n.target,i=t.getAttribute("data-type"),e=t.getAttribute("data-id");i==="fact"?l(e):i==="section"&&r(e),p(`Added ${i}: ${e}`),t.textContent="Added",t.disabled=!0,t.style.opacity="0.6"}function l(n){const i=document.getElementById("articleBody").querySelector(".article-section .article-section__content");if(!i)return;let e="";switch(n){case"harvard":e=" She joined Harvard University as a postdoctoral fellow in 2018.";break;case"caltech":e=" In 2019, she became an assistant professor at the California Institute of Technology.";break}if(e){const o=document.createElement("span");o.className="fact-highlight",o.textContent=e,o.style.backgroundColor="#fffacd",o.style.padding="2px 4px",o.style.borderRadius="2px";const a=i.querySelector("p:last-child");a&&a.appendChild(o)}}function r(n){const t=document.getElementById("newSectionsContainer")||document.getElementById("articleBody");if(!t)return;let i={};switch(n){case"awards":i={title:"Awards and honors",content:"<p>Recognition and achievements in the field of computer science and imaging:</p><ul><li>BBC 100 Women (2019)</li><li>Sloan Research Fellowship (2024)</li></ul>"};break;case"works":i={title:"Notable works",content:"<p>Key publications and contributions:</p><ul><li>CHIRP algorithm for black hole imaging</li><li>Event Horizon Telescope project contributions</li></ul>"};break}if(i.title){const e=document.createElement("section");e.className="article-section article-section--new",e.style.backgroundColor="#f8f9fa",e.style.border="1px solid #a2a9b1",e.style.borderRadius="4px",e.style.padding="16px",e.style.margin="16px 0",e.innerHTML=`
            <h2 class="article-section__title">${i.title}</h2>
            <div class="article-section__content">
                ${i.content}
            </div>
        `,t.appendChild(e)}}function p(n){const t=document.createElement("div");t.className="success-feedback",t.textContent=`✓ ${n}`,t.style.cssText=`
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        background: #00af89;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
        z-index: 1000;
        animation: fadeInOut 3s ease;
    `,document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}window.showExpandSidebar=s;window.hideExpandSidebar=c;
