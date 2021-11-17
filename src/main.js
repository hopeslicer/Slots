import { createApp } from 'vue';
import App from './App.vue';
import { store } from './store/store';

const app = createApp(App);

import './assets/tailwind.css'

app.use(store);
app.mount('#app');