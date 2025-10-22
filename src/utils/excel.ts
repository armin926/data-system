// Excel处理工具函数
import * as XLSX from 'xlsx'
import type { ImportDataRow } from '@/types'

/**
 * 解析Excel文件
 */
export function parseExcelFile(file: File): Promise<ImportDataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        // 读取第一个sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('文件中没有找到sheet'))
          return
        }
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          reject(new Error('无法读取sheet内容'))
          return
        }

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json<ImportDataRow>(worksheet)

        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * 验证Excel文件格式
 */
export function validateExcelFile(file: File): { valid: boolean; message?: string } {
  // 检查文件类型
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
    return { valid: false, message: '文件格式必须为.xls或.xlsx' }
  }

  // 检查文件大小(最大10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, message: '文件大小不能超过10MB' }
  }

  return { valid: true }
}

/**
 * 验证Excel数据必填列
 */
export function validateExcelColumns(data: any[]): { valid: boolean; message?: string } {
  if (!data || data.length === 0) {
    return { valid: false, message: 'Excel文件没有数据' }
  }

  const requiredColumns = [
    '学号',
    '姓名',
    '性别',
    '年级',
    '班级',
    '身高(厘米)',
    '体重(千克)',
    '肺活量(毫升)',
    '50米跑(秒)',
    '1分钟跳绳(次)',
    '坐位体前屈(厘米)',
    '立定跳远(厘米)'
  ]

  const firstRow = data[0]
  const missingColumns = requiredColumns.filter(col => !(col in firstRow))

  if (missingColumns.length > 0) {
    return {
      valid: false,
      message: `缺少必填列: ${missingColumns.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * 导出Excel文件
 */
export function exportToExcel(data: any[], filename: string) {
  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 生成Excel文件
  XLSX.writeFile(workbook, filename)
}

/**
 * 下载文件(Blob)
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 生成导入模板
 */
export function generateImportTemplate(): void {
  const templateData = [
    {
      '学号': '2024001',
      '姓名': '张三',
      '性别': '男',
      '年级': '六年级',
      '班级': '1班',
      '身高(厘米)': 165,
      '体重(千克)': 52,
      '肺活量(毫升)': 2800,
      '50米跑(秒)': 8.5,
      '1分钟跳绳(次)': 150,
      '1分钟仰卧起坐(次)': '',
      '坐位体前屈(厘米)': 12.5,
      '立定跳远(厘米)': 185
    },
    {
      '学号': '2024002',
      '姓名': '李四',
      '性别': '女',
      '年级': '六年级',
      '班级': '1班',
      '身高(厘米)': 160,
      '体重(千克)': 48,
      '肺活量(毫升)': 2600,
      '50米跑(秒)': 9.2,
      '1分钟跳绳(次)': 140,
      '1分钟仰卧起坐(次)': 45,
      '坐位体前屈(厘米)': 15.0,
      '立定跳远(厘米)': 175
    }
  ]

  exportToExcel(templateData, '体测数据导入模板.xlsx')
}
