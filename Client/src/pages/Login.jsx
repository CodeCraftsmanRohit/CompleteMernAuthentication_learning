import React, { useState } from "react";
import { assets } from "../assets/assets.js"; // Named import with curly braces
import {useNavigate} from 'react-router-dom'

const Login = () => {

  const navigate =useNavigate()
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
        <img
        onClick={()=>navigate('/')}
          src={assets.logo}
          alt="Logo"
          className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        />
        <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
          <h2 className="text-3xl font-semibold text-white text-center mb:3" >{state === "Sign Up" ? "Create Account" : "Login"}</h2>
          <p className="text-center text-sm mb-6">
            {state === "Sign Up"
              ? "Create your account!"
              : "Login to your account!"}
          </p>

        <form action="">
          {state ==='Sign Up' && (  <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]' >
            <img src={assets.person_icon} alt="" />
            <input onChange={e=>setName(e.target.value)} value={name} className="bg-transparent outline-none" type="text" name="" placeholder="Full Name" required id="" />
          </div>)}


          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]' >
            <img src={assets.mail_icon} alt="" />
            <input value={email} onChange={e=>setEmail(e.target.value)}  className="bg-transparent outline-none" type="email" name="" placeholder="E-mail ID" required id="" />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]' >
            <img src={assets.lock_icon} alt="" />
            <input onChange={e=>setPassword(e.target.value)} value={password} className="bg-transparent outline-none" type="password" name="" placeholder="Password" required id="" />
          </div>
          <p onClick={()=>navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">Forgot password?</p>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900">{state}</button>
        </form>

        {state==='Sign Up'?( <p className="text-gray-400 text-center text-xs mt-4">Already have an account?{' '}
          <span onClick={()=>setState('Login')}  className="text-blue-400 cursor-pointer underline">Login here</span>
        </p>):( <p className="text-gray-400 text-center text-xs mt-4">Don't have an account?{' '}
          <span onClick={()=>setState('Sign Up')} className="text-blue-400 cursor-pointer underline">Sign Up</span>
        </p>)}




        </div>
      </div>
    </div>
  );
};

export default Login;