const t={main:"index.js",source:{"index.js":`import i from"varhub:rpc";import c from"varhub:room";import g from"varhub:players";var l=new g(c,(t,e)=>e?String(e):void 0),o=new i({},{height:0,data:[]});i.default.setState({win:null,x:null,o:null,turn:null});function h(t){let e={...i.default.state,...t};i.default.setState(e)}function d(){for(let t of l)t.setTeam(void 0);h({x:null,o:null,turn:null,win:null}),o.setState({height:0,data:[]})}l.on("offline",t=>t.kick());l.on("leave",t=>{t.team&&d()});function p(t){return t==="x"?"o":t==="o"?"x":null}var x=[[0,1],[1,1],[1,0],[1,-1]];function b(t,e,a){let s=E(o.state.data,t,e,a,4);if(!s)return!1;let w={x:"X",o:"O"}[a],f=o.state.data.map(n=>[...n]);for(let[n,u]of s)f[n][u]=w;return o.setState(n=>({...n,data:f})),h({win:a,turn:null}),!0}function E(t,e,a,s,w){let f=[];for(let n of x){let u=[],r=[e,a];for(;t[r[0]]?.[r[1]]===s;)u.push(r),r=[r[0]+n[0],r[1]+n[1]];for(r=[e-n[0],a-n[1]];t[r[0]]?.[r[1]]===s;)u.push(r),r=[r[0]-n[0],r[1]-n[1]];u.length>=w&&f.push(...u)}return f.length===0?null:f}function k(t){let e=l.get(this);if(!e)throw new Error("wrong state");if(t!=="x"&&t!=="o")throw new Error("wrong team");if(l.getTeam(t).size)throw new Error("team is taken");e.setTeam(t),h({x:[...l.getTeam("x")][0]?.name??null,o:[...l.getTeam("o")][0]?.name??null,win:null,turn:null})}function P(t=o.state.data.length,e=o.state.height){if(!l.get(this)?.team)throw new Error("wrong group");if(i.default.state.turn!==null)throw new Error("wrong state");if(i.default.state.x==null||i.default.state.o==null)throw new Error("no players");if(!Number.isInteger(t))throw new Error("rows format");if(!Number.isInteger(e))throw new Error("height format");if(t<4||t>20)throw new Error("rows format");if(e<4||e>20)throw new Error("height format");o.setState({height:e,data:Array.from({length:t}).map(()=>[])}),h({win:null})}function v(t){let e=l.get(this);if(!e?.team)throw new Error("wrong group");let a=e.team;if(i.default.state.turn&&e.team!==i.default.state.turn)throw new Error("wrong group");if(i.default.state.win)throw new Error("wrong group");if(!Number.isInteger(t))throw new Error("wrong colNumber");if(t<0||t>=o.state.data.length)throw new Error("colNumber out of bounds");let s=o.state.data[t];if(s.length>=o.state.height)throw new Error("height out");o.setState(n=>({...n,data:n.data.map((u,r)=>r===t?[...u,a]:u)}));let w=o.state.data.some(({length:n})=>n<o.state.height);return b(t,s.length-1,a)||h({turn:w?p(a):null}),!0}var C=()=>o;export{C as Field,k as joinTeam,v as move,P as start};
`}},e="13a14690a955b37c8741d0a38343c304467960275f8e4e9c8a83ebec74b9133a";export{e as integrity,t as module};