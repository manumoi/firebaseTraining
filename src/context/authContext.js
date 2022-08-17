import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./authReducer";

const INITIAL_STATE = {
  currentUser: (JSON.parse(localStorage.getItem("user")) || null)
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, authDispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    console.log("User has changed. Process LocalStorage")
    console.log(state.currentUser)
    if (state.currentUser=== null){
      localStorage.setItem("user", null);
    }
    else
      localStorage.setItem("user", JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, authDispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
