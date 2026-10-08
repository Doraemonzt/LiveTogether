# 素材与演示说明

## 歌手头像与巡演名称（2026-10-08 核对）

头像来自 QQ 音乐公开歌手资料图片，仅用于本地原型展示；版权归原权利人，不适用下述公共领域视频许可。保存在 `public/artists/`，每张 300 × 300 像素，五张合计约 112 KiB，同一文件复用于歌手入口和场次封面。

| 歌手 | 本地头像 | QQ 音乐图片来源 | 巡演名称核对来源 |
| --- | --- | --- | --- |
| 周杰伦 | jay-chou.jpg | https://y.gtimg.cn/music/photo_new/T001R300x300M0000025NhlN2yWrP4.jpg | [「嘉年华Ⅱ」世界巡回演唱会 / Ticketmaster](https://www.ticketmaster.com/jay-chou-tickets/artist/1260229) |
| 薛之谦 | joker-xue.jpg | https://y.gtimg.cn/music/photo_new/T001R300x300M000002J4UUk29y8BY.jpg | [「万兽之王」巡回演唱会 / 大连体育中心](https://www.dlsportscenter.com/index.php/article/show/id/3870/language/cn/) |
| 林俊杰 | jj-lin.jpg | https://y.gtimg.cn/music/photo_new/T001R300x300M000001BLpXF2DyJe2.jpg | [JJ20 FINAL LAP 世界巡回演唱会 / 艺人官网](https://www.jjlin.com/) |
| 邓紫棋 | gem.jpg | https://y.gtimg.cn/music/photo_new/T001R300x300M000001fNHEf1SFEFN.jpg | [I AM GLORIA 2.0 世界巡回演唱会 / 工作室公告](https://weibo.com/7055544327/QiXboxEii) |
| 汪苏泷 | silence-wang.jpg | https://y.gtimg.cn/music/photo_new/T001R300x300M000001z2JmX09LLgL.jpg | [「明日世界」世界巡回演唱会 / 北京市文化和旅游局](https://www.beijing.gov.cn/fwcj/calendar/whyc/6a697771f7a30c04dd36e1f6.html) |

林俊杰采用目前可核实的最近巡演名称，JJ20 FINAL LAP 已于 2025 年收官，不代表 2026 年的新巡演。既有 `joker-sample` 真实视频的巡演、日期、城市仍未确认，不归入「万兽之王」演示场次。视频发布者仍为观众身份，未将歌手标为视频上传作者。

## 场次与视频

### 真实曲目与本地现场（2026-10-08）

演示歌单使用真实作品，曲序并非实际巡演歌单：周杰伦《晴天》《稻香》《告白气球》《青花瓷》；薛之谦《演员》《天外来物》《认真的雪》；林俊杰《江南》《修炼爱情》《可惜没如果》；邓紫棋《光年之外》《泡沫》《倒数》；汪苏泷《有点甜》《不分手的恋爱》《一笑倾城》。既有用户上传的自填歌曲与视频归属保留，不从画面自动推断歌曲。

页面不提供网络现场入口或外链播放器。薛之谦使用用户已经提供的本地真实记录，歌名、日期及城市仍待确认。

- 首页采用五位真实歌手及可核实的巡演名称。六个场次的日期、场馆与歌曲编排均为演示配置；曲目采用歌手真实作品，不对应实际巡演行程。卡片封面使用歌手资料照片，不代表官方巡演海报。
- 本地预览默认使用 `*-lite.mp4` 轻量视频，保留时长及声音，最长边 480 像素、15 帧。

- 封面：Yvette de Wit，Unsplash，https://unsplash.com/photos/group-of-people-attending-a-performance-8XLapfNMW04 。按 Unsplash License 使用。
- 示例视频：U.S. Navy video by Petty Officer 2nd Class Eloise Johnson；Alien Ant Farm，NAS Sigonella，2025-07-03。来源 https://commons.wikimedia.org/wiki/File:InFocus-_Alien_Ant_Farm_Concert_(968945).webm ，页面标记美国联邦政府作品公共领域。
- 星港演艺中心等场馆为虚构演示数据，真实曲目的编排仅供演示，视频不对应页面中的艺人或巡演。视角按钮使用同一素材的不同裁切，展示时间同步交互，不宣称真实多机位录制。
- concert.jpg 仅为演出氛围示意。上传真实素材后，播放和归档使用用户上传的视频。
- AI 实现参考：https://developers.openai.com/api/docs/guides/images-vision 。需配置 OPENAI_API_KEY；无配置时返回明确不可用状态，不生成伪 AI 标签。


## 用户提供的现场素材
- 原始文件：薛之谦演唱会.mp4（用户提供用于本原型示例）。原文件未修改。
- public/joker-live.mp4：完整片段转码为 H.264/AAC，时长约 56.83 秒。
- public/joker-cover.jpg：从原视频 00:18 提取。
- 城市、日期、歌曲均待用户确认；未使用文件创建时间推断演出日期。仅展示一个实际拍摄视角，不参与对齐切换。
