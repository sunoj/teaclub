<template>
  <div id="discounts" class="contents-box discounts">
    <div class="top-bar">
      <div class="tabs">
        <ul class="tab-list">
          <li class="tabs-item">
            <a
              :class="discountTab == 'featured' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('featured')"
            >精选</a>
          </li>
          <li class="tabs-item">
            <a
              :class="discountTab == 'concerned' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('concerned')"
            >关注</a>
          </li>
          <li class="tabs-item">
            <a
              :class="discountTab == 'hot' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('hot')"
            >热榜</a>
          </li>
        </ul>
      </div>
      <div class="select-tag" v-if="selectTag">
        <div class="tag-box">
          <span class="tag-name">{{selectTag.name}}</span>
        </div>
        <button
          v-if="followed"
          class="weui-btn weui-btn_mini weui-btn_disabled"
          @click="unfollowTag(selectTag)"
        >取消</button>
        <button
          v-else
          class="weui-btn weui-btn_mini weui-btn_primary"
          @click="followTag(selectTag)"
        >关注</button>
      </div>
      <div class="search" v-else>
        <input v-model="keyword" placeholder="输入关键词搜索" v-on:keyup.enter="search">
        <i v-if="showClear" class="circle-close" @click="clear">&times;</i>
      </div>
    </div>
    <div class="weui-cells discount-list" v-if="discountList">
      <events :events="events" v-if="discountTab == 'featured' && events && events.length > 0"></events>
      <div class="discounts-box" v-for="discount in discountList" :key="discount.id">
        <div :class="discount.pinned ? 'discount pinned' : 'discount'">
          <div class="title" @mouseover="discount.focus = true" @mouseout="discount.focus = false">
            <span class="merchant" v-if="discount.merchant">
              <img v-lazy="discount.merchant.icon" :alt="discount.merchant.name">
            </span>
            <a :href="`${discount.goodLink}`" target="_blank">{{discount.title}}</a>
            <span class="discount_price">{{discount.price}}</span>
            <report :discount="discount"></report>
          </div>
          <div class="description">
            <a :href="`${discount.goodLink}`" target="_blank">
              <img
                v-if="discount.photo"
                v-lazy="`${discount.photo}`"
                @error.once="backup_picture($event)"
                width="75"
                class="discount-photo backup_picture"
                :alt="discount.title"
              >
            </a>
            <p>{{discount.description}}</p>
          </div>
          <div class="tags">
            <span
              class="tag"
              v-for="tag in discount.tags"
              :key="tag.id"
              @click="filterByTag(tag)"
            >{{tag.name}}</span>
          </div>
          <div class="weui-cell__ft">
            <span class="time">{{discount.displayTime}}</span>
            <a
              v-if="discount.couponLink"
              class="get-coupon"
              data-microtip-position="top" role="tooltip"
              :aria-label="discount.couponName"
              :href="`${discount.couponLink}`"
              target="_blank"
            >优惠券</a>
            <a class="go-buy" :href="`${discount.goodLink}`" target="_blank">去购买</a>
          </div>
        </div>
      </div>
      <infinite-loading v-if="discountList.length > 20" spinner="waveDots" @infinite="infiniteHandler">
        <div slot="no-more" class="no-more">😭暂时没有近期优惠了</div>
        <div slot="no-results" class="no-results">😭没有更多优惠信息了</div>
      </infinite-loading>
      <div v-if="discountTab == 'concerned' && followedTagIds.length < 1" class="no_message">
        <h4>暂时还没有关注任何标签</h4>
        <p class="tips">点击优惠信息中的标签可以筛选并关注标签哦</p>
      </div>
      <div v-if="keyword && discountList.length < 1" class="no_message">
        <h4>没有找到任何优惠</h4>
        <p class="tips">为了保证结果有效性，只展示近两周的优惠</p>
      </div>
      <div v-if="discountList.length > 0" class="self-recommendation">
        <p class="tips">商家自荐/优惠爆料可联系微信：cindywchat</p>
      </div>
    </div>
    <div class="loading" v-else>
      <loading></loading>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import InfiniteLoading from 'vue-infinite-loading';
