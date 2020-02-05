import firebase from "~/libs/firebase";
const db = firebase.database();
const postsRef = db.ref("posts");

export default {
  state: {
    queryLoading: false
  },
  mutations: {
    setQueryLoading(state, payload) {
      state.queryLoading = payload;
    }
  },
  actions: {
    // All Posts
    async loadPosts(vuexContext, payload) {
      vuexContext.commit("setQueryLoading", true);
      try {
        let postsData = null;
        if (payload.endAtKey !== undefined) {
          postsData = await postsRef
            .orderByChild("updatedDate")
            .endAt(payload.endAtKey)
            .limitToLast(payload.limit)
            .once("value");
        } else {
          postsData = await postsRef
            .orderByChild("updatedDate")
            .limitToLast(payload.limit)
            .once("value");
        }
        const loadedPosts = [];
        postsData.forEach(postData => {
          const postObj = postData.val();
          if (postObj.mode === "public") {
            loadedPosts.push(postObj);
          }
        });
        loadedPosts.reverse();
        vuexContext.commit("setQueryLoading", false);
        return loadedPosts;
      } catch (e) {
        console.error("[ERROR-loadPosts]", e);
      }
    },

    // Personal Posts
    async loadPersonalPosts(vuexContext) {
      vuexContext.commit("setQueryLoading", true);
      try {
        const userId = vuexContext.getters.user.id;
        const postsData = await postsRef
          .orderByChild("creator/id")
          .equalTo(userId)
          .once("value");
        const loadedPosts = [];
        postsData.forEach(postData => {
          const postObj = postData.val();
          loadedPosts.push(postObj);
        });
        loadedPosts.reverse();
        vuexContext.commit("setQueryLoading", false);
        return loadedPosts;
      } catch (e) {
        console.error("[ERROR-loadPersonalPosts]", e);
      }
    },

    // Categorized Posts
    async loadCategorizedPosts(vuexContext, category) {
      vuexContext.commit("setQueryLoading", true);
      try {
        const postsData = await postsRef
          .orderByChild("category")
          .equalTo(category)
          .limitToLast(300)
          .once("value");
        const loadedPosts = [];
        postsData.forEach(postData => {
          const postObj = postData.val();
          loadedPosts.push(postObj);
        });
        vuexContext.commit("setQueryLoading", false);
        return loadedPosts.reverse();
      } catch (e) {
        console.error("[ERROR-loadCategorizedPosts]", e);
      }
    },

    // Searched Posts
    async loadSearchPosts(vuexContext, searchKey) {
      vuexContext.commit("setQueryLoading", true);
      try {
        const postsData = await postsRef
          .orderByChild("title")
          .startAt(searchKey)
          .endAt(searchKey + "\uf8ff")
          .limitToLast(300)
          .once("value");
        const loadedPosts = [];
        postsData.forEach(postData => {
          const postObj = postData.val();
          loadedPosts.push(postObj);
        });
        vuexContext.commit("setQueryLoading", false);
        return loadedPosts.reverse();
      } catch (e) {
        console.error("[ERROR-loadSearchPosts]", e);
      }
    }
  },
  getters: {
    queryLoading(state) {
      return state.queryLoading;
    }
  }
};
