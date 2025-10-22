// 用户状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/api'
import type { Teacher, LoginRequest } from '@/types'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<Teacher | null>(null)
  const schoolCode = ref<string>('')
  const schoolName = ref<string>('')

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 登录
  async function login(loginData: LoginRequest) {
    try {
      // const res = await loginApi(loginData)
      // if (res.success && res.data) {
      //   token.value = res.data.token
      //   userInfo.value = res.data.teacherInfo
      //   schoolCode.value = res.data.schoolCode
      //   schoolName.value = res.data.schoolName

      //   // 保存token到localStorage
      //   localStorage.setItem('token', res.data.token)
      //   localStorage.setItem('userInfo', JSON.stringify(res.data.teacherInfo))
      //   localStorage.setItem('schoolCode', res.data.schoolCode)

      //   ElMessage.success('登录成功')
      //   return true
      // }
      // return false
        token.value = '233'
      userInfo.value = {
        teacherId: '1',
        username: 'admin',
        name: '管理员',
        schoolName: '怡康大学',
        schoolCode: 'SHU',
        createTime: '2023-01-01',
        lastLoginTime: '2023-01-01',
        status: 'active'
        }
        schoolCode.value = 'SHU'
        schoolName.value = '怡康大学'

        // 保存token到localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        localStorage.setItem('schoolCode', schoolCode.value)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // 退出登录
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      schoolCode.value = ''
      schoolName.value = ''

      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('schoolCode')

      ElMessage.success('已退出登录')
    }
  }

  // 从localStorage恢复用户信息
  function restoreUserInfo() {
    const storedToken = localStorage.getItem('token')
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedSchoolCode = localStorage.getItem('schoolCode')

    if (storedToken && storedUserInfo) {
      token.value = storedToken
      userInfo.value = JSON.parse(storedUserInfo)
      schoolCode.value = storedSchoolCode || ''
      schoolName.value = userInfo.value?.schoolName || ''
    }
  }

  // 获取当前用户信息(用于刷新)
  async function fetchCurrentUser() {
    try {
      const res = await getCurrentUser()
      if (res.success && res.data) {
        userInfo.value = res.data.teacherInfo
        schoolCode.value = res.data.schoolCode
        schoolName.value = res.data.schoolName
      }
    } catch (error) {
      console.error('Fetch current user error:', error)
      // Token可能已失效,清除登录状态
      logout()
    }
  }

  return {
    token,
    userInfo,
    schoolCode,
    schoolName,
    isAuthenticated,
    login,
    logout,
    restoreUserInfo,
    fetchCurrentUser
  }
})