import { getSetting, readableTime } from "../utils";
import loading from "./loading.vue";
import report from "./report.vue";
import events from "./events.vue";

export default {
  name: "discounts",
  components: { loading, report, events, InfiniteLoading },
  data() {
    return {
      followedTagIds: getSetting("followedTagIds", []),
      discountTab: "featured",
      discountList: null,
      selectTag: null,
      page: 1,
      keyword: null
    };
  },
  mounted: async function() {
    this.getDiscounts();
  },
  computed: {
    followed: function() {
      return (
        this.selectTag &&
        this.followedTagIds.length > 0 &&
        this.followedTagIds.indexOf(this.selectTag.id) > -1
      );
    },
    showClear: function() {
      return this.keyword && this.keyword.length > 0;
    },
    events: function() {
      return this.discountList ? this.discountList.filter(discount => discount.event) : [];
    },
    condition: function() {
      if (this.keyword) {
        return {
          keyword: this.keyword
        }
      }
      switch (this.discountTab) {
        case "featured":
          return {
            all: false
          };
          break;
        case "concerned":
          if (this.followedTagIds.length > 0) {
            return {
              tagIds: this.followedTagIds.join(",")
            };
          } else {
            return {};
          }
          break;
        case "hot":
          return {
            hot: true
          };
          break;
        default:
          break;
      }
      return {}
    }
  },
  methods: {
    backup_picture: function(e) {
      e.currentTarget.src = "https://jjbcdn.zaoshu.so/web/img_error.png";
    },
    loadDiscountFormApi: async function(params) {
      let queryParams = new URLSearchParams(params);
      let response = await fetch(
        `https://teaclub.zaoshu.so/discount?${queryParams.toString()}`
      );
      return await response.json();
    },
    getDiscounts: async function(condition) {
      this.discountList = null;
      this.selectTag = null;
      this.page = 1
      const discounts = await this.loadDiscountFormApi(condition)
      this.discountList = discounts.map(function(discount) {
        discount.displayTime = readableTime(
          DateTime.fromISO(discount.createdAt)
        );
        discount.focus = false
        return discount;
      });
      localStorage.setItem("readDiscountAt", new Date());
      this.$forceUpdate();
    },
    infiniteHandler: async function ($state) {
      if (this.selectTag) return $state.complete();
      const discounts = await this.loadDiscountFormApi(Object.assign({}, this.condition, {
        page: this.page,
      }))
      if (discounts.length) {
        this.page += 1;
        this.discountList.push(...discounts.map(function(discount) {
          discount.displayTime = readableTime(
            DateTime.fromISO(discount.createdAt)
          );
          discount.focus = false
          return discount;
        }));
        $state.loaded();
      } else {
        $state.complete();
      }
    },
    search: async function() {
      this.getDiscounts(this.condition);
    },
    clear: async function() {
      this.keyword = null;
      this.switchTab("featured");
    },
    filterByTag: async function(tag) {
      this.discountTab = null;
      this.discountList = null;
      this.page = 1
      let response = await fetch(
        `https://teaclub.zaoshu.so/discount/tag/${tag.id}`
      );
      let data = await response.json();
      this.selectTag = data.tag;
      this.discountList = data.discounts.map(function(discount) {
        discount.displayTime = readableTime(
          DateTime.fromISO(discount.createdAt)
        );
        discount.focus = false
        return discount;
      });
      this.$forceUpdate();
    },
    unfollowTag: async function(tag) {
      this.followedTagIds = this.followedTagIds.filter(
        tagId => tagId != tag.id
      );
      localStorage.setItem(
        "followedTagIds",
        JSON.stringify(this.followedTagIds)
      );
    },
    followTag: async function(tag) {
      let followedTagIds = this.followedTagIds;
      followedTagIds.push(tag.id);
      localStorage.setItem(
        "followedTagIds",
        JSON.stringify(this.followedTagIds)
      );
    },
    switchTab: async function(type) {
      this.discountTab = type;
      this.selectTag = null;
      if (type == "concerned" && this.followedTagIds.length < 1) {
        this.discountList = []
      } else {
        this.getDiscounts(this.condition);
      }
    }
  }
};
</script>

