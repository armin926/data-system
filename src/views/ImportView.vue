<template>
  <div class="import-container">
    <el-card class="import-card">
      <template #header>
        <div class="card-header">
          <span>Excel数据导入</span>
          <el-button type="primary" text @click="downloadTemplate">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
        </div>
      </template>

      <div class="import-content">
        <!-- 配置选项 -->
        <el-form :model="importForm" label-width="100px" class="import-form">
          <el-form-item label="学年">
            <el-select v-model="importForm.academicYear" placeholder="请选择学年" style="width: 300px">
              <el-option label="2023-2024" value="2023-2024" />
              <el-option label="2024-2025" value="2024-2025" />
              <el-option label="2025-2026" value="2025-2026" />
            </el-select>
          </el-form-item>

          <el-form-item label="覆盖选项">
            <el-switch
              v-model="importForm.overwrite"
              active-text="覆盖已存在数据"
              inactive-text="跳过已存在数据"
            />
          </el-form-item>
        </el-form>

        <!-- 文件上传区 -->
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处,或<em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持.xls和.xlsx格式,文件大小不超过10MB
            </div>
          </template>
        </el-upload>

        <!-- 文件信息 -->
        <div v-if="currentFile" class="file-info">
          <el-alert
            :title="`已选择文件: ${currentFile.name} (${formatFileSize(currentFile.size)})`"
            type="info"
            :closable="false"
          />
        </div>

        <!-- 导入按钮 -->
        <div class="import-actions">
          <el-button
            type="primary"
            size="large"
            :loading="importing"
            :disabled="!currentFile || !importForm.academicYear"
            @click="handleImport"
          >
            {{ importing ? '导入中...' : '开始导入' }}
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
        </div>

        <!-- 导入进度 -->
        <div v-if="importing" class="import-progress">
          <el-progress :percentage="importProgress" :status="importStatus" />
        </div>

        <!-- 导入结果 -->
        <div v-if="importResult" class="import-result">
          <el-alert
            :title="`导入完成: 成功${importResult.successCount}条,失败${importResult.failCount}条`"
            :type="importResult.failCount === 0 ? 'success' : 'warning'"
            :closable="false"
          >
            <template v-if="importResult.errors && importResult.errors.length > 0">
              <div class="error-list">
                <p><strong>错误详情:</strong></p>
                <ul>
                  <li v-for="(error, index) in importResult.errors.slice(0, 10)" :key="index">
                    第{{ error.row }}行: {{ error.message }}
                  </li>
                </ul>
                <p v-if="importResult.errors.length > 10" class="more-errors">
                  还有{{ importResult.errors.length - 10 }}条错误未显示...
                </p>
              </div>
            </template>
          </el-alert>
        </div>
      </div>
    </el-card>

    <!-- 导入历史 -->
    <el-card class="history-card">
      <template #header>
        <span>导入历史</span>
      </template>

      <el-empty v-if="!importHistory || importHistory.length === 0" description="暂无导入历史" />

      <el-timeline v-else>
        <el-timeline-item
          v-for="item in importHistory"
          :key="item.id"
          :timestamp="item.time"
          placement="top"
        >
          <el-card>
            <p><strong>文件:</strong> {{ item.filename }}</p>
            <p><strong>学年:</strong> {{ item.academicYear }}</p>
            <p><strong>结果:</strong> 成功{{ item.successCount }}条,失败{{ item.failCount }}条</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { uploadExcel } from '@/api'
import { validateExcelFile, parseExcelFile, validateExcelColumns, generateImportTemplate } from '@/utils/excel'
import { validateImportRow } from '@/utils/validation'
import type { ImportResult } from '@/types'

// 上传组件引用
const uploadRef = ref<UploadInstance>()

// 导入表单
const importForm = reactive({
  academicYear: '',
  overwrite: false
})

// 当前选择的文件
const currentFile = ref<File | null>(null)

