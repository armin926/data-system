<template>
  <div class="scores-container">
    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="学年">
          <el-select v-model="filters.academicYear" placeholder="选择学年" clearable style="width: 150px">
            <el-option
              v-for="year in filterOptions.academicYears"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="年级">
          <el-select v-model="filters.grade" placeholder="选择年级" clearable style="width: 120px">
            <el-option
              v-for="grade in filterOptions.grades"
              :key="grade"
              :label="grade"
              :value="grade"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="班级">
          <el-select v-model="filters.className" placeholder="选择班级" clearable style="width: 120px">
            <el-option
              v-for="cls in filterOptions.classes"
              :key="cls"
              :label="cls"
              :value="cls"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="等级">
          <el-select v-model="filters.gradeLevel" placeholder="选择等级" clearable style="width: 120px">
            <el-option
              v-for="level in filterOptions.gradeLevels"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input
            v-model="filters.keyword"
            placeholder="学号/姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 统计信息 -->
      <div v-if="currentStats" class="quick-stats">
        <el-tag type="success">合格率: {{ currentStats.passRate.toFixed(2) }}%</el-tag>
        <el-tag type="primary" style="margin-left: 10px">优良率: {{ currentStats.excellentRate.toFixed(2) }}%</el-tag>
        <el-tag type="info" style="margin-left: 10px">总人数: {{ currentStats.totalCount }}</el-tag>
      </div>
    </el-card>

    <!-- 成绩表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>成绩列表</span>
          <div>
            <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="scoreList"
        height="460px"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentNo" label="学号" width="120" fixed />
        <el-table-column prop="studentName" label="姓名" width="100" fixed />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="class" label="班级" width="80" />
        
        <el-table-column label="身高(cm)" width="100">
          <template #default="{ row }">
            <editable-cell
              :value="row.height"
              @save="(val: number) => handleCellEdit(row.scoreId, 'height', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="体重(kg)" width="100">
          <template #default="{ row }">
            <editable-cell
              :value="row.weight"
              @save="(val: number) => handleCellEdit(row.scoreId, 'weight', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="肺活量(ml)" width="110">
          <template #default="{ row }">
            <editable-cell
              :value="row.vitalCapacity"
              @save="(val: number) => handleCellEdit(row.scoreId, 'vitalCapacity', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="50米跑(s)" width="100">
          <template #default="{ row }">
            <editable-cell
              :value="row.run50m"
              @save="(val: number) => handleCellEdit(row.scoreId, 'run50m', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="跳绳(次)" width="100">
          <template #default="{ row }">
            <editable-cell
              :value="row.ropeSkipping1min"
              @save="(val: number) => handleCellEdit(row.scoreId, 'ropeSkipping1min', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="仰卧起坐(次)" width="120">
          <template #default="{ row }">
            <editable-cell
              v-if="row.gender === '女'"
              :value="row.sitUps1min"
              @save="(val: number) => handleCellEdit(row.scoreId, 'sitUps1min', val)"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="坐位体前屈(cm)" width="130">
          <template #default="{ row }">
            <editable-cell
              :value="row.sitAndReach"
              @save="(val: number) => handleCellEdit(row.scoreId, 'sitAndReach', val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="立定跳远(cm)" width="120">
          <template #default="{ row }">
            <editable-cell
              :value="row.standingJump"
              @save="(val: number) => handleCellEdit(row.scoreId, 'standingJump', val)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="totalScore" label="总分" width="80" fixed="right">
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.gradeLevel)">
              {{ row.totalScore.toFixed(1) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="gradeLevel" label="等级" width="100" fixed="right">
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.gradeLevel)">
              {{ row.gradeLevel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" text @click="handleDelete(row.scoreId)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditableCell from '@/components/EditableCell.vue'
import type { ScoreWithStudent, FilterOptions, Statistics } from '@/types'
import { calculateTotalScore, getGradeLevel } from '@/utils/scoring'

// 生成假数据
const generateMockData = (): ScoreWithStudent[] => {
  const academicYears = ['2023-2024', '2024-2025']
  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
  const classes = ['1班', '2班', '3班', '4班']
  const genders: ('男' | '女')[] = ['男', '女']
  const gradeLevels: ('优秀' | '良好' | '及格' | '不及格')[] = ['优秀', '良好', '及格', '不及格']
  
  const data: ScoreWithStudent[] = []
  
  for (let i = 1; i <= 100; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)] as '男' | '女'
    const grade = grades[Math.floor(Math.random() * grades.length)] as string
    const className = classes[Math.floor(Math.random() * classes.length)] as string
    const academicYear = academicYears[Math.floor(Math.random() * academicYears.length)] as string
    const gradeLevel = gradeLevels[Math.floor(Math.random() * gradeLevels.length)] as '优秀' | '良好' | '及格' | '不及格'
    
    const height = 120 + Math.floor(Math.random() * 50)
    const weight = 30 + Math.floor(Math.random() * 30)
    const vitalCapacity = 1500 + Math.floor(Math.random() * 1500)
    const run50m = 8 + Math.random() * 4
    const ropeSkipping1min = 80 + Math.floor(Math.random() * 100)
    const sitUps1min = gender === '女' ? 30 + Math.floor(Math.random() * 30) : undefined
    const sitAndReach = 5 + Math.random() * 15
    const standingJump = 120 + Math.floor(Math.random() * 80)
    
    // 根据等级生成总分
    let totalScore = 0
    switch (gradeLevel) {
      case '优秀':
        totalScore = 90 + Math.random() * 10
        break
      case '良好':
        totalScore = 80 + Math.random() * 10
        break
      case '及格':
        totalScore = 60 + Math.random() * 20
        break
      case '不及格':
        totalScore = 30 + Math.random() * 30
        break
    }
    
    data.push({
      scoreId: `score_${i}`,
      studentId: `student_${i}`,
      studentNo: `2024${String(i).padStart(4, '0')}`,
      studentName: `学生${i}`,
      academicYear: academicYear,
      gender: gender,
      grade: grade,
      class: className,
      height,
      weight,
      vitalCapacity,
      run50m,
      ropeSkipping1min,
      sitUps1min,
      sitAndReach,
      standingJump,
      totalScore,
      gradeLevel: gradeLevel,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      modifyCount: 0
    })
  }
  
  return data
}

// 全部数据
const allMockData = ref<ScoreWithStudent[]>(generateMockData())

// 筛选条件
const filters = reactive({
  academicYear: '',
  grade: '',
  className: '',
  keyword: '',
  gradeLevel: ''
})

// 筛选选项
const filterOptions = ref<FilterOptions>({
  academicYears: ['2023-2024', '2024-2025'],
  grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
  classes: ['1班', '2班', '3班', '4班'],
  gradeLevels: [
    { label: '优秀', value: '优秀' },
    { label: '良好', value: '良好' },
    { label: '及格', value: '及格' },
    { label: '不及格', value: '不及格' }
  ]
})

// 当前显示的数据
const scoreList = ref<ScoreWithStudent[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

// 计算当前统计数据
const currentStats = computed<Statistics>(() => {
  const filteredData = getFilteredData()
  const total = filteredData.length
  const excellentCount = filteredData.filter(s => s.gradeLevel === '优秀').length
  const goodCount = filteredData.filter(s => s.gradeLevel === '良好').length
  const passCount = filteredData.filter(s => s.gradeLevel === '及格').length
  const failCount = filteredData.filter(s => s.gradeLevel === '不及格').length
  
  const passRate = total > 0 ? ((excellentCount + goodCount + passCount) / total) * 100 : 0
  const excellentRate = total > 0 ? ((excellentCount + goodCount) / total) * 100 : 0
  const averageScore = total > 0 ? filteredData.reduce((sum, s) => sum + s.totalScore, 0) / total : 0
  
  return {
    totalCount: total,
    excellentCount,
    goodCount,
    passCount,
    failCount,
    passRate,
    excellentRate,
    averageScore
  }
})

// 选中的记录ID
const selectedIds = ref<string[]>([])

// 获取筛选后的数据
const getFilteredData = () => {
  return allMockData.value.filter(item => {
    if (filters.academicYear && item.academicYear !== filters.academicYear) return false
    if (filters.grade && item.grade !== filters.grade) return false
    if (filters.className && item.class !== filters.className) return false
    if (filters.gradeLevel && item.gradeLevel !== filters.gradeLevel) return false
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      if (!item.studentNo.toLowerCase().includes(keyword) && 
          !item.studentName.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })
}

// 获取分页数据
const loadPageData = () => {
  const filteredData = getFilteredData()
  totalCount.value = filteredData.length
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  scoreList.value = filteredData.slice(start, end)
}

// 初始化
onMounted(() => {
  loadPageData()
})

// 查询
const handleSearch = () => {
  currentPage.value = 1
  loadPageData()
}

// 重置
const handleReset = () => {
  Object.assign(filters, {
    academicYear: '',
    grade: '',
    className: '',
    keyword: '',
    gradeLevel: ''
  })
  currentPage.value = 1
  loadPageData()
}

// 单元格编辑
const handleCellEdit = (scoreId: string, field: string, value: number) => {
  const index = allMockData.value.findIndex(item => item.scoreId === scoreId)
  if (index !== -1) {
    const item = allMockData.value[index]
    if (item) {
      // 更新字段值
      ;(item as any)[field] = value
      
      // 重新计算总分和等级(实际应用中可以调用评分函数)
      item.updateTime = new Date().toISOString()
      item.modifyCount++
      
      loadPageData()
      ElMessage.success('修改成功')
    }
  }
}

// 删除记录
const handleDelete = (scoreId: string) => {
  ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = allMockData.value.findIndex(item => item.scoreId === scoreId)
    if (index !== -1) {
      allMockData.value.splice(index, 1)
      loadPageData()
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedIds.value.length}条记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    allMockData.value = allMockData.value.filter(
      item => !selectedIds.value.includes(item.scoreId)
    )
    selectedIds.value = []
    loadPageData()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出数据
const handleExport = () => {
  if (!filters.academicYear) {
    ElMessage.warning('请先选择学年')
    return
  }

  // 模拟导出功能
  ElMessage.success('导出成功（模拟）')
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.scoreId)
}

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadPageData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadPageData()
}

// 获取成绩标签类型
const getScoreTagType = (gradeLevel: string): string => {
  switch (gradeLevel) {
    case '优秀':
      return 'success'
    case '良好':
      return 'primary'
    case '及格':
      return 'warning'
    case '不及格':
      return 'danger'
    default:
      return 'info'
  }
}
</script>

<style scoped>
.scores-container {
  max-width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.quick-stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}
</style>
