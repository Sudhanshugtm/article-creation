import"./modulepreload-polyfill-B5Qt9EMX.js";import"./ve-reading-script-C64JI2pR.js";let c=!1;function o(){if(c)return;if(!document.getElementById("smartWidget")){setTimeout(o,100);return}const e=document.getElementById("smartWidgetTrigger");e&&e.addEventListener("click",d),c=!0}function d(){const n=document.getElementById("expandSidebar");if(n){n.style.display="block";const e=document.getElementById("sidebarClose");e&&e.addEventListener("click",l),document.querySelectorAll(".expand-suggestion__action").forEach(t=>{t.addEventListener("click",r)})}}function l(){const n=document.getElementById("expandSidebar");n&&(n.style.display="none")}function r(n){const e=n.target,i=e.getAttribute("data-type"),t=e.getAttribute("data-id");i==="fact"?u(t):i==="section"&&p(t),f(`Added ${i}: ${t}`),e.textContent="Added",e.disabled=!0,e.style.opacity="0.6"}function u(n){if(!isEditMode||!quill){const i=document.getElementById("articleBody").querySelector(".article-section .article-section__content");if(!i)return;let t="";switch(n){case"harvard":t=" She joined Harvard University as a postdoctoral fellow in 2018.";break;case"caltech":t=" In 2019, she became an assistant professor at the California Institute of Technology.";break}if(t){const a=document.createElement("span");a.className="fact-highlight",a.textContent=t,a.style.backgroundColor="#fffacd",a.style.padding="2px 4px",a.style.borderRadius="2px";const s=i.querySelector("p:last-child");s&&s.appendChild(a)}}else{const e=quill.getLength();let i="";switch(n){case"harvard":i=" She joined Harvard University as a postdoctoral fellow in 2018.";break;case"caltech":i=" In 2019, she became an assistant professor at the California Institute of Technology.";break}i&&quill.insertText(e-1,i)}}function p(n){const e=document.getElementById("articleBody");let i={};switch(n){case"awards":i={title:"Awards and honors",content:"<p>Recognition and achievements in the field of computer science and imaging:</p><ul><li>BBC 100 Women (2019)</li><li>Sloan Research Fellowship (2024)</li></ul>"};break;case"works":i={title:"Notable works",content:"<p>Key publications and contributions:</p><ul><li>CHIRP algorithm for black hole imaging</li><li>Event Horizon Telescope project contributions</li></ul>"};break}if(i.title){const t=document.createElement("section");t.className="article-section article-section--new",t.style.backgroundColor="#f8f9fa",t.style.border="1px solid #a2a9b1",t.style.borderRadius="4px",t.style.padding="16px",t.style.margin="16px 0",t.innerHTML=`
            <h2 class="article-section__title">${i.title}</h2>
            <div class="article-section__content">
                ${i.content}
            </div>
        `,e.appendChild(t)}}function f(n){const e=document.createElement("div");e.className="success-feedback",e.textContent=`✓ ${n}`,e.style.cssText=`
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
    `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}document.addEventListener("DOMContentLoaded",function(){o(),setTimeout(o,500)});window.initializeSidebar=o;window.showExpandSidebar=d;window.hideExpandSidebar=l;
