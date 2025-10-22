// 体测数据管理平台类型定义

// 用户相关类型
export interface Teacher {
  teacherId: string
  username: string
  name: string
  schoolName: string
  schoolCode: string
  createTime: string
  lastLoginTime?: string
  status: 'active' | 'inactive'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  teacherInfo: Teacher
  schoolCode: string
  schoolName: string
}

// 学生相关类型
export interface Student {
  studentId: string
  studentNo: string
  name: string
  gender: '男' | '女'
  grade: string
  class: string
  schoolCode: string
  createTime: string
  updateTime: string
}

// 体测成绩类型
export interface TestScore {
  scoreId: string
  studentId: string
  academicYear: string
  height: number  // 身高(厘米)
  weight: number  // 体重(千克)
  vitalCapacity: number  // 肺活量(毫升)
  run50m: number  // 50米跑(秒)
  ropeSkipping1min: number  // 1分钟跳绳(次)
  sitUps1min?: number  // 1分钟仰卧起坐(次,仅女生)
  sitAndReach: number  // 坐位体前屈(厘米)
  standingJump: number  // 立定跳远(厘米)
  totalScore: number  // 总分
  gradeLevel: '优秀' | '良好' | '及格' | '不及格'
  createTime: string
  updateTime: string
  modifyCount: number
  // 关联学生信息
  student?: Student
}

// 体测成绩完整信息(包含学生信息)
export interface ScoreWithStudent extends TestScore {
  studentNo: string
  studentName: string
  gender: '男' | '女'
  grade: string
  class: string
}

// 统计数据类型
export interface Statistics {
  totalCount: number  // 总人数
  excellentCount: number  // 优秀人数
  goodCount: number  // 良好人数
  passCount: number  // 及格人数
  failCount: number  // 不及格人数
  passRate: number  // 合格率
  excellentRate: number  // 优良率
  averageScore: number  // 平均分
  gradeDistribution?: GradeDistribution[]  // 各年级分布
}

export interface GradeDistribution {
  grade: string
  totalCount: number
  passRate: number
  excellentRate: number
  averageScore: number
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应数据
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 成绩查询参数
export interface ScoreQueryParams extends PageParams {
  academicYear?: string
  grade?: string
  className?: string
  keyword?: string  // 学号/姓名搜索
  gradeLevel?: string  // 等级筛选
}

// 成绩更新参数
export interface ScoreUpdateParams {
  scoreId: string
  field: string
  value: number
}

// Excel导入参数
export interface ImportParams {
  file: File
  academicYear: string
  overwrite?: boolean
}

// Excel导入结果
export interface ImportResult {
  success: boolean
  successCount: number
  failCount: number
  errors?: ImportError[]
}

export interface ImportError {
  row: number
  field?: string
  message: string
}

// Excel导出参数
export interface ExportParams {
  academicYear: string
  grade?: string
  className?: string
  gradeLevel?: string
}

// Excel导入数据行
export interface ImportDataRow {
  学号: string
  姓名: string
  性别: string
  年级: string
  班级: string
  '身高(厘米)': number
  '体重(千克)': number
  '肺活量(毫升)': number
  '50米跑(秒)': number
  '1分钟跳绳(次)': number
  '1分钟仰卧起坐(次)'?: number
  '坐位体前屈(厘米)': number
  '立定跳远(厘米)': number
}

// 评分标准
export interface ScoreStandard {
  gender: '男' | '女'
  grade: string
  project: string
  standards: ScoreRange[]
}

export interface ScoreRange {
  min: number
  max: number
  score: number
}

// 筛选条件
export interface FilterOptions {
  academicYears: string[]
  grades: string[]
  classes: string[]
  gradeLevels: Array<{label: string, value: string}>
}
