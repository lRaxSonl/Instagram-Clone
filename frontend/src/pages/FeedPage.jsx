import React from "react";
import { getPosts } from "../api/posts";
import Header from "../componens/Header";
import { PostCard } from "../componens/PostCard";

class FeedPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: []
        }
    }

  render() {
    const posts = this.state.posts;

    return (
        <>
        <Header />
        <div className="feed-container">
        {posts.length > 0 ? (
            posts.map((post) => (
            <PostCard key={post.id} post={post} />
            ))
        ) : (
            <div className="post">
            <h3>Posts not found</h3>
            </div>
        )}
        </div>
        </>
    )
  }
  

  componentDidMount() {
    getPosts()
    .then((res) => {
        this.setState({posts: res.data})
    })
    .catch((err) => {
        console.log("Someting error: " + err)
    });
  }
}

export default FeedPage;