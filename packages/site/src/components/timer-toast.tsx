import { Toast, toast } from "vue-toast-next";
import { ref } from "vue";

// Toast with a countdown timer
const duration = 6000
export const triggerTimerToast = () => {
  const life = ref(100);
  const setLife = (v: number) => {
    life.value = v
  }
  const intervals = []
  const clearIntervals = () => {
    intervals.forEach(interval => interval && clearInterval(interval))
  }
  const callProgress = (t: Toast) => {
    clearIntervals()
    const interval = setInterval(() => {
      if (t.paused) {
        return
      }
      const diff = Date.now() - t.createdAt - t.pauseDuration
      setLife(100 - (diff / duration * 100));
      if (life.value < 0) {
        clearInterval(interval)
        return
      }
    });
    intervals.push(interval)
  }
  return toast.custom((t) => {
    callProgress(t)
    return <div class={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-cyan-600 p-3 rounded-md shadow-md min-w-[350px]`}>
      <div class="flex gap-2">
        <div class="flex flex-1 flex-col">
          <div class="font-medium text-white">New version available</div>
          <div class="text-sm text-cyan-50" >Updating to <strong>{
              t.id
            }</strong></div>
        </div>
        <div class="flex items-center">
          <button
            class="px-3.5 h-4/5 tracking-wide font-medium rounded-md text-sm text-white bg-cyan-500 hover:bg-cyan-500/70"
            onClick={() => toast.dismiss(t.id)} >
            CANCEL
          </button>
        </div>
        <div class="flex items-center">
          <button
            class="px-2.5 flex items-center relative h-4/5 tracking-wide rounded-md text-2xl text-white bg-cyan-500/40 hover:bg-cyan-500/20"
            onClick={() => toast.dismiss(t.id)}
          >
            x
          </button>
        </div>
      </div>
      <div class="relative pt-4" >
        <div class="w-full h-1 rounded-full bg-cyan-900"></div>
        <div
          class="h-1 top-4 absolute rounded-full bg-cyan-50"
          style={{ width: `${life.value}%` }}
        ></div>
      </div>
    </div>
  }, {
    duration,
    position: 'top-left'
  })
}

