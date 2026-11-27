# 世界杯国家队进球工作台

这是一个纯静态网站，不需要安装 JavaScript 依赖或构建工具。网页和数据都在同一文件夹内。

排行榜可切换总进球和场均进球。场均榜默认至少比较10场的国家队，也可以调整门槛。队名默认归并有来源依据的拼写、简称和历史名称；逐场数据仍保留来源名称，并可切换查看。映射及依据可从页脚下载 `data/team_name_aliases.csv`。

点击排行榜或热图中的国家队可查看国家队档案，并在档案中切换该队每届世界杯阵容。阵容数据覆盖已结束的 1930–2022 年世界杯及 2026 年世界杯：历史名单来自 Fjelstul World Cup Database，2026 年名单来自本地 OpenFootball 数据。早期名单缺少球衣号码时，页面显示“—”。

阵容下方的进球时间热区图按 5 分钟区间显示该队当届进球的比赛时间分布。逐球数据没有球场射门坐标，因此图表不表示球场落点。

## 本地运行

解压分享包后，在解压出的文件夹中运行：

```powershell
python -m http.server 8000
```

然后打开 `http://localhost:8000/`。如果电脑没有 Python，也可以将整个文件夹上传到支持静态网站的托管服务。

## 发布到 GitHub Pages

项目的 Pages 发布目录是 `outputs/worldcup-pages-publish`。该目录含站点文件和 GitHub Actions 工作流。把该目录内容推送到仓库根目录后，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。之后每次推送 `main` 都会触发部署。

网页从 `data/worldcup.json.gz` 读取压缩数据；`data/worldcup.json` 是未压缩的可下载副本。队名字段 `country` 使用标准名称，`country_source` 保存来源原名。请保留 `data` 文件夹结构。数据来源和许可信息记录在 JSON 文件及项目的 `data/README.md` 中。
