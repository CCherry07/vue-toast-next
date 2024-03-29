<script setup lang="ts">
import { Toaster, toast } from "../../lib/src/index"
import { triggerTimerToast } from "./components/timer-toast"
import { shallowRef } from "vue";
const stacked = shallowRef(false)
const handleWarningClick = () => {
  toast.warning("success")
}
const handleSuccessClick = () => {
  toast.success("success")
}

const handleSwitchStacked = () => {
  stacked.value = !stacked.value
}
</script>

<template>
  <div>
    <button @click="handleSuccessClick">success toast</button>
    <button @click="handleWarningClick">warning toast</button>
    <button @click="triggerTimerToast"> Timer toast</button>
    <button @click="handleSwitchStacked"> switch stacked {{ stacked }}</button>
    <Toaster :stacked="stacked" />
  </div>
</template>

<style scoped></style>
