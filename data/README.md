# 世界杯网站数据说明

## 来源

世界杯比赛与球员进球事件来自[OpenFootball World Cup JSON](https://github.com/openfootball/worldcup.json)，包括各届 `worldcup-full.json` 逐场文件。来源仓库使用[CC0 1.0许可](https://github.com/openfootball/worldcup.json/blob/master/LICENSE.md)。

- 获取日期：2026-11-24。
- 原始归档：[下载地址](https://codeload.github.com/openfootball/worldcup.json/zip/refs/heads/master)。
- 归档SHA-256：`FC22075F06C1808B85FCCD81031C31D9070D18795DD547D1493EF8DD4CD19757`。

## 队名

网站数据中的 `country` 使用标准队名，`country_source` 保留数据源写法。网页默认合并有依据的拼写、简称或历史名称差异。具体映射、理由和依据见 `team_name_aliases.csv`。德国、西德和东德在默认分析中保持分开。

## 国家队进球

进球包含加时赛，不包含点球大战罚球。累计榜反映总进球；场均榜以国家队比赛场数作分母，默认至少参加10场，并可调整门槛。每届参赛队数和场均进球的对照只是描述性结果，不能据此推断扩军造成了进球变化。

## 球员进球

射手榜只纳入进球事件数与比赛最终比分逐队相符的比赛。当前23届、1,068场均通过核对。点球算作球员进球并单独标记；乌龙球归入乌龙球数量，不计入进球员进球。来源没有稳定球员ID，程序只统一空格、Unicode写法和大小写；姓名的重音、拼写差异或同名情况仍可能影响球员合并。

`player_goal_summary.csv` 是全届次汇总，`player_goal_summary_by_edition.csv` 是逐届汇总。完整逐球事件表保存在项目处理目录；网站只下载射手汇总表。
