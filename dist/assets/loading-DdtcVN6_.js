import{r as s,j as e}from"./index-CvzRfeox.js";const $=({color1:i,color2:u,color3:m,height:a,width:t})=>{const[r,l]=s.useState("scale-100"),[f,c]=s.useState("scale-100"),[d,n]=s.useState("scale-100");return s.useEffect(()=>{o();function o(){l("scale-150"),setTimeout(()=>{l("scale-100")},400),setTimeout(()=>{c("scale-150"),setTimeout(()=>{c("scale-100")},400)},350),setTimeout(()=>{n("scale-150"),setTimeout(()=>{n("scale-100")},400)},700)}setInterval(()=>{o()},1500)},[]),e.jsxs("div",{className:"w-fit p-3 flex gap-1",children:[e.jsx("style",{children:`
                    @Keyframes bouncescale{
                        0%, 80%, 100% {transform: scale(1);}
                        40% {transform: scale(1.5);}
                    }
                    .animate-bouncescale{
                        animation: bouncescale 1.5s infinite ease-in-out
                    }
                `}),e.jsx("div",{className:`${a} ${t} ${i} rounded-full  animate-bouncescale`,style:{animationDelay:"0s"}}),e.jsx("div",{className:`${a} ${t} ${u} rounded-full animate-bouncescale`,style:{animationDelay:"0.3s"}}),e.jsx("div",{className:`${a} ${t} ${m} rounded-full animate-bouncescale`,style:{animationDelay:"0.6s"}})]})};export{$ as L};
