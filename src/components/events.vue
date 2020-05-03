<template>
  <hooper>
    <slide v-for="(event, index)  in events" :key="event.id" :index="index">
      <a :href="`${event.goodLink}`" target="_blank">
        <img :src="event.banner || event.photo" :title="event.title" height="120"/>
        <p class="title">{{event.title}}</p>
      </a>
    </slide>

    <hooper-navigation slot="hooper-addons"></hooper-navigation>
  </hooper>
</template>
<script>
import { Hooper, Slide, Navigation as HooperNavigation } from 'hooper';
import 'hooper/dist/hooper.css';

import weui from "weui.js";
export default {
  name: "report",
  props: ["events"],
    components: {
    Hooper,
    Slide,
    HooperNavigation
  },
  data() {
    return {
      show: false
    };
  },
  methods: {}
};
</script>
<style scoped>
.hooper{
  height: 120px;
}
.hooper li{
  text-align: center;
}
.hooper p.title{
      position: absolute;
    bottom: 0px;
    text-align: center;
    width: 100%;
    color: #fff;
    background-color: #33333352;
    font-size: 14px;
    padding: 3px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}
</style>
