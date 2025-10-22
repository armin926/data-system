// 数据导入相关API
import { request } from '@/utils/request'
import type { ImportResult, ApiResponse } from '@/types'

/**
 * 上传Excel文件导入数据
 */
export function uploadExcel(file: File, academicYear: string, overwrite: boolean = false) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('academicYear', academicYear)
  formData.append('overwrite', String(overwrite))
  
  return request.upload<ApiResponse<ImportResult>>('/import/upload', formData)
}

/**
 * 下载导入模板
 */
export function downloadTemplate() {
  return request.download('/import/template')
}

/**
 * 获取导入历史
 */
export function getImportHistory(params?: { page: number, pageSize: number }) {
  return request.get<ApiResponse<any>>('/import/history', { params })
}
