import axios from "axios"
import React from "react"


class Posts extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            posts: []
        }
    }

  render() {
    if (this.state.posts.length > 0) {
        return (
            <div>
                {this.state.posts.map((el) => (
                    <div className="user">
                        <h3>{el.text} - {el.id}, by {el.user.username}</h3>
                    </div>
                ))}
            </div>
        )
    }else {
        return (
            <div className="post">
                <h3>Posts not found</h3>
            </div>
        )
    }
  }

  componentDidMount() {
    axios.get('http://127.0.0.1:8000/api/posts/')
    .then((res) => {
        this.setState({posts: res.data})
    })
    .catch((err) => {
        console.log("Someting error: " + err)
    })
  }
}

export default Posts