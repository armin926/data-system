// 评分计算工具函数
// 根据国家2014版体测标准进行评分计算

/**
 * 根据性别、年级和项目成绩计算单项得分
 * 注: 这是简化版本,实际应该从数据库或配置文件读取完整的评分标准表
 */
export function calculateItemScore(
  gender: '男' | '女',
  grade: string,
  project: string,
  value: number
): number {
  // TODO: 实际应该根据国家2014版标准进行精确计算
  // 这里提供一个简化的示例逻辑
  
  // 返回0-100的分数
  // 实际实现需要根据标准表查找对应的分值
  
  return Math.min(100, Math.max(0, value))
}

/**
 * 计算BMI指数
 */
export function calculateBMI(height: number, weight: number): number {
  // BMI = 体重(kg) / (身高(m))^2
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * 计算总分
 * 各项目权重根据国家标准设定
 */
export function calculateTotalScore(scores: {
  bmiScore: number
  vitalCapacityScore: number
  run50mScore: number
  ropeSkippingScore: number
  sitUpsScore?: number
  sitAndReachScore: number
  standingJumpScore: number
}): number {
  // 简化的权重计算
  // 实际权重应该根据国家标准配置
  const weights = {
    bmi: 0.15,  // 15%
    vitalCapacity: 0.15,  // 15%
    run50m: 0.20,  // 20%
    ropeSkipping: 0.10,  // 10%
    sitUps: 0.10,  // 10% (仅女生)
    sitAndReach: 0.20,  // 20%
    standingJump: 0.20  // 20%
  }

  let totalScore = 0
  totalScore += scores.bmiScore * weights.bmi
  totalScore += scores.vitalCapacityScore * weights.vitalCapacity
  totalScore += scores.run50mScore * weights.run50m
  totalScore += scores.ropeSkippingScore * weights.ropeSkipping
  
  if (scores.sitUpsScore !== undefined) {
    // 女生有仰卧起坐
    totalScore += scores.sitUpsScore * weights.sitUps
  }
  
  totalScore += scores.sitAndReachScore * weights.sitAndReach
  totalScore += scores.standingJumpScore * weights.standingJump

  return Math.round(totalScore * 100) / 100  // 保留两位小数
}

/**
 * 根据总分判定等级
 */
export function getGradeLevel(totalScore: number): '优秀' | '良好' | '及格' | '不及格' {
  if (totalScore >= 90) {
    return '优秀'
  } else if (totalScore >= 80) {
    return '良好'
  } else if (totalScore >= 60) {
    return '及格'
  } else {
    return '不及格'
  }
}

/**
 * 计算合格率
 */
export function calculatePassRate(
  excellentCount: number,
  goodCount: number,
  passCount: number,
  failCount: number
): number {
  const total = excellentCount + goodCount + passCount + failCount
  if (total === 0) return 0
  
  const passTotal = excellentCount + goodCount + passCount
  return Math.round((passTotal / total) * 10000) / 100  // 保留两位小数
}

/**
 * 计算优良率
 */
export function calculateExcellentRate(
  excellentCount: number,
  goodCount: number,
  total: number
): number {
  if (total === 0) return 0
  
  const excellentTotal = excellentCount + goodCount
  return Math.round((excellentTotal / total) * 10000) / 100  // 保留两位小数
}

/**
 * 格式化分数显示
 */
export function formatScore(score: number): string {
  return score.toFixed(1)
}

/**
 * 格式化百分比显示
 */
export function formatPercentage(value: number): string {
  return value.toFixed(2) + '%'
}
