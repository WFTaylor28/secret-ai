import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./Home";
import CreateCharacter from "./CreateCharacter";
import Chat from "./Chat";

export default function AppRouterWrapper(props) {
  // This wrapper is needed to use useNavigate in class components or outside of Router
  return (
    <Router>
      <props.AppComponent {...props} />
    </Router>
  );
}
