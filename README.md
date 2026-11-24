# 世界杯国家队进球工作台

这是一个纯静态网站，不需要安装 JavaScript 依赖或构建工具。网页和数据都在同一文件夹内。

## 本地运行

解压分享包后，在解压出的文件夹中运行：

```powershell
python -m http.server 8000
```

然后打开 `http://localhost:8000/`。如果电脑没有 Python，也可以将整个文件夹上传到支持静态网站的托管服务。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个仓库，并将本文件夹中的全部文件上传到仓库根目录。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`，然后保存。
4. 等待 GitHub Pages 完成发布；仓库的 Pages 页面会显示可分享的网址。

网页从 `data/worldcup.json.gz` 读取压缩数据；`data/worldcup.json` 是未压缩的可下载副本。请保留 `data` 文件夹结构。数据来源和许可信息记录在 JSON 文件及项目的 `data/README.md` 中。
