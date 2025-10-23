<template>
  <el-config-provider :locale="zhCn">
    <el-container class="layout-container">
      <!-- 侧边菜单栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
        <div class="logo-container">
          <h2 v-if="!isCollapse">体测管理</h2>
          <h2 v-else>体测</h2>
        </div>

        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :router="true"
          background-color="#ffffff"
          text-color="#606266"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
          <el-menu-item index="/scores">
            <el-icon><DataAnalysis /></el-icon>
            <span>成绩管理</span>
          </el-menu-item>

          <el-menu-item index="/import">
            <el-icon><Upload /></el-icon>
            <span>数据导入</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="layout-header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>

          <div class="header-right">
            <span class="school-info">{{ userStore.schoolName }}</span>

            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                {{ userStore.userInfo?.name }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区域 -->
        <el-main class="layout-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores"
import { ElMessageBox } from "element-plus"
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        await userStore.logout()
        router.push("/login")
      })
      .catch(() => {
        // 取消操作
      })
  }
}

// 组件挂载时恢复用户信息
onMounted(() => {
  userStore.restoreUserInfo()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #ffffff;
  transition: width 0.3s;
  overflow-x: hidden;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #e6e6e6;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.logo-container h2 {
  margin: 0;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.el-menu-item:hover {
  background-color: #ecf5ff !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.layout-header {
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.school-info {
  color: #606266;
  font-size: 14px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: color 0.3s;
}

.user-dropdown:hover {
  color: #409eff;
}

.layout-main {
  padding: 20px;
  overflow: hidden;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
