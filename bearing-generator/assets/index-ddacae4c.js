var X=Object.defineProperty;var Y=(o,e,r)=>e in o?X(o,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[e]=r;var l=(o,e,r)=>(Y(o,typeof e!="symbol"?e+"":e,r),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();class I{constructor(e){l(this,"points");this.points=e.map(r=>r.clone())}}class z{constructor({x:e,y:r,z:t}){l(this,"x");l(this,"y");l(this,"z");this.x=e,this.y=r,this.z=t}clone(){return new z({x:this.x,y:this.y,z:this.z})}}class L{constructor({a:e,b:r,c:t}){l(this,"a");l(this,"b");l(this,"c");this.a=e,this.b=r,this.c=t}computeNormal(){const e=new z({x:this.b.x-this.a.x,y:this.b.y-this.a.y,z:this.b.z-this.a.z}),r=new z({x:this.c.x-this.a.x,y:this.c.y-this.a.y,z:this.c.z-this.a.z}),t=new z({x:e.y*r.z-e.z*r.y,y:e.z*r.x-e.x*r.z,z:e.x*r.y-e.y*r.x}),i=Math.sqrt(t.x*t.x+t.y*t.y+t.z*t.z);return t.x/=i,t.y/=i,t.z/=i,t}flip(){return new L({a:this.a.clone(),b:this.c.clone(),c:this.b.clone()})}}function n(o,e){return new z({x:o,y:0,z:e})}class W{constructor({innerDiameter:e,innerZ:r,outerDiameter:t,outerZ:i,direction:a}){l(this,"innerDiameter");l(this,"innerZ");l(this,"outerDiameter");l(this,"outerZ");l(this,"direction");this.innerDiameter=e,this.innerZ=r,this.outerDiameter=t,this.outerZ=i,this.direction=a}getTriangles(){let e=E(this.innerDiameter,this.innerZ),r=E(this.outerDiameter,this.outerZ);this.direction&&([e,r]=[r,e]);const t=[];for(let i=0;i<C;i++){const a=[e[i],e[(i+1)%C],r[i],r[(i+1)%C]];t.push(new L({a:a[0],b:a[1],c:a[2]})),t.push(new L({a:a[1],b:a[3],c:a[2]}))}return t}}const C=300,k=[];for(let o=0;o<C;o++){const e=o*2*Math.PI/C;k.push(new z({x:Math.cos(e),y:Math.sin(e),z:0}))}function E(o,e){return k.map(r=>new z({x:r.x*o/2,y:r.y*o/2,z:e}))}function O(o){let e=[];for(let t=0;t<o.points.length;t++){const i=o.points[t],a=o.points[(t+1)%o.points.length];e.push(new W({innerDiameter:i.x*2,innerZ:i.z,outerDiameter:a.x*2,outerZ:a.z,direction:!1}))}let r=[];for(let t=0;t<e.length;t++)r=r.concat(e[t].getTriangles());return r}const R=1,d=.5,x=2,H=1.25;class V{constructor({outerDiameter:e,boreDiameter:r,width:t,clearance:i}){l(this,"outerDiameter");l(this,"boreDiameter");l(this,"width");l(this,"clearance");this.outerDiameter=e,this.boreDiameter=r,this.width=t,this.clearance=i}get sliderInnerDiameter(){return this.boreDiameter+(this.outerDiameter-this.boreDiameter)/3}get sliderOuterDiameter(){return this.boreDiameter+2*(this.outerDiameter-this.boreDiameter)/3}getTriangles(){return[...this.getTrianglesForInnerRing(),...this.getTrianglesForSlider(),...this.getTrianglesForOuterRing()]}trianglesWithMirroredBottom(e){const r=e.map(t=>(t=t.flip(),t.a.z=this.width-t.a.z,t.b.z=this.width-t.b.z,t.c.z=this.width-t.c.z,t));return[...e,...r]}getTrianglesForInnerRing(){return O(this.innerRingPolygon)}get innerRingPolygon(){let e=this.boreDiameter/2,r=this.sliderInnerDiameter/2-this.clearance,t=r-R;return new I([n(e,0),n(r,0),n(r,d),n(t,d+x),n(t,this.width-d-x),n(r,this.width-d),n(r,this.width),n(e,this.width)])}getTrianglesForSlider(){return O(this.sliderPolygon)}get sliderPolygon(){const e=this.sliderInnerDiameter/2,r=e-R,t=this.sliderOuterDiameter/2,i=t+R;return new I([n(e,0),n(t,0),n(t,d),n(i,d+x),n(i,this.width-d-x),n(t,this.width-d),n(t,this.width),n(e,this.width),n(e,this.width-d),n(r,this.width-d-x),n(r,d+x),n(e,d)])}getTrianglesForOuterRing(){return O(this.outerRingPolygon)}get outerRingPolygon(){const e=this.sliderOuterDiameter/2+this.clearance,r=e+R;return new I([n(this.outerDiameter/2,0),n(this.outerDiameter/2,this.width),n(e,this.width),n(e,this.width-d),n(r,this.width-d-x),n(r,d+x),n(e,d),n(e,0)])}drawPreview(e){let r=this.innerRingPolygon,t=this.sliderPolygon,i=this.outerRingPolygon;const a=[r,t,i],c=Math.max(...a.map(p=>p.points.reduce((u,m)=>Math.max(u,m.x),-1/0))),b=-c,h=Math.min(...a.map(p=>p.points.reduce((u,m)=>Math.min(u,m.z),1/0))),f=Math.max(...a.map(p=>p.points.reduce((u,m)=>Math.max(u,m.z),-1/0))),y=e.width,w=e.height,D=y/(c-b),T=w/(f-h),S=Math.min(D,T)*.8,M=y/2-(c+b)/2*S,v=w/2-(f+h)/2*S,g=p=>n(p.x*S+M,p.z*S+v),s=e.getContext("2d");s.clearRect(0,0,y,w),s.fillStyle="rgba(0, 0, 0, 1)",s.fillRect(0,0,y,w);const U=g(n(-this.boreDiameter/2,0)),$=g(n(this.boreDiameter/2,0)),P=s.createLinearGradient(U.x,0,$.x,0),Z="rgba(206, 207, 176, 1)",B="rgba(102, 102, 69, 1)";P.addColorStop(0,B),P.addColorStop(.45,Z),P.addColorStop(.55,Z),P.addColorStop(1,B),s.fillStyle=P,s.fillRect(g(n(b,h)).x,g(n(b,h)).z,g(n(c,f)).x-g(n(b,h)).x,g(n(c,f)).z-g(n(b,h)).z);const q=g(n(b,h)),j=g(n(c,f)),F=s.createLinearGradient(q.x,q.z,j.x,q.z);F.addColorStop(0,"rgba(255, 200, 90, 1)"),F.addColorStop(.5,"rgba(240, 229, 200, 1)"),F.addColorStop(1,"rgba(226, 194, 100, 1)"),s.fillStyle=F;for(const p of a){const u=p.points.map(g);s.beginPath(),s.moveTo(u[0].x,u[0].z);for(const m of u.slice(1))s.lineTo(m.x,m.z);s.closePath(),s.fill()}for(const p of a){const u=p.points.map(m=>{const A=g(m);return n(y-A.x,A.z)});s.beginPath(),s.moveTo(u[0].x,u[0].z);for(const m of u.slice(1))s.lineTo(m.x,m.z);s.closePath(),s.fill()}}get fileName(){const e=r=>r.toFixed(2).replace(/\.?0*$/,"");return`bearing-${e(this.boreDiameter)}-${e(this.outerDiameter)}-${e(this.width)}-${e(this.clearance)}.stl`}validate(){if(this.boreDiameter>=this.sliderInnerDiameter-H*2-this.clearance*2)throw new Error("Bore diameter is too large for the outer diameter")}}function J(o){const i=84+o.length*50,a=new Uint8Array(i),c=new DataView(a.buffer);for(let h=0;h<80;h++)a[h]=0;const b=o.length;c.setInt32(80,b,!0);for(let h=0;h<o.length;h++){const f=o[h],y=f.computeNormal(),w=f.a,D=f.b,T=f.c,S=80+4+h*50,M=[y.x,y.y,y.z,w.x,w.y,w.z,D.x,D.y,D.z,T.x,T.y,T.z];for(let v=0;v<M.length;v++)c.setFloat32(S+v*4,M[v],!0)}return a}function K(){let o=N(),e=o.getTriangles();const r=J(e);let t=document.createElement("a");t.download=o.fileName;let i=new Blob([r],{type:"application/octet-stream"});t.href=URL.createObjectURL(i),t.click()}function G(){let o=N(),e=document.querySelector("#preview");o.drawPreview(e)}function Q(){let o=N();try{o.validate(),document.querySelector("#error").textContent=""}catch(e){e instanceof Error?document.querySelector("#error").textContent=e.message:document.querySelector("#error").textContent="Unknown error"}}function N(){let o=parseFloat(document.querySelector("#outer-diameter").value),e=parseFloat(document.querySelector("#bore-diameter").value),r=parseFloat(document.querySelector("#width").value),t=parseFloat(document.querySelector("#clearance").value);return new V({outerDiameter:o,boreDiameter:e,width:r,clearance:t})}const _=""+new URL("hero-dc47a0e6.jpg",import.meta.url).href;document.querySelector("#app").innerHTML=`
    <header style="margin-bottom:0; padding-bottom:0;">
      <h1> Bearing Generator </h1>
    </header>
    <form>
    <p>
    <img src="${_}" alt="A 608 bearing printed in place" style="width:30%;float:right;margin-left:10px;border-radius:8px">
    This is an STL generator for simple print-in-place bearings. The bearings are made of
    three interlocked rings which can slide past each other to reduce friction.
    </p><p>
    Fill out the form below and click "Generate" to download the STL file.
    For example, the defaults produce a standard 608 (i.e. skateboard) bearing.
    </p>
    
    <p>
    This design is surprisingly effective, and very fast to print. These bearings aren't terribly strong,
    of course, but for low load applications that don't need super low friction, they're great.
    </p>
    <section>
    <table>
      <tr>
        <td>
          <label for="outer-diameter">Outer diameter (mm)</label>
          <input type="number" id="outer-diameter" name="outer-diameter" value="22" step="0.1" min="10" max="1000" required>
        </td>
        <td>
          <label for="bore-diameter">Bore diameter (mm)</label>
          <input type="number" id="bore-diameter" name="bore-diameter" value="8" step="0.1" min="1" max="1000" required>
        </td>
        <td>
          <label for="width">Width (mm)</label>
          <input type="number" id="width" name="width" value="7" step="0.1" min="6" max="1000" required>
        </td>
        <td>
          <label for="clearance">Clearance (mm)</label>
          <input type="number" id="clearance" name="clearance" value="0.3" step="0.1" min="0" max=".5" required>
        </td>
      </tr>
    </table>
    </section>
    <br>
    <section>
      <figure>
      <figcaption>Cross section <span id="error" style="color:red;font-weight:bold;"></span></figcaption>
      <canvas id="preview" width="600" height="300" style="max-width: 100%"></canvas>
      </figure>
    </section>
    <section>
    <button type="button" id="generate">Download STL</button>
    </section>
    <article>
      <h2>Other stuff</h2>
      <ul>
        <li>Print these in place in exactly the arrangement that they're saved in. Don't separate the rings before printing, or you won't be able to put them together.</li>
        <li>A clearance of 0.3mm is a good tradeoff between ease of print and smoothness of operation.</li>
        <li>
          For smaller bearings, I recommend printing entirely as vertical walls rather than worrying about infill.
          Just set the walls to "100", for example. This will make the bearing stronger, and it's still very
          fast to print, since every layer will just be made up of circles.
        </li>
        <li>
          These are pretty smooth as printed, but a little grease will help them work even more smoothly.
        </li>
        <li>
          The generator is licensed under the MIT license. I doubt that I have any rights over the generated STLs, but just for clarity,
          I release all rights to them.
        </li>
    </article>
  </form>
`;document.querySelector("#generate").addEventListener("click",()=>{K()});document.querySelectorAll("#app input").forEach(o=>{o.addEventListener("change",()=>{let e=r=>{let t=document.querySelector(r),i=parseFloat(t.min),a=parseFloat(t.max),c=t.valueAsNumber;c<i?t.value=i.toString():c>a&&(t.value=a.toString())};e("#outer-diameter"),e("#bore-diameter"),e("#width"),e("#clearance"),Q(),G()})});G();
