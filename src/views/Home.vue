<template>
  <div class="home">
    <h2>IPFStagram</h2>
    <img src="@/assets/logo.png" width="100px" height="100px"/>
    <Feed/>
  </div>
</template>

<script>
// @ is an alias to /src
import Feed from '@/components/Feed.vue'

export default {
  name: 'home',
  components: {
    Feed
  }
}
</script>
