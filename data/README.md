# 世界杯网站数据说明

## 来源

世界杯比赛与球员进球事件来自[OpenFootball World Cup JSON](https://github.com/openfootball/worldcup.json)，包括各届 `worldcup-full.json` 逐场文件。来源仓库使用[CC0 1.0许可](https://github.com/openfootball/worldcup.json/blob/master/LICENSE.md)。

- 获取日期：2026-11-24。
- 原始归档：[下载地址](https://codeload.github.com/openfootball/worldcup.json/zip/refs/heads/master)。
- 归档SHA-256：`FC22075F06C1808B85FCCD81031C31D9070D18795DD547D1493EF8DD4CD19757`。

## 队名

网站数据中的 `country` 使用标准队名，`country_source` 保留数据源写法。网页默认合并有依据的拼写、简称或历史名称差异。具体映射、理由和依据见 `team_name_aliases.csv`。德国、西德和东德在默认分析中保持分开。

`worldcup.json` 的 `license` 字段提示许可因数据集而异，具体许可见同文件的 `licenses` 对象以及下文来源说明。

## 国家队进球

进球包含加时赛，不包含点球大战罚球。累计榜反映总进球；场均榜以国家队比赛场数作分母，默认至少参加10场，并可调整门槛。每届参赛队数和场均进球的对照只是描述性结果，不能据此推断扩军造成了进球变化。

逐场数据同时保留比赛日期、阶段、轮次、双方名称和比分；“对阵比较”按一支球队的比赛视角筛选，避免把同一场交锋重复计算。

## 球员进球

射手榜只纳入进球事件数与比赛最终比分逐队相符的比赛。当前23届、1,068场均通过核对。点球算作球员进球并单独标记；乌龙球归入乌龙球数量，不计入进球员进球。来源没有稳定球员ID，程序只统一空格、Unicode写法和大小写；姓名的重音、拼写差异或同名情况仍可能影响球员合并。

`player_goal_summary.csv` 是全届次汇总，`player_goal_summary_by_edition.csv` 是逐届汇总。完整逐球事件表保存在项目处理目录；网站只下载射手汇总表。

球员表在英文姓名旁附常用中文译名；本页可下载 `player_name_translations.csv` 查看映射。未映射的球员仍显示来源英文名。

## 国家队阵容

网站档案页提供逐届国家队名单。1930–2022 年名单取自 Joshua C. Fjelstul 的 [Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup)，使用项目本地保存的 `data/raw/fjelstul_worldcup_squads.csv`。该数据库版权声明为 © 2023 Joshua C. Fjelstul, Ph.D.，采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode)；网站数据保留该署名和许可。项目筛选出男子世界杯届次，并按比赛数据的国家队名称整理队名；名单中的球员、号码和位置沿用来源记录，早期赛事的号码缺失时显示为空。

2026 年名单取自本地保存的 [OpenFootball World Cup JSON](https://github.com/openfootball/worldcup.json) `2026/worldcup.squads.json`，遵循该仓库的 CC0 1.0 许可。网站把这些来源名单队名映射到项目使用的国家队名称，并与历史名单合并；德国、西德、东德等历史队名仍分别保留。

## 进球时间热区

没有可用射门落点坐标的届次，网站档案页仍按 5 分钟区间汇总进球分钟；半场补时并入该半场末段，加时赛单独显示。

## 射门进球落点

2018、2022 年世界杯的射门事件与落点坐标来自 [StatsBomb Open Data](https://github.com/hudl/open-data)。按该数据仓库的要求，发布分析时署名 StatsBomb 并展示其官方标志；网站图表已保留标志和来源链接。网站只发布整理后的 3×3 分区计数，不发布原始事件文件。

生成脚本 `scripts/build_worldcup_goal_position_maps.py` 下载 FIFA World Cup competition 43 的 season 3（2018）和 season 106（2022）比赛事件，将射门终点所在球门用于统一进攻方向，并按纵深与横向位置汇总进球射门。地图计数与项目逐球记录中的射手进球数对照；乌龙球没有可归属给进球国家队的射门落点，且点球大战不计入。每张图标注实际有坐标的射门进球数；未覆盖的届次沿用进球时间热区。
