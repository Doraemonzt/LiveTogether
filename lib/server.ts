import {env} from "cloudflare:workers";
export function database(){if(!env.DB)throw new Error("数据服务尚未连接，请稍后重试");return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error("视频存储尚未连接，请稍后重试");return env.BUCKET;}
export function identity(req:Request){return req.headers.get("oai-authenticated-user-id")||req.headers.get("cookie")?.match(/(?:^|; )stage_user=([a-f0-9-]{36})(?:;|$)/)?.[1]||null;}
export function requireUser(req:Request){const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)throw new Error("请求来源不匹配");const user=identity(req);if(!user)throw new Error("请刷新页面后重试");return user;}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{"Cache-Control":"no-store"}});}

