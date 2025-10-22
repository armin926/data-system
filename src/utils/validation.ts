// 数据校验工具函数
import type { ImportDataRow } from '@/types'

/**
 * 验证学号
 */
export function validateStudentNo(studentNo: string): { valid: boolean; message?: string } {
  if (!studentNo || studentNo.trim() === '') {
    return { valid: false, message: '学号不能为空' }
  }
  if (studentNo.length > 20) {
    return { valid: false, message: '学号长度不能超过20' }
  }
  return { valid: true }
}

/**
 * 验证姓名
 */
export function validateName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, message: '姓名不能为空' }
  }
  if (name.length < 2 || name.length > 20) {
    return { valid: false, message: '姓名长度应在2-20之间' }
  }
  return { valid: true }
}

/**
 * 验证性别
 */
export function validateGender(gender: string): { valid: boolean; message?: string } {
  if (gender !== '男' && gender !== '女') {
    return { valid: false, message: '性别必须为"男"或"女"' }
  }
  return { valid: true }
}

/**
 * 验证身高
 */
export function validateHeight(height: number): { valid: boolean; message?: string } {
  if (isNaN(height) || height <= 0) {
    return { valid: false, message: '身高必须为大于0的数字' }
  }
  if (height < 50 || height > 250) {
    return { valid: false, message: '身高应在50-250厘米之间' }
  }
  return { valid: true }
}

/**
 * 验证体重
 */
export function validateWeight(weight: number): { valid: boolean; message?: string } {
  if (isNaN(weight) || weight <= 0) {
    return { valid: false, message: '体重必须为大于0的数字' }
  }
  if (weight < 10 || weight > 200) {
    return { valid: false, message: '体重应在10-200千克之间' }
  }
  return { valid: true }
}

/**
 * 验证肺活量
 */
export function validateVitalCapacity(capacity: number): { valid: boolean; message?: string } {
  if (isNaN(capacity) || capacity <= 0) {
    return { valid: false, message: '肺活量必须为大于0的整数' }
  }
  if (capacity < 500 || capacity > 8000) {
    return { valid: false, message: '肺活量应在500-8000毫升之间' }
  }
  return { valid: true }
}

/**
 * 验证50米跑
 */
export function validateRun50m(time: number): { valid: boolean; message?: string } {
  if (isNaN(time) || time <= 0) {
    return { valid: false, message: '50米跑成绩必须为大于0的数字' }
  }
  if (time < 4 || time > 20) {
    return { valid: false, message: '50米跑成绩应在4-20秒之间' }
  }
  return { valid: true }
}

/**
 * 验证跳绳
 */
export function validateRopeSkipping(count: number): { valid: boolean; message?: string } {
  if (isNaN(count) || count < 0) {
    return { valid: false, message: '跳绳次数必须为非负整数' }
  }
  if (count > 300) {
    return { valid: false, message: '跳绳次数应在0-300次之间' }
  }
  return { valid: true }
}

/**
 * 验证仰卧起坐
 */
export function validateSitUps(count: number, gender: string): { valid: boolean; message?: string } {
  if (gender === '男') {
    return { valid: true }  // 男生不需要此项目
  }
  if (isNaN(count) || count < 0) {
    return { valid: false, message: '仰卧起坐次数必须为非负整数' }
  }
  if (count > 100) {
    return { valid: false, message: '仰卧起坐次数应在0-100次之间' }
  }
  return { valid: true }
}

/**
 * 验证坐位体前屈
 */
export function validateSitAndReach(distance: number): { valid: boolean; message?: string } {
  if (isNaN(distance)) {
    return { valid: false, message: '坐位体前屈必须为数字' }
  }
  if (distance < -20 || distance > 50) {
    return { valid: false, message: '坐位体前屈应在-20到50厘米之间' }
  }
  return { valid: true }
}

/**
 * 验证立定跳远
 */
export function validateStandingJump(distance: number): { valid: boolean; message?: string } {
  if (isNaN(distance) || distance <= 0) {
    return { valid: false, message: '立定跳远必须为大于0的数字' }
  }
  if (distance < 50 || distance > 350) {
    return { valid: false, message: '立定跳远应在50-350厘米之间' }
  }
  return { valid: true }
}

/**
 * 验证导入数据行
 */
export function validateImportRow(row: ImportDataRow, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证学号
  const studentNoValidation = validateStudentNo(row.学号)
  if (!studentNoValidation.valid) {
    errors.push(`第${rowIndex}行: ${studentNoValidation.message}`)
  }

  // 验证姓名
  const nameValidation = validateName(row.姓名)
  if (!nameValidation.valid) {
    errors.push(`第${rowIndex}行: ${nameValidation.message}`)
  }

  // 验证性别
  const genderValidation = validateGender(row.性别)
  if (!genderValidation.valid) {
    errors.push(`第${rowIndex}行: ${genderValidation.message}`)
  }

  // 验证各项成绩
  const heightValidation = validateHeight(row['身高(厘米)'])
  if (!heightValidation.valid) {
    errors.push(`第${rowIndex}行: ${heightValidation.message}`)
  }

  const weightValidation = validateWeight(row['体重(千克)'])
  if (!weightValidation.valid) {
    errors.push(`第${rowIndex}行: ${weightValidation.message}`)
  }

  const vitalCapacityValidation = validateVitalCapacity(row['肺活量(毫升)'])
  if (!vitalCapacityValidation.valid) {
    errors.push(`第${rowIndex}行: ${vitalCapacityValidation.message}`)
  }

  const run50mValidation = validateRun50m(row['50米跑(秒)'])
  if (!run50mValidation.valid) {
    errors.push(`第${rowIndex}行: ${run50mValidation.message}`)
  }

  const ropeSkippingValidation = validateRopeSkipping(row['1分钟跳绳(次)'])
  if (!ropeSkippingValidation.valid) {
    errors.push(`第${rowIndex}行: ${ropeSkippingValidation.message}`)
  }

  // 女生需要验证仰卧起坐
  if (row.性别 === '女' && row['1分钟仰卧起坐(次)'] !== undefined) {
    const sitUpsValidation = validateSitUps(row['1分钟仰卧起坐(次)'] || 0, row.性别)
    if (!sitUpsValidation.valid) {
      errors.push(`第${rowIndex}行: ${sitUpsValidation.message}`)
    }
  }

  const sitAndReachValidation = validateSitAndReach(row['坐位体前屈(厘米)'])
  if (!sitAndReachValidation.valid) {
    errors.push(`第${rowIndex}行: ${sitAndReachValidation.message}`)
  }

  const standingJumpValidation = validateStandingJump(row['立定跳远(厘米)'])
  if (!standingJumpValidation.valid) {
    errors.push(`第${rowIndex}行: ${standingJumpValidation.message}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
