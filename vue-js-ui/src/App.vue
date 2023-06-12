<template>
  <!-- <div id="app" class="container"> -->
  <div id="app" class="">
    <!--  <loading :active.sync="isLoading" 
          class="loading"

        :can-cancel="true" 
        :is-full-page="fullPage"></loading> -->

    <transition name="fade">
      <div class="">
        <router-view></router-view>
      </div>
    </transition>
  </div>
</template>
<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}
.gap {
  margin-top: 50px;
}
</style>
