/* 全局：暗色背景，白色文字，字体设置 */
body {
  margin: 0;
  padding: 0;
  text-align: center;
  font-family: 'Fredoka One', sans-serif; /* 可爱/粗体 */
  background-color: #111;  /* 深色 */
  color: #fff;            /* 文字白色 */
  min-height: 100vh;
}

/* 标题风格 */
h1, h2 {
  margin-top: 20px;
  color: #fff; /* 在暗色背景上显示 */
}

/* 统一页面容器的内边距 */
#login-page, #timer-page {
  padding: 10px 20px;
  max-width: 600px; /* 居中更美观 */
  margin: 0 auto;
}

/* 大按钮的通用风格（圆角、阴影） */
.large-btn {
  display: inline-block;
  padding: 15px 25px;
  border: none;
  font-size: 1rem;
  border-radius: 30px;
  cursor: pointer;
  margin: 10px 5px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: background-color 0.3s;
  color: #fff; /* 白字 */
}

/* 红色按钮 */
.red-btn {
  background-color: #D62B3C; /* Apple风格红 */
}
.red-btn:hover {
  background-color: #B22532;
}

/* 登录界面：孩子列表容器 */
#children-list {
  margin: 20px auto;
  max-width: 400px;
  text-align: left;
}

/* 孩子输入卡片 */
.child-entry {
  position: relative;
  background: #222; /* 稍浅一点的灰黑 */
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.5);
}

/* 输入框统一 */
.child-entry input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #333;
  color: #fff;
  font-family: 'Fredoka One', sans-serif;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #444;
  border: none;
  color: #fff;
  padding: 5px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
}
.delete-btn:hover {
  background-color: #666;
}

/* 计时器界面：头像容器 */
#avatars-container {
  margin: 20px;
}

/* 头像圆形卡片 */
.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 10px;
  display: inline-block;
  background-color: #333;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0,0,0,0.7);
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 皇冠图标：使用 icon.png 作为背景或 <img> */
.crown {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  display: none; /* 默认不显示 */
}

/* 可让 crown 里嵌一个 img，并限制大小 */
.crown img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 当前计时文字 */
#current-timer {
  margin-top: 20px;
  font-size: 1.4rem;
  color: #fff;
}

/* 总时长列表 */
#summary-list {
  margin-top: 10px;
  background: #222;
  display: inline-block;
  padding: 10px 20px;
  border-radius: 12px;
  text-align: left;
  box-shadow: 0 3px 6px rgba(0,0,0,0.5);
}

#summary-list p {
  margin: 5px 0;
  color: #fff;
}
