// 用户认证相关API
import { request } from '@/utils/request'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types'

/**
 * 教师登录
 */
export function login(data: LoginRequest) {
  return request.post<ApiResponse<LoginResponse>>('/auth/login', data)
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<ApiResponse>('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request.get<ApiResponse<LoginResponse>>('/auth/current')
}
