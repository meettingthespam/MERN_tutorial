import React, { Fragment } from "react";
import "./App.css";
import Navbar from "./components/Navbar.js";
import Landing from "./components/Landing.js";

const App = () => {
  return (
    <Fragment>
      <h1 className="blue_color">App</h1>
      <h1 className="black_color">App</h1>
      <h1 className="gray_color">App</h1>
      <h1 className="white_color">App</h1>
      <h1 className="orange_color">App</h1>
      <h1 className="red_color">App</h1>
      <h1 className="green_color">App</h1>
      <Navbar />
      <Landing />
    </Fragment>
  );
};

export default App;
