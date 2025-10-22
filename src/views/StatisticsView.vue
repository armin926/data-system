<template>
  <div class="statistics-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-title">
        <h2>体测数据分析看板</h2>
        <p class="header-subtitle">{{ selectedYear }} 学年 {{ selectedGrade || '全部年级' }}</p>
      </div>
      <div class="header-filters">
        <el-select v-model="selectedYear" placeholder="选择学年" class="filter-select" @change="handleYearChange">
          <el-option label="2023-2024" value="2023-2024" />
          <el-option label="2024-2025" value="2024-2025" />
          <el-option label="2025-2026" value="2025-2026" />
        </el-select>
        <el-select v-model="selectedGrade" placeholder="全部年级" clearable class="filter-select" @change="handleGradeChange">
          <el-option label="一年级" value="一年级" />
          <el-option label="二年级" value="二年级" />
          <el-option label="三年级" value="三年级" />
          <el-option label="四年级" value="四年级" />
          <el-option label="五年级" value="五年级" />
          <el-option label="六年级" value="六年级" />
        </el-select>
        <el-button type="primary" :icon="Refresh" @click="refreshData" class="refresh-btn">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card" v-for="(metric, index) in metrics" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
        <div class="metric-icon" :style="{ background: metric.gradient }">
          <component :is="metric.icon" class="icon" />
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-trend" :class="metric.trendClass">
            <el-icon v-if="metric.trend"><component :is="metric.trend" /></el-icon>
            <span>{{ metric.trendText }}</span>
          </div>
        </div>
        <div class="metric-bg-icon">
          <component :is="metric.icon" />
        </div>
      </div>
    </div>

    <!-- 等级分布进度条 -->
    <div class="level-distribution">
      <div class="section-header">
        <h3>等级分布概览</h3>
        <span class="section-subtitle">共 {{ stats.totalCount }} 人参与测评</span>
      </div>
      <div class="level-bars">
        <div class="level-bar" v-for="level in levelData" :key="level.name">
          <div class="level-bar-header">
            <div class="level-info">
              <span class="level-name" :style="{ color: level.color }">{{ level.name }}</span>
              <span class="level-count">{{ level.count }} 人</span>
            </div>
            <span class="level-percent">{{ level.percentage }}%</span>
          </div>
          <div class="level-bar-track">
            <div 
              class="level-bar-fill" 
              :style="{ width: `${level.percentage}%`, background: level.gradient }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-container">
      <div class="chart-card">
        <div class="chart-header">
          <h3>等级分布饼图</h3>
          <span class="chart-subtitle">各等级人数占比</span>
        </div>
        <div class="chart-body">
          <div ref="pieChartRef" class="chart"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>成绩分布柱状图</h3>
          <span class="chart-subtitle">各等级人数统计</span>
        </div>
        <div class="chart-body">
          <div ref="barChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 年级对比表格 -->
    <div class="grade-comparison" v-if="stats.gradeDistribution && stats.gradeDistribution.length > 0">
      <div class="section-header">
        <h3>各年级数据对比</h3>
        <span class="section-subtitle">横向对比分析</span>
      </div>
      <div class="comparison-table">
        <el-table :data="stats.gradeDistribution" style="width: 100%" :header-cell-style="{ background: '#f5f7fa' }">
          <el-table-column prop="grade" label="年级" width="120" align="center" />
          <el-table-column prop="totalCount" label="人数" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.totalCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="合格率" width="180" align="center">
            <template #default="{ row }">
              <div class="table-progress">
                <span class="progress-text">{{ row.passRate.toFixed(2) }}%</span>
                <el-progress :percentage="row.passRate" :show-text="false" :stroke-width="8" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优良率" width="180" align="center">
            <template #default="{ row }">
              <div class="table-progress">
                <span class="progress-text">{{ row.excellentRate.toFixed(2) }}%</span>
                <el-progress :percentage="row.excellentRate" :show-text="false" :stroke-width="8" color="#67C23A" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="平均分" align="center">
            <template #default="{ row }">
              <span class="score-badge">{{ row.averageScore.toFixed(1) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { User, TrendCharts, Star, DataAnalysis, CaretTop, CaretBottom, Refresh } from '@element-plus/icons-vue'
import type { Statistics, GradeDistribution } from '@/types'

// 筛选条件
const selectedYear = ref('2024-2025')
const selectedGrade = ref('')

// 生成假数据
const generateMockData = (): Statistics => {
  const totalCount = selectedGrade.value ? Math.floor(Math.random() * 100) + 150 : Math.floor(Math.random() * 300) + 600
  const excellentCount = Math.floor(totalCount * (Math.random() * 0.2 + 0.15))
  const goodCount = Math.floor(totalCount * (Math.random() * 0.25 + 0.25))
  const passCount = Math.floor(totalCount * (Math.random() * 0.2 + 0.2))
  const failCount = totalCount - excellentCount - goodCount - passCount
  
  const passRate = ((excellentCount + goodCount + passCount) / totalCount) * 100
  const excellentRate = ((excellentCount + goodCount) / totalCount) * 100
  const averageScore = Math.random() * 15 + 70
  
  const gradeDistribution: GradeDistribution[] = selectedGrade.value ? [] : [
    { grade: '一年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 },
    { grade: '二年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 },
    { grade: '三年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 },
    { grade: '四年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 },
    { grade: '五年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 },
    { grade: '六年级', totalCount: Math.floor(Math.random() * 50) + 100, passRate: Math.random() * 20 + 75, excellentRate: Math.random() * 20 + 35, averageScore: Math.random() * 10 + 72 }
  ]
  
  return {
    totalCount,
    excellentCount,
    goodCount,
    passCount,
    failCount,
    passRate,
    excellentRate,
    averageScore,
    gradeDistribution
  }
}

// 统计数据
const stats = ref<Statistics>(generateMockData())

// 核心指标数据
const metrics = computed(() => [
  {
    label: '总人数',
    value: stats.value.totalCount,
    icon: User,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: CaretTop,
    trendText: '较上期 +5.2%',
    trendClass: 'trend-up'
  },
  {
    label: '合格率',
    value: `${stats.value.passRate.toFixed(2)}%`,
    icon: TrendCharts,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: CaretTop,
    trendText: '较上期 +2.8%',
    trendClass: 'trend-up'
  },
  {
    label: '优良率',
    value: `${stats.value.excellentRate.toFixed(2)}%`,
    icon: Star,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: CaretBottom,
    trendText: '较上期 -1.3%',
    trendClass: 'trend-down'
  },
  {
    label: '平均分',
    value: stats.value.averageScore.toFixed(1),
    icon: DataAnalysis,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    trend: CaretTop,
    trendText: '较上期 +3.5',
    trendClass: 'trend-up'
  }
])

// 等级数据
const levelData = computed(() => {
  const total = stats.value.totalCount || 1
  return [
    {
      name: '优秀',
      count: stats.value.excellentCount,
      percentage: ((stats.value.excellentCount / total) * 100).toFixed(1),
      color: '#67C23A',
      gradient: 'linear-gradient(90deg, #67C23A 0%, #85CE61 100%)'
    },
    {
      name: '良好',
      count: stats.value.goodCount,
      percentage: ((stats.value.goodCount / total) * 100).toFixed(1),
      color: '#409EFF',
      gradient: 'linear-gradient(90deg, #409EFF 0%, #66B1FF 100%)'
    },
    {
      name: '及格',
      count: stats.value.passCount,
      percentage: ((stats.value.passCount / total) * 100).toFixed(1),
      color: '#E6A23C',
      gradient: 'linear-gradient(90deg, #E6A23C 0%, #EBB563 100%)'
    },
    {
      name: '不及格',
      count: stats.value.failCount,
      percentage: ((stats.value.failCount / total) * 100).toFixed(1),
      color: '#F56C6C',
      gradient: 'linear-gradient(90deg, #F56C6C 0%, #F78989 100%)'
    }
  ]
})

// 图表DOM引用
const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()

// 图表实例
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

// 初始化
onMounted(async () => {
  await refreshData()
  initCharts()
})

// 刷新数据
const refreshData = () => {
  if (!selectedYear.value) {
    ElMessage.warning('请选择学年')
    return
  }

  stats.value = generateMockData()
  ElMessage.success('数据刷新成功')
  updateCharts()
}

// 学年变化
const handleYearChange = () => {
  refreshData()
}

// 年级变化
const handleGradeChange = () => {
  refreshData()
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
    }
    if (barChartRef.value) {
      barChart = echarts.init(barChartRef.value)
    }
    
    updateCharts()

    // 响应式
    window.addEventListener('resize', handleResize)
  })
}

// 更新图表
const updateCharts = () => {
  updatePieChart()
  updateBarChart()
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      borderWidth: 0,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        fontSize: 14,
        color: '#606266'
      },
      itemGap: 20
    },
    series: [
      {
        name: '等级分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: [
          { value: stats.value.excellentCount, name: '优秀', itemStyle: { color: '#67C23A' } },
          { value: stats.value.goodCount, name: '良好', itemStyle: { color: '#409EFF' } },
          { value: stats.value.passCount, name: '及格', itemStyle: { color: '#E6A23C' } },
          { value: stats.value.failCount, name: '不及格', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }

  pieChart.setOption(option)
}

// 更新柱状图
const updateBarChart = () => {
  if (!barChart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      borderWidth: 0,
      textStyle: {
        color: '#fff'
      },
      formatter: '{b}: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['优秀', '良好', '及格', '不及格'],
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 13
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisLabel: {
        color: '#606266'
      },
      splitLine: {
        lineStyle: {
          color: '#EBEEF5',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: [
          { value: stats.value.excellentCount, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#85CE61' }, { offset: 1, color: '#67C23A' }]) } },
          { value: stats.value.goodCount, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#66B1FF' }, { offset: 1, color: '#409EFF' }]) } },
          { value: stats.value.passCount, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#EBB563' }, { offset: 1, color: '#E6A23C' }]) } },
          { value: stats.value.failCount, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#F78989' }, { offset: 1, color: '#F56C6C' }]) } }
        ],
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          color: '#606266',
          fontSize: 12
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  }

  barChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
}

// 监听数据变化
watch(() => stats.value, () => {
  updateCharts()
}, { deep: true })
</script>

<style scoped>
.statistics-dashboard {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 顶部标题栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
}

.header-title h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
}

.header-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.header-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  width: 150px;
}

.filter-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: none;
  border-radius: 8px;
}

.refresh-btn {
  border-radius: 8px;
  padding: 0 24px;
}

/* 核心指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  position: relative;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.metric-icon .icon {
  font-size: 32px;
  color: #fff;
}

.metric-content {
  position: relative;
  z-index: 1;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.metric-bg-icon {
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 120px;
  color: rgba(0, 0, 0, 0.02);
  pointer-events: none;
}

/* 等级分布 */
.level-distribution {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-subtitle {
  font-size: 13px;
  color: #909399;
}

.level-bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.level-bar {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.level-bar:hover {
  background: #f0f2f5;
  transform: translateX(8px);
}

.level-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-name {
  font-size: 15px;
  font-weight: 600;
}

.level-count {
  font-size: 14px;
  color: #606266;
  padding: 2px 12px;
  background: #fff;
  border-radius: 12px;
}

.level-percent {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.level-bar-track {
  height: 12px;
  background: #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.level-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease-out;
  animation: progressAnimation 1.5s ease-out;
}

/* 图表容器 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: fadeIn 0.8s ease-out;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.chart-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
}

.chart-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-subtitle {
  font-size: 13px;
  color: #909399;
}

.chart-body {
  position: relative;
}

.chart {
  height: 350px;
  width: 100%;
}

/* 年级对比 */
.grade-comparison {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 1s ease-out;
}

.comparison-table {
  margin-top: 16px;
}

.table-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.score-badge {
  display: inline-block;
  padding: 4px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
}

/* 动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes progressAnimation {
  from {
    width: 0;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-filters {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-select,
  .refresh-btn {
    width: 100%;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .metric-value {
    font-size: 28px;
  }
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
