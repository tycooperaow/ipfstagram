<template>
  <div class="feed">
      <!-- Upload Interface -->
      <div id="upload">
        <div v-if="this.$root.$data.loading === false">
          <h1>Post Here!</h1>
          <h5><em>share your memories.</em></h5>

          <!-- Form for file choose, caption text and submission -->
          <form class="margin-sm" @submit.stop.prevent="handleSubmit">
            <div class="border-style">
              <b-form-file
                plain
                @change="captureFile"
              />
            </div>
            <b-form-textarea
              v-model="caption"
              placeholder="Post description"
              :rows="3"
              :max-rows="6"
              class="margin-xs"
            />
            <b-button
              class="margin-xs"
              variant="secondary""
              @click="handleOk"
            >
              Upload
            </b-button>
          </form>
        </div>

        <div
          v-if="this.$root.$data.loading === true"
          style="margin-top: 10%; margin-bottom: 5%"
        >
          <img
            class="upload-load"
            src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif"
          >
        </div>
      </div>

      <!-- Posts Interface -->
      <div class="card-feed">
        <ul class="home-list">
          <li
            v-for="post in this.$root.$data.currentPosts"
            :key="post.id"
            :item="post">
            <b-card  border-variant="secondary" :img-src="post.src">
              <p class="home-card-text">
                {{ post.caption }}
              </p>
            </b-card>
          </li>
        </ul>
        <!-- <p>Could not load ipfs data. {{this.$root.$data.currentPosts}}</p> -->
      </div>
  </div>
</template>

<script>
import ipfs from '../contract/ipfs';

export default {
  name: 'Feed',
  data(){
    return{
      buffer: '',
      caption: ''
    }
  },
  created(){
    console.log(this.$root.$data);
  },
  methods: {
    captureFile(file){
      const reader = new FileReader();
      if(typeof file !== 'undefined'){
        reader.readAsArrayBuffer(file.target.files[0]);
        reader.onloadend = async () => {
          this.buffer =await this.convertToBuffer(reader.result);
        };
      } else this.buffer = '';
    },
  //Converts arraybuffer into buffer for IPFS
  async convertToBuffer(reader){
    return Buffer.from(reader);
  },
  //Submits buffered image and text to IPFS
  // Gets hashes and store them
  // inside of sendHash from contract
  onSubmit(){
    alert('Uploading on IPFS');//prettify
    this.$root.loading = true;
    let imgHash;
    ipfs .add(this.buffer)
    .then((hashedImg) => {
      imgHash = hashedImg[0].hash;
      console.log("imgHash: " + imgHash);
      return this.convertToBuffer(this.caption);
    }).then(bufferDesc => ipfs.add(bufferDesc)
        .then(hashedText => hashedText[0].hash)).then((textHash) => {
          this.$root.contract.methods
          .sendHash(imgHash, textHash)
          .send({ from: this.$root.currentAccount},
          (error, transactionHash) => {
            if (typeof transactionHash !== 'undefined'){
              alert(`Storing img hash: ${imgHash} on Ethereum...`);
              this.$root.contract.once('NewPost',
              {from: this.$root.currentAccount},
            () => {
              this.$root.getPosts();
              alert('Operation Finished! Refetching...');
              });
            } else this.$root.lodaing = false;
          });
        });
      },
    handleOk(){
      if(!this.buffer || !this.caption){ //Something wrong with the buffer

        alert('Please fill in the information. ');
      } else {
        this.onSubmit();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.feed{
  display: flex;
  justify-content: center;
  color: #2c3e50;
  margin-top: 3%;
}
.home-load {
  width: 50px;
  height: 50px;
}
.card img {
  object-fit: cover;
  height: 500px;
  width: 500px;
}
.card {
  text-align: left;
  width: 500px;
  margin-bottom: 20px;
}
.home-list{
  padding: 0;
  list-style: none;
}
.home-card-text {
  text-align: justify;
  margin-top: 10px;
}
#upload {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 5%;
  width: 500px;
}
.upload-load {
  width: 50px;
  height: 50px;
}
.card-feed{
  position: relative;
  margin-top:100%;
  bottom: 0;
  align-text: center;
  margin: auto;
}
.margin-xs {
  margin-top: 3%;
}
.margin-sm {
  margin-top: 7%;
}
.border-style {
  border: 1px solid #ced4da;
}
</style>
