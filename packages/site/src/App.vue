<script setup lang="ts">
import { Toaster, toast } from "vue-toast-next"
import { triggerTimerToast } from "./components/timer-toast"
import { shallowRef } from "vue";
const stacked = shallowRef(false)
const handleClick = (type: string) => {
  toast[type](type)
}

const handleSwitchStacked = () => {
  stacked.value = !stacked.value
}
</script>

<template>
  <div>
    <button @click="handleClick('success')">success toast</button>
    <button @click="handleClick('warning')">warning toast</button>
    <button @click="handleClick('error')">warning toast</button>
    <button @click="triggerTimerToast"> Timer toast</button>
    <button @click="handleSwitchStacked"> switch stacked {{ stacked }}</button>
    <Toaster :stacked="stacked" />
  </div>
</template>

<style scoped></style>
