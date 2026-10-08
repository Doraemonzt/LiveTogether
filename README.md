# 同一现场
QQ 音乐演唱会共创社区的独立黑客松原型。React + Vinext，Cloudflare D1 保存记录，R2 保存视频。

## 启动
Node.js 22.13+。首次运行 npm ci，然后 npm run dev，默认 http://127.0.0.1:5173 。
数据库首次初始化：npm run db:generate（已有迁移无需重复生成）；npm run build；node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_light_umar.sql
新增场次表需执行一次：node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_damp_storm.sql
本地数据库与上传位于忽略的 .wrangler/state。不要删除此目录以免丢失本地记录。

## 验证
node node_modules/typescript/bin/tsc --noEmit
node --test tests/domain.test.ts
npm run build

## AI 配置
复制 .env.example 到 .env，设置 OPENAI_API_KEY 和可选 OPENAI_MODEL（默认 gpt-4.1-mini）。部署环境将密钥保存在 Sites 环境变量中，不提交 Git。
上传页从视频抽取三张代表画面，服务端调用 Responses API 返回可编辑视角、内容标签与说明。未配置密钥会明确提示不可用，并允许手动发布。

## 功能
- 歌单采用五位歌手的真实作品；薛之谦真实记录沿用用户提供的本地素材，不提供网络现场入口或外链播放器。
- 紫黑舞台主题首页按歌手、城市、搜索及近 30 天/全部历史组合筛选；近期按上海时区的演出时间倒序，首页只展示明确归属的演出场次。预置 5 位歌手（周杰伦、薛之谦、林俊杰、邓紫棋、汪苏泷）的头像与巡演名称、6 个演示场次，保留一个空场次。
- 场次默认展示横向视频列表，可筛选歌曲/环节、视角，按最新或喜欢数排序。列表仅加载封面；从详情返回保留本次首页筛选和滚动位置。
- 上传支持下拉选择社区已有场次，或填写歌手、演唱会、城市、场馆、日期和时间自建场次。场次和首条视频在同一数据库事务发布，取消不会创建空场次；同一歌手/城市/场馆/日期/时间归入同一个场次。新场次通过 `/api/state` 提供给所有用户，刷新和直达链接均可恢复。
- 两个连续日期，独立歌单与视频归档；歌曲多选、其他环节、自定义待确认歌曲。
- 示例视角切换按演唱时间映射；不同场次、不同歌曲、未分段视频不可连续切换。
- 25 MB 以内 MP4/WebM/MOV 上传，浏览器验证可解码后保存至 R2；查看、编辑归属、贡献卡。
- 按歌曲/视角去重的 9 格拼图；点赞、收藏、时间评论、彩蛋建议与上传者确认、举报保存。
- 手机和桌面响应式布局，WebMCP 场次导航。
- 本地数据与线上演示数据相互独立，发布不会搬运本地上传。

## 演示边界
这是拟新增功能概念，未接入 QQ 音乐账户或平台。歌手及巡演名称采用可核实信息；歌曲采用真实作品；日期、场馆与歌曲编排为演示数据；预置视频为同一公共领域影像的三个裁切，用于演示同步交互，不是真实多机位。见 ATTRIBUTION.md。自动歌曲识别和自动跨视频对齐尚未实现。
用户新上传的视频未人工对齐，只作为相关片段，不加入同步切换。
当前为私有演示站，不是完整公众社区运营系统；举报仅记录，未接入审核运营后台。


## 多歌曲视频拆分
上传选择「按单首歌曲拆分」，浏览器分析音频能量，提出停顿分界候选。用户可手动添加或调整时间、填写歌曲名，确认后生成真正的独立 WebM/MP4 文件，逐段预览并批量发布。自动分析不识别歌名，掌声和串烧需要手动调整。分析限 15 分钟；最多 8 段，原视频和单个输出仍限 25 MB。本地重新编码耗时约等于片段总时长，需保持页面前台；不修改原文件。WebM 时长元数据用 fix-webm-duration 修复。
批量接口先验证全部资产和歌曲归属，再用 D1 batch 原子写入。客户端保留已上传资产，批次 ID 支持重复请求，避免重复记录。拆分片段未自动与其他观众对齐，不加入连续视角组。

## GitHub Pages 展示版
运行 `npm run build:pages` 生成 `dist-pages`，部署到 `/LiveTogether/`。该版本使用预置数据，不连接后端、不保存互动；完整版本仍使用 `npm run dev`。