// 导入状态
const importing = ref(false)
const importProgress = ref(0)
const importStatus = ref<'success' | 'exception' | 'warning' | ''>('')

// 导入结果
const importResult = ref<ImportResult | null>(null)

// 导入历史(示例数据)
const importHistory = ref<any[]>([])

// 文件选择变化
const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  // 验证文件
  const validation = validateExcelFile(file.raw)
  if (!validation.valid) {
    ElMessage.error(validation.message || '文件验证失败')
    uploadRef.value?.clearFiles()
    return
  }

  currentFile.value = file.raw
  importResult.value = null
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件,请先删除已选文件')
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return (size / 1024 / 1024).toFixed(2) + 'MB'
  }
}

// 下载模板
const downloadTemplate = () => {
  try {
    generateImportTemplate()
    ElMessage.success('模板下载成功')
  } catch (error) {
    ElMessage.error('模板下载失败')
  }
}

// 执行导入
const handleImport = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  if (!importForm.academicYear) {
    ElMessage.warning('请选择学年')
    return
  }

  try {
    importing.value = true
    importProgress.value = 0
    importStatus.value = ''
    importResult.value = null

    // 解析Excel文件
    importProgress.value = 20
    const data = await parseExcelFile(currentFile.value)

    // 验证列
    const columnValidation = validateExcelColumns(data)
    if (!columnValidation.valid) {
      ElMessage.error(columnValidation.message || '数据格式验证失败')
      importing.value = false
      return
    }

    importProgress.value = 40

    // 验证数据行
    const errors: any[] = []
    data.forEach((row: any, index: number) => {
      const validation = validateImportRow(row, index + 2) // +2 because Excel starts at 1 and has header
      if (!validation.valid) {
        errors.push(...validation.errors.map((msg: string) => ({ row: index + 2, message: msg })))
      }
    })

    if (errors.length > 0 && errors.length === data.length) {
      ElMessage.error('数据验证失败,请检查Excel数据')
      importResult.value = {
        success: false,
        successCount: 0,
        failCount: data.length,
        errors: errors
      }
      importing.value = false
      return
    }

    importProgress.value = 60

    // 上传到服务器
    const result = await uploadExcel(
      currentFile.value,
      importForm.academicYear,
      importForm.overwrite
    )

    importProgress.value = 100

    if (result.success && result.data) {
      importResult.value = result.data
      importStatus.value = result.data.failCount === 0 ? 'success' : 'warning'
      
      if (result.data.failCount === 0) {
        ElMessage.success('导入成功!')
      } else {
        ElMessage.warning(`部分数据导入失败,请查看错误详情`)
      }

      // 添加到历史记录
      importHistory.value.unshift({
        id: Date.now(),
        filename: currentFile.value.name,
        academicYear: importForm.academicYear,
        successCount: result.data.successCount,
        failCount: result.data.failCount,
        time: new Date().toLocaleString()
      })
    }
  } catch (error: any) {
    importStatus.value = 'exception'
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 重置
const handleReset = () => {
  uploadRef.value?.clearFiles()
  currentFile.value = null
  importResult.value = null
  importProgress.value = 0
  importStatus.value = ''
}
</script>

<style scoped>
.import-container {
  max-width: 1200px;
}

.import-card,
.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-content {
  padding: 20px 0;
}

.import-form {
  margin-bottom: 30px;
}

.upload-area {
  margin-bottom: 20px;
}

.file-info {
  margin: 20px 0;
}

.import-actions {
  margin: 20px 0;
  text-align: center;
}

.import-progress {
  margin: 20px 0;
}

.import-result {
  margin-top: 20px;
}

.error-list {
  margin-top: 10px;
}

.error-list ul {
  margin: 10px 0;
  padding-left: 20px;
}

.error-list li {
  margin: 5px 0;
  color: #e6a23c;
}

.more-errors {
  margin-top: 10px;
  font-style: italic;
  color: #909399;
}

.history-card :deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
