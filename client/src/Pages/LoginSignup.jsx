import React, { useContext, useState } from "react";
import "./CSS/LoginSignup.css";
import { ShopContext } from "../Context/ShopContext";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setformData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const {backendUrl} = useContext(ShopContext)

  const changeHandler = (e)=>{
    setformData({...formData,[e.target.name]:e.target.value})
  }

  const login = async () => {

    let responseData ;
    await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers:{
        Accept: "application/form-data",
        "Content-Type": "application.json"
      },
      body:JSON.stringify(formData),
    }).then((response)=> response.json())
    .then((data)=> responseData=data)

    
    if(responseData.success){
      localStorage.setItem("auth-token", responseData.token)
      window.location.replace("/");
    }
    else{
      alert(responseData.errors)
    }
  };

  const signup = async () => {
    let responseData ;
    await fetch(`${backendUrl}signup`, {
      method: "POST",
      headers:{
        Accept: "application/form-data",
        "Content-Type": "application/json"
      },
      body:JSON.stringify(formData),
    }).then((response)=> response.json())
    .then((data)=> responseData=data)


    if(responseData.success){
      localStorage.setItem("auth-token", responseData.token)
      window.location.replace("/");
    }
    else{
      alert(responseData.errors)
    }



  };
  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input type="text" 
            name="username" 
            value={formData.username}
            placeholder="Your Name" 
             onChange={changeHandler} />
          ) : (
            <></>
          )}

          <input type="email" 
          name="email"
          value={formData.email}
          placeholder="Email Address" 
          onChange={changeHandler}/>

          <input type="password"
          name="password" 
          value={formData.password}
          placeholder="Password" 
          onChange={changeHandler}/>
        </div>

        <button
          onClick={() => {
            state === "Login" ? login() : signup();
          }}
        >
          Continue
        </button>

        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}> Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}> Click here</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
