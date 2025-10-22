<template>
  <div class="editable-cell" @click="startEdit">
    <span v-if="!isEditing" class="cell-value">{{ displayValue }}</span>
    <el-input
      v-else
      ref="inputRef"
      v-model="editValue"
      size="small"
      @blur="handleBlur"
      @keyup.enter="handleSave"
      @keyup.esc="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { InputInstance } from 'element-plus'

interface Props {
  value: number | string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [value: number]
}>()

// 编辑状态
const isEditing = ref(false)
const editValue = ref('')
const inputRef = ref<InputInstance>()

// 显示值
const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(1)
  }
  return props.value
})

// 开始编辑
const startEdit = () => {
  editValue.value = String(props.value)
  isEditing.value = true
  
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 失焦处理
const handleBlur = () => {
  handleSave()
}

// 保存
const handleSave = () => {
  const newValue = parseFloat(editValue.value)
  
  if (!isNaN(newValue) && newValue !== props.value) {
    emit('save', newValue)
  }
  
  isEditing.value = false
}

// 取消
const handleCancel = () => {
  isEditing.value = false
}
</script>

<style scoped>
.editable-cell {
  cursor: pointer;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.editable-cell:hover .cell-value {
  color: #409EFF;
}

.cell-value {
  transition: color 0.3s;
}
</style>
