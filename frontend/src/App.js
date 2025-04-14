import React from "react";
import Header from "./componens/Header";
import Posts from "./componens/Posts";

class App extends React.Component {

  render() {
    return (
      <div>
        <Header title="User list"/>

        <main>
          <Posts />
        </main>
        <aside></aside>
      </div>
    )
  }
}

export default App