import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'babel-polyfill';
import
{
  Nav, Image, Card, Layout, Button, Modal, FormFile,
}
  from 'bootstrap-vue/es/components';
import web3 from './contract/web3';
import contract from './contract/contractInstance';

Vue.config.productionTip = false
Vue.use(BootstrapVue);
Vue.use(Nav);
Vue.use(Image);
Vue.use(Card);
Vue.use(FormFile);
Vue.use(Layout);
Vue.use(Button);
Vue.use(Modal);


new Vue({
  router,
  data: {
    currentPosts: [],
    currentAccount: '',
    loading: true,
    contract
  },
  // Gets accounts and current post
  async created(){
    await this.updateAccount();
    await this.getPosts();
  },
  transformToRequire:{
    img: 'src',
    image: 'xlink:href'
  },
  methods:{
    //gets current account, and store it on currentAccount variable
    async updateAccount(){
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      this.currentAccount = account;
  },
  // using the smart contract instance:
  // getCounter() - gets the length of total post
  // getHash() - gets the image and text hashes
  async getPosts(){
    this.loading = false;
    const posts = [];
    const counter = await contract.methods.getCounter().call({
      from: this.currentAccount
    });

    if(counter !== null){
      const hashes = [];
      const caption = [];
      for (let i = counter; i >= 1; i -= 1){
        //console.dir(contract)
        hashes.push(contract.methods.getHash(i).call({
          from: this.currentAccount,
        }));
      }
      const postHashes = await Promise.all(hashes);

      for(let i = 0; i < postHashes.length; i += 1){
        caption.push(fetch(`https://ipfs.io/ipfs/${postHashes[i].text}`)
          .then(res => res.text()));
      }

      const postCaptions = await Promise.all(caption);

      for(let i = 0; i < postHashes.length; i += 1){
        posts.push({
          id: i,
          key: `key${i}`,
          caption: postCaptions[i],
          src: `https://ipfs.io/ipfs/${postHashes[i].img}`
        });
      }

      this.currentPosts = posts;
      this.loading = false;
    }
  },
},
  render: h => h(App),
}).$mount('#app')
