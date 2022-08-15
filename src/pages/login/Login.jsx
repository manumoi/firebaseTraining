import { Button } from "@mui/material"
import "./login.scss"
import {useContext, useState} from 'react'
import {signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../../firebase.js';
import { useNavigate } from "react-router-dom";
import {AuthContext} from '../../context/authContext'


const Login = () => {

  const [error, setError]= useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const {dispatch} = useContext(AuthContext)

  const handleLogin = (e)=>{
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        dispatch({type:"LOGIN", payload:user})

        setError(false);
        navigate('/');
      })
      .catch((error) => {
        setError(true);
    });
  }


  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email..." onChange={(e)=>setEmail(e.target.value)}></input>
        <input type="password" placeholder="Password..." onChange={(e)=>setPassword(e.target.value)}></input>
        <Button type="submit">Login</Button>
        {error && <span className="errorMessage">User unknown. Check your email and password.</span>}
      </form> 
    </div>
  )
}



export default Login;