<script setup lang="ts">
import { Toaster, toast } from "@hot-toast/vue"
import { triggerTimerToast } from "./components/timer-toast"
const handleClick = ()=>{
  toast.success("success")
}

</script>

<template>
  <div>
    <button @click="handleClick">trigger toast</button>
    <button @click="triggerTimerToast">Timer toast</button>
    <Toaster />
  </div>
</template>

<style scoped>

</style>
