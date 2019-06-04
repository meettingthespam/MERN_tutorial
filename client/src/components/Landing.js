import React from "react";
import PropTypes from "prop-types";

const LandingPage = props => {
  return (
    <section className="landing">
      <div className="dark-overlay">
        <div className="landing-inner">
          <h1 className="x-large">Welcome To CFCC</h1>
          <p className="lead">
            This is the portal for CFCC, if you are not an employee, then it is
            illegal for you to use this site. How it goes. All use will be
            tracked.
          </p>
          <div className="buttons">
            <a href="register.html" className="btn btn-primary">
              Sign Up
            </a>
            <a href="login.html" className="btn btn-light">
              Login
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
