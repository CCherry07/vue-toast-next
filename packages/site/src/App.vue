<script setup lang="ts">
import { Toaster, toast } from "vue-toast-next"
import { triggerTimerToast } from "./components/timer-toast"
import { shallowRef } from "vue";
const stacked = shallowRef(false)
const handleClick = () => {
  toast.success("success")
}

const handleSwitchStacked = () => {
  stacked.value = !stacked.value
}
</script>

<template>
  <div>
    <button @click="handleClick">trigger toast</button>
    <button @click="triggerTimerToast"> Timer toast</button>
    <button @click="handleSwitchStacked"> switch stacked {{ stacked }}</button>
    <Toaster :stacked="stacked" />
  </div>
</template>

<style scoped></style>
