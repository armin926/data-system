// 统计分析相关API
import { request } from '@/utils/request'
import type { Statistics, ExportParams, ApiResponse } from '@/types'

/**
 * 获取统计数据
 */
export function getStatistics(params: { academicYear: string, grade?: string }) {
  return request.get<ApiResponse<Statistics>>('/statistics/overview', { params })
}

/**
 * 导出成绩数据
 */
export function exportScores(data: ExportParams) {
  return request.download('/export/scores', data)
}

/**
 * 获取各项目平均分
 */
export function getProjectAverages(params: { academicYear: string, grade?: string }) {
  return request.get<ApiResponse<any>>('/statistics/project-averages', { params })
}

/**
 * 获取成绩分布数据
 */
export function getScoreDistribution(params: { academicYear: string, grade?: string }) {
  return request.get<ApiResponse<any>>('/statistics/distribution', { params })
}
