// 成绩数据状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getScoreList, 
  updateScore as updateScoreApi, 
  deleteScores,
  getFilterOptions
} from '@/api'
import type { 
  ScoreWithStudent, 
  ScoreQueryParams, 
  ScoreUpdateParams,
  FilterOptions 
} from '@/types'
import { ElMessage } from 'element-plus'

export const useScoreStore = defineStore('score', () => {
  // 状态
  const scoreList = ref<ScoreWithStudent[]>([])
  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)

  // 筛选条件
  const filters = ref<Partial<ScoreQueryParams>>({
    academicYear: '',
    grade: '',
    className: '',
    keyword: '',
    gradeLevel: ''
  })

  // 筛选选项
  const filterOptions = ref<FilterOptions>({
    academicYears: [],
    grades: [],
    classes: [],
    gradeLevels: [
      { label: '优秀', value: '优秀' },
      { label: '良好', value: '良好' },
      { label: '及格', value: '及格' },
      { label: '不及格', value: '不及格' }
    ]
  })

  // 获取成绩列表
  async function fetchScoreList() {
    loading.value = true
    try {
      const params: ScoreQueryParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filters.value
      }
      
      const res = await getScoreList(params)
      if (res.success && res.data) {
        scoreList.value = res.data.list
        totalCount.value = res.data.total
        currentPage.value = res.data.page
        pageSize.value = res.data.pageSize
      }
    } catch (error) {
      console.error('Fetch score list error:', error)
      ElMessage.error('获取成绩列表失败')
    } finally {
      loading.value = false
    }
  }

  // 更新成绩
  async function updateScore(params: ScoreUpdateParams) {
    try {
      const res = await updateScoreApi(params)
      if (res.success && res.data) {
        // 更新列表中对应的记录
        const index = scoreList.value.findIndex(item => item.scoreId === params.scoreId)
        if (index !== -1) {
          scoreList.value[index] = res.data
        }
        ElMessage.success('修改成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Update score error:', error)
      ElMessage.error('修改失败')
      return false
    }
  }

  // 删除成绩
  async function deleteScore(scoreIds: string[]) {
    try {
      const res = await deleteScores(scoreIds)
      if (res.success) {
        ElMessage.success('删除成功')
        // 重新加载列表
        await fetchScoreList()
        return true
      }
      return false
    } catch (error) {
      console.error('Delete score error:', error)
      ElMessage.error('删除失败')
      return false
    }
  }

  // 设置筛选条件
  function setFilters(newFilters: Partial<ScoreQueryParams>) {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1  // 重置到第一页
  }

  // 重置筛选条件
  function resetFilters() {
    filters.value = {
      academicYear: '',
      grade: '',
      className: '',
      keyword: '',
      gradeLevel: ''
    }
    currentPage.value = 1
  }

  // 设置分页
  function setPage(page: number, size: number) {
    currentPage.value = page
    pageSize.value = size
  }

  // 获取筛选选项
  async function fetchFilterOptions() {
    try {
      const res = await getFilterOptions()
      if (res.success && res.data) {
        filterOptions.value = {
          ...filterOptions.value,
          ...res.data
        }
      }
    } catch (error) {
      console.error('Fetch filter options error:', error)
    }
  }

  return {
    scoreList,
    totalCount,
    currentPage,
    pageSize,
    loading,
    filters,
    filterOptions,
    fetchScoreList,
    updateScore,
    deleteScore,
    setFilters,
    resetFilters,
    setPage,
    fetchFilterOptions
  }
})