<style scoped>
.tabs {
  height: 40px;
  width: 200px;
  float: left;
}

.tab-list {
  margin-bottom: 0;
  box-shadow: none;
  padding-top: 0.2em;
  padding-left: 0.2em;
}

.tab-list li {
  list-style-type: none;
}

.tab-list .tabs-item {
  display: inline-block;
  padding: 0 15px;
}

.tab-list .tabs-link {
  position: relative;
  display: inline-block;
  padding: 12px 0;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.tabs-link.is-active {
  font-weight: 600;
  color: #921714;
}

.tabs-link.is-active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  background: #921714;
  content: "";
}
.tags {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 55%;
  height: 26px;
  display: -webkit-box;
  max-height: 26px;
  -webkit-line-clamp: 1;
}
.tag {
  font-size: 12px;
  color: #696969;
  cursor: pointer;
  padding: 0.5em;
  margin-right: 0.5em;
}

.top-bar {
  height: 47px;
  border-bottom: 1px solid #eeeeee3d;
  z-index: 10;
  display: flex;
  justify-content: space-between;
}

.select-tag,
.search {
  line-height: 50px;
  font-size: 14px;
  text-align: right;
  position: relative;
}

.search input {
  -webkit-appearance: none;
  border-radius: 4px;
  border: 1px solid #0000003d;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 30px;
  line-height: 30px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  margin-top: 12px;
  margin-right: 6px;
  background: #eeeeee42;
}

.search input:focus {
  outline: none;
  border-color: #409eff;
}

.search .circle-close {
  position: absolute;
  right: 12px;
  color: #ccc;
  padding: 0 2px;
  cursor: pointer;
}

.tag-box {
  width: 140px;
  text-align: right;
  float: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -moz-box-orient: vertical;
  -webkit-box-orient: vertical;
}

.select-tag span.tag-name {
  font-size: 14px;
  padding: 6px 8px;
  vertical-align: middle;
  color: #737373;
  height: 30px;
  line-height: 30px;
  margin-top: 11px;
}

.select-tag a.weui-btn {
  vertical-align: middle;
  margin-right: 1em;
  padding-right: 16px;
}
.discount-list {
  overflow-y: auto;
  height: 465px;
  margin-top: 0;
}

.discount-list li {
  display: block;
}

.discount-list h5 {
  padding: 0.2em 1em;
}

.discount {
  border-bottom: 1px solid #eeeeee3d;
  padding: 12px 8px;
  position: relative;
}

.discount.pinned {
  background-color: #fff7e0;
}

.discount .title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  max-height: 36px;
  -webkit-line-clamp: 2;
  -moz-box-orient: vertical;
  -webkit-box-orient: vertical;
  padding: 5px;
  line-height: 22px;
  font-size: 15px;
  font-weight: 500;
}
.discount .description {
  display: flex;
  padding: 15px 5px;
}

.discount .discount-photo {
  width: 75px;
  height: 75px;
}

.discount_price {
  color: #f04848;
  font-weight: bold;
}

.discount .time {
  font-size: 12px;
}

.discount .description p {
  display: inline-block;
  font-size: 13px;
  color: #666;
  width: 340px;
  padding-left: 10px;
  max-height: 75px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -moz-box-orient: vertical;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.discount .merchant {
  height: 15px;
  line-height: 15px;
  display: inline-block;
  vertical-align: middle;
  margin-top: -4px;
}

.discount .get-coupon {
  font-size: 12px;
  padding: 0.3em;
}

.discount .weui-cell__ft {
  margin-top: -25px;
  padding-bottom: 5px;
}

.discount a.go-buy:hover {
  color: #fff;
  background: #149813;
}

.weui-cells:after{
  border-bottom: none
}

.no-more, .no-results{
    color: #666;
    padding: 3px;
    font-size: 14px;
}
</style>