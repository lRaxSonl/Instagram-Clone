import React from "react";
import { getPosts } from "../api/posts";
import Header from "../componens/Header";
import { PostCard } from "../componens/PostCard";
import AddPostForm from "../componens/forms/AddPostForm";
import { getCurrentUser } from "../api/users";

class FeedPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: [],
            currentUser: null
        }

        this.handlePostCreated = this.handlePostCreated.bind(this);
    }
    

  render() {
    const posts = this.state.posts;
    const currentUser = this.state.currentUser;

    return (
        <>
        <Header />
        <div className="feed-container">
        {posts.length > 0 ? (
            posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))
        ) : (
            <div className="post">
            <h3>Posts not found</h3>
            </div>
        )}
        </div>
        <AddPostForm onPostCreated={this.handlePostCreated} />
        </>
    )
  }

  handlePostCreated(newPost) {
    this.setState((prevState) => ({
      posts: [newPost, ...prevState.posts],
    }));
  }
  

  componentDidMount() {
    getPosts()
    .then((res) => {
        this.setState({posts: res.data})
    })
    .catch((err) => {
        console.error("Someting error: " + err)
    });

    getCurrentUser().then((res) => {
      this.setState({ currentUser: res.data });
    })
    .catch((err) => {
      console.error("Error when fetching the user." + err)
    })
  }

  
}

export default FeedPage;