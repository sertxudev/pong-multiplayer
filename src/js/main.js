// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSocketIO from 'vue-socket.io';

Vue.use(VueRouter);
Vue.use(new VueSocketIO({
  debug: true,
  connection: window.location.host
}));

import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/styles.css'

import $ from 'jquery'
window.$ = $

// 1. Define route components.
// These can be imported from other files
import Spash from './components/Spash';
import Play from './components/Play';
// import Finished from './components/Finished';

const routes = [
  { path: '/', name: 'splash', component: Spash },
  { path: '/play', name: 'play', component: Play },
  // { path: '/finished', name: 'finished', component: Finished },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router,
  sockets: {
    disconnect() {
      location.reload();
    },
    game_data(data) {
      this.game = data;
      if (this.game.player1.id && this.game.player2.id) return this.$router.push({ path: 'play' });
      console.log('game_data', data);
    }
  },  
  data: {
    game: null,
  },
  mounted() {
    if (this.$route.fullPath !== '/') router.replace({ name: 'splash', redirect: '/' });
  }
}).$mount('#app')

// Now the app has started!
// router.replace({ path: '/login', redirect: '/' })
