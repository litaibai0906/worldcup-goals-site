# 世界杯国家队进球工作台

这是一个纯静态网站，不需要安装 JavaScript 依赖或构建工具。网页和数据都在同一文件夹内。

排行榜可切换总进球和场均进球。场均榜默认至少比较10场的国家队，也可以调整门槛。队名默认归并有来源依据的拼写、简称和历史名称；逐场数据仍保留来源名称，并可切换查看。映射及依据可从页脚下载 `data/team_name_aliases.csv`。

“对阵比较”可选择或随机抽取两支国家队，对照世界杯交锋胜平负、累计进球和逐场比分。

“参赛队名单”按届次列出参赛国家队，可按队名搜索或按总进球排序；点击队名进入国家队档案，并查看该届阵容。档案页也可切换到该队其他届次的阵容。

阵容数据覆盖已结束的 1930–2022 年世界杯及 2026 年世界杯：历史名单来自 Fjelstul World Cup Database，2026 年名单来自本地 OpenFootball 数据。个别早期名单没有球衣号码，页面以“—”显示。

阵容下方的热区板块在 2018、2022 年展示基于 StatsBomb Open Data 射门事件的球场进球落点图，进攻方向统一朝右并汇总到 3×3 分区；乌龙球和点球大战不计入。StatsBomb 数据需保留其署名及标志。其他届次继续展示按 5 分钟区间汇总的进球时间分布。

## 本地运行

解压分享包后，在解压出的文件夹中运行：

```powershell
python -m http.server 8000
```

然后打开 `http://localhost:8000/`。如果电脑没有 Python，也可以将整个文件夹上传到支持静态网站的托管服务。

## 发布到 GitHub Pages

项目的 Pages 发布目录是 `outputs/worldcup-pages-publish`。该目录含站点文件和 GitHub Actions 工作流。把该目录内容推送到仓库根目录后，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。之后每次推送 `main` 都会触发部署。

网页从 `data/worldcup.json.gz` 读取压缩数据；`data/worldcup.json` 是未压缩的可下载副本。队名字段 `country` 使用标准名称，`country_source` 保存来源原名。请保留 `data` 文件夹结构。数据来源和许可信息记录在 JSON 文件及项目的 `data/README.md` 中。
