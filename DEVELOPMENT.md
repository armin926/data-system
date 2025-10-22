# 开发说明文档

## 后端API开发指南

本项目为前端应用,需要配合后端API使用。后端API需要实现以下接口:

### 1. 认证接口

#### 登录
```
POST /api/auth/login
Content-Type: application/json

请求体:
{
  "username": "teacher001",
  "password": "password123"
}

响应:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "teacherInfo": {
      "teacherId": "t001",
      "username": "teacher001",
      "name": "张老师",
      "schoolName": "XX小学",
      "schoolCode": "school001",
      "status": "active"
    },
    "schoolCode": "school001",
    "schoolName": "XX小学"
  }
}
```

#### 退出登录
```
POST /api/auth/logout
Authorization: Bearer {token}

响应:
{
  "success": true
}
```

### 2. 成绩管理接口

#### 查询成绩列表
```
GET /api/scores/list?page=1&pageSize=20&academicYear=2024-2025&grade=六年级
Authorization: Bearer {token}

响应:
{
  "success": true,
  "data": {
    "list": [
      {
        "scoreId": "s001",
        "studentId": "stu001",
        "studentNo": "2024001",
        "studentName": "张三",
        "gender": "男",
        "grade": "六年级",
        "class": "1班",
        "academicYear": "2024-2025",
        "height": 165.5,
        "weight": 52.3,
        "vitalCapacity": 2800,
        "run50m": 8.5,
        "ropeSkipping1min": 150,
        "sitUps1min": null,
        "sitAndReach": 12.5,
        "standingJump": 185,
        "totalScore": 85.6,
        "gradeLevel": "良好",
        "createTime": "2024-10-01T10:00:00Z",
        "updateTime": "2024-10-01T10:00:00Z",
        "modifyCount": 0
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 更新成绩
```
PUT /api/scores/update
Authorization: Bearer {token}
Content-Type: application/json

请求体:
{
  "scoreId": "s001",
  "field": "height",
  "value": 166.0
}

响应:
{
  "success": true,
  "data": {
    // 更新后的完整成绩记录
    "scoreId": "s001",
    "height": 166.0,
    "totalScore": 85.8,
    "gradeLevel": "良好",
    // ... 其他字段
  }
}
```

### 3. 导入接口

#### 上传Excel
```
POST /api/import/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

请求体:
- file: Excel文件
- academicYear: "2024-2025"
- overwrite: "false"

响应:
{
  "success": true,
  "data": {
    "success": true,
    "successCount": 95,
    "failCount": 5,
    "errors": [
      {
        "row": 10,
        "field": "height",
        "message": "身高数值超出范围"
      }
    ]
  }
}
```

### 4. 统计接口

#### 获取统计数据
```
GET /api/statistics/overview?academicYear=2024-2025&grade=六年级
Authorization: Bearer {token}

响应:
{
  "success": true,
  "data": {
    "totalCount": 100,
    "excellentCount": 15,
    "goodCount": 40,
    "passCount": 35,
    "failCount": 10,
    "passRate": 90.0,
    "excellentRate": 55.0,
    "averageScore": 75.5,
    "gradeDistribution": [
      {
        "grade": "一年级",
        "totalCount": 50,
        "passRate": 88.0,
        "excellentRate": 50.0,
        "averageScore": 72.3
      }
    ]
  }
}
```

## 数据库设计建议

### 教师表 (teachers)
```sql
CREATE TABLE teachers (
  teacher_id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  school_name VARCHAR(100) NOT NULL,
  school_code VARCHAR(50) NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  INDEX idx_school_code (school_code)
);
```

### 学生表 (students)
```sql
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_no VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  gender ENUM('男', '女') NOT NULL,
  grade VARCHAR(20) NOT NULL,
  class VARCHAR(20) NOT NULL,
  school_code VARCHAR(50) NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_school_student (school_code, student_no),
  INDEX idx_school_code (school_code)
);
```

### 体测成绩表 (test_scores)
```sql
CREATE TABLE test_scores (
  score_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  vital_capacity INT NOT NULL,
  run_50m DECIMAL(4,2) NOT NULL,
  rope_skipping_1min INT NOT NULL,
  sit_ups_1min INT,
  sit_and_reach DECIMAL(4,2) NOT NULL,
  standing_jump DECIMAL(5,2) NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modify_count INT DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE KEY uk_student_year (student_id, academic_year),
  INDEX idx_academic_year (academic_year),
  INDEX idx_grade_level (grade_level)
);
```

## Mock数据示例

在开发阶段,可以使用以下Mock数据进行测试:

### 教师账号
- 用户名: teacher001
- 密码: 123456
- 学校: XX小学
- 学校编码: school001

### 学生数据示例
可以使用Excel导入功能导入测试数据。

## 前端开发注意事项

### 1. 环境配置
- 开发环境API地址配置在 `.env.development`
- 生产环境API地址配置在 `.env.production`

### 2. 代码规范
- 使用TypeScript进行类型检查
- 组件使用Vue 3 Composition API
- 遵循ESLint规则

### 3. 状态管理
- 用户状态: `useUserStore`
- 成绩数据: `useScoreStore`
- 统计数据: `useStatisticsStore`

### 4. API调用
所有API调用统一使用 `src/api` 目录下的方法,已包含Token认证和错误处理。

### 5. 样式
- 全局样式在 `src/assets/styles/index.css`
- 组件样式使用scoped

## 部署说明

### 前端部署

1. 构建生产版本
```bash
npm run build
```

2. dist目录包含所有静态文件
3. 部署到Nginx或其他静态服务器
4. 配置反向代理转发API请求

### Nginx配置示例
```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://backend-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 常见问题

### 1. 跨域问题
开发环境可以在 `vite.config.ts` 中配置代理:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 2. Token过期处理
系统已自动处理Token过期,会重定向到登录页。

### 3. Excel导入失败
检查Excel格式是否符合模板要求,列名必须完全一致。

## 技术支持

如需技术支持,请联系开发团队。
