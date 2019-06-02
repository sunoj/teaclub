<template>
  <div v-if="events && events.length > 0 && loadEvents">
    <div class="popup-show" v-if="showPopup">
      <div class="js_dialog" style="opacity: 1;">
        <div class="weui-mask"></div>
        <hooper>
          <slide class="slide" v-for="(event, index) in events" :key="event.id" :index="index">
            <a :href="`${event.link}`" target="_blank">
              <img :src="event.poster" :title="event.title" width="300"/>
            </a>
          </slide>
          <hooper-navigation slot="hooper-addons"></hooper-navigation>
        </hooper>
        <div class="close-popup" @click="close">&times;</div>
      </div>
    </div>
    <div class="preload">
      <img :src="events[0].poster" width="300"/>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { getSetting, saveSetting } from "../static/utils";
import { Hooper, Slide, Navigation as HooperNavigation } from 'hooper';
import 'hooper/dist/hooper.css';

const today = DateTime.local().toFormat("o")

export default {
  name: "popup",
  components: {
    Hooper,
    Slide,
    HooperNavigation
  },
  data() {
    return {
      showPopup: false,
      loadEvents: false,
      events: getSetting('events', []),
      usage: getSetting(`temporary:usage-popup_d:${today}`, 0),
      display: getSetting("displayPopup", {
        "percentage": 0,
        "limit": 0
      }),
    };
  },
  mounted: async function() {
    setTimeout(() => {
      this.preload()
    }, 200);
    setTimeout(() => {
      this.show()
    }, 400);
  },
  methods: {
    close: async function() {
      this.showPopup = false
      this.$emit('close')
    },
    preload: function () {
      let events = this.getEvents()
      if (events && events.length > 0 && this.display.limit > 0) {
        this.loadEvents = true
      }
    },
    show: function () {
      if (this.loadEvents && this.usage < this.display.limit && this.display.percentage > Math.floor(Math.random() * 100) + 1) {
        if ($(".js_dialog:visible").length < 1) {
          this.showPopup = true
          saveSetting(`temporary:usage-popup_d:${today}`, this.usage + 1)
        }
      }
    },
    getEvents: function() {
      let events = getSetting("events", []);
      events = events.filter(event => DateTime.fromJSDate(new Date(event.validUntil)) > DateTime.local());
      saveSetting("events", events);
      this.events = events
      return events;
    },
  }
};
</script>
<style scoped>
.popup-show{
  position: absolute;
  width: 100%;
  height: 100%;
}
.preload{
  display: none;
}
.popup-show .js_dialog{
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
.hooper{
  max-height: 80%;
  min-height: 450px;
  z-index: 1001;
  width: 400px;
}
.hooper .slide {
  text-align: center;
}
.close-popup{
  border: 2px solid #cacaca;
  border-radius: 20px;
  width: 30px;
  height: 30px;
  z-index: 1002;
  text-align: center;
  font-size: 29px;
  line-height: 26px;
  color: #e8e8e8;
  font-weight: 100;
  margin-top: -20px;
  cursor: pointer;
}
</style>