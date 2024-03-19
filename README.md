## Features

- 🔥 **Hot by default**
- 🔩 **Easily Customizable**
- ⏳ **Promise API** - _Automatic loader from a promise_
- 🕊 **Lightweight** - _less than 5kb including styles_
- ✅ **Accessible**
- 🤯 **Headless Hooks** - _Create your own with [`useToaster()`]

## Installation

#### With yarn

```sh
yarn add vue-toast-next
```

#### With NPM

```sh
npm install vue-toast-next
```

## Getting Started

Add the Toaster to your app first. It will take care of rendering all notifications emitted. Now you can trigger `toast()` from anywhere!

```html
<script setup lang="ts">
import { Toaster, toast } from "vue-toast-next"
const notify = () => toast('Here is your toast.');

</script>

<template>
  <div>
    <button @click="notify">Make me a toast</button>
    <Toaster />
  </div>
</template>
```

## Documentation
