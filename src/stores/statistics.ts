// 统计数据状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStatistics, getProjectAverages, getScoreDistribution } from '@/api'
import type { Statistics } from '@/types'
import { ElMessage } from 'element-plus'

export const useStatisticsStore = defineStore('statistics', () => {
  // 状态
  const currentStats = ref<Statistics>({
    totalCount: 0,
    excellentCount: 0,
    goodCount: 0,
    passCount: 0,
    failCount: 0,
    passRate: 0,
    excellentRate: 0,
    averageScore: 0
  })
  
  const loading = ref(false)
  const selectedYear = ref('')
  const selectedGrade = ref('')
  
  // 项目平均分数据
  const projectAverages = ref<any>(null)
  
  // 成绩分布数据
  const scoreDistribution = ref<any>(null)

  // 获取统计数据
  async function fetchStatistics(academicYear: string, grade?: string) {
    loading.value = true
    try {
      const res = await getStatistics({ academicYear, grade })
      if (res.success && res.data) {
        currentStats.value = res.data
        selectedYear.value = academicYear
        selectedGrade.value = grade || ''
      }
    } catch (error) {
      console.error('Fetch statistics error:', error)
      ElMessage.error('获取统计数据失败')
    } finally {
      loading.value = false
    }
  }

  // 获取项目平均分
  async function fetchProjectAverages(academicYear: string, grade?: string) {
    try {
      const res = await getProjectAverages({ academicYear, grade })
      if (res.success && res.data) {
        projectAverages.value = res.data
      }
    } catch (error) {
      console.error('Fetch project averages error:', error)
    }
  }

  // 获取成绩分布
  async function fetchScoreDistribution(academicYear: string, grade?: string) {
    try {
      const res = await getScoreDistribution({ academicYear, grade })
      if (res.success && res.data) {
        scoreDistribution.value = res.data
      }
    } catch (error) {
      console.error('Fetch score distribution error:', error)
    }
  }

  // 刷新所有统计数据
  async function refreshAllStats(academicYear: string, grade?: string) {
    await Promise.all([
      fetchStatistics(academicYear, grade),
      fetchProjectAverages(academicYear, grade),
      fetchScoreDistribution(academicYear, grade)
    ])
  }

  return {
    currentStats,
    loading,
    selectedYear,
    selectedGrade,
    projectAverages,
    scoreDistribution,
    fetchStatistics,
    fetchProjectAverages,
    fetchScoreDistribution,
    refreshAllStats
  }
})
