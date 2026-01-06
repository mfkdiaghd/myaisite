
# 🚀 程序员高效部署指南 (Git + Cloudflare Pages)

本项目专为快速部署和持续集成设计，推荐使用 Git 管理代码。

### 1. 本地初始化与推送
在您的项目根目录下运行：

```bash
# 初始化并提交
git init
git add .
git commit -m "feat: 初始版本 - 文本与语音聊天功能"

# 关联 GitHub (请替换为您自己的仓库地址)
git remote add origin https://github.com/您的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 2. Cloudflare Pages 持续部署 (CI/CD)
1. 登录 Cloudflare 控制面板，选择 **Workers & Pages**。
2. 点击 **Connect to Git** 并选择您的仓库。
3. **构建配置**：
   - 框架预设 (Framework preset): `None`
   - 构建命令 (Build command): `(留空)`
   - 输出目录 (Build output directory): `.`
4. **注入 API Key**：
   - 在 **Environment Variables** 中添加 `API_KEY`。

### 3. 日常更新流程
以后您只需修改本地代码，然后运行：
```bash
git add .
git commit -m "描述您的修改"
git push
```
Cloudflare 会**全自动**为您部署新版本，无需手动上传。

---
**官方导航站**: [https://guolaimoni.dpdns.org](https://guolaimoni.dpdns.org)
