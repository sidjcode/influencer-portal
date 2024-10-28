"use strict";(()=>{var e={};e.id=507,e.ids=[507],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},2161:(e,t,n)=>{n.r(t),n.d(t,{config:()=>l,default:()=>s,routeModule:()=>d});var o={};n.r(o),n.d(o,{default:()=>a});var r=n(1802),i=n(7153),u=n(6249);async function a(e,t){let{videoId:n}=e.query;if(!n)return t.status(400).json({error:"Video ID is required"});let o=process.env.GOOGLE_API_KEY;if(!o)return t.status(500).json({error:"Google API key not configured"});let r=`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${n}&key=${o}`;try{let e=await fetch(r);if(!e.ok)throw Error(`YouTube API responded with status ${e.status}`);let o=await e.json();if(!o.items||0===o.items.length)return t.status(404).json({error:"Video not found"});let{snippet:i,statistics:u}=o.items[0],a={youtubeId:n,title:i.title,channelTitle:i.channelTitle,channelId:i.channelId,postDate:i.publishedAt,thumbnail:i.thumbnails.high.url,viewCount:u.viewCount,likeCount:u.likeCount,commentCount:u.commentCount};t.status(200).json(a)}catch(e){console.error("Error fetching YouTube data:",e),t.status(500).json({error:"Error fetching YouTube data"})}}let s=(0,u.l)(o,"default"),l=(0,u.l)(o,"config"),d=new r.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/googledata",pathname:"/api/googledata",bundlePath:"",filename:""},userland:o})},7153:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},1802:(e,t,n)=>{e.exports=n(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var n=t(t.s=2161);module.exports=n})();