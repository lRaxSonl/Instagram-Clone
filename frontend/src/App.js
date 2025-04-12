import React from "react";
import Header from "./componens/Header";
import Image from "./componens/Image"
import logo from "./img/logo.png"

class App extends React.Component {
  helpText = "Help text!"
  render() {
    return (
      <div className="name">
        <Header title="Site header!"/>
        <h1>{this.helpText}</h1>
        <input placeholder={this.helpText} onclick={this.inputClick}
        onMouseEnter={this.mouseOver}></input>
        <p>{this.helpText === "Help text!" ? "Yes":"No"}</p>
        <p>Hello Semjon!</p>
        <Image image={logo} />
      </div>
    )
  }

  inputClick() {
    console.log("Clicked")
  }

  mouseOver() {
    console.log("Mouse Over")
  }
}

export default App