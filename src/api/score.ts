// 成绩管理相关API
import { request } from '@/utils/request'
import type { 
  ScoreQueryParams, 
  ScoreUpdateParams, 
  PageResponse, 
  ScoreWithStudent,
  ApiResponse 
} from '@/types'

/**
 * 查询成绩列表
 */
export function getScoreList(params: ScoreQueryParams) {
  return request.get<ApiResponse<PageResponse<ScoreWithStudent>>>('/scores/list', { params })
}

/**
 * 更新单项成绩
 */
export function updateScore(data: ScoreUpdateParams) {
  return request.put<ApiResponse<ScoreWithStudent>>('/scores/update', data)
}

/**
 * 删除成绩记录
 */
export function deleteScores(scoreIds: string[]) {
  return request.delete<ApiResponse>('/scores/delete', { data: { scoreIds } })
}

/**
 * 批量删除成绩记录
 */
export function batchDeleteScores(scoreIds: string[]) {
  return request.delete<ApiResponse>('/scores/batch-delete', { data: { scoreIds } })
}

/**
 * 获取筛选选项
 */
export function getFilterOptions() {
  return request.get<ApiResponse<{
    academicYears: string[]
    grades: string[]
    classes: string[]
  }>>('/scores/filter-options')
}
