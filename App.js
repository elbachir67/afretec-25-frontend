import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WelcomeScreen from "./src/screens/auth/WelcomeScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import DashboardScreen from "./src/screens/main/DashboardScreen";
import EvaluationScreen from "./src/screens/main/EvaluationScreen";
import ProgramScreen from "./src/screens/main/ProgramScreen";
import "./src/i18n";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Welcome");
  const [screenParams, setScreenParams] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const code = await AsyncStorage.getItem("participantCode");
      if (code) {
        setCurrentScreen("Dashboard");
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = {
    navigate: (screen, params) => {
      setCurrentScreen(screen);
      setScreenParams(params);
    },
    goBack: () => {
      setCurrentScreen("Dashboard");
      setScreenParams(null);
    },
  };

  // Loading state
  if (loading) {
    return null;
  }

  // Router
  switch (currentScreen) {
    case "Welcome":
      return <WelcomeScreen navigation={navigation} />;

    case "Register":
      return <RegisterScreen navigation={navigation} />;

    case "Login":
      return <LoginScreen navigation={navigation} />;

    case "Dashboard":
      return <DashboardScreen navigation={navigation} />;

    case "Evaluation":
      return (
        <EvaluationScreen
          route={{ params: screenParams }}
          navigation={navigation}
        />
      );

    case "Program":
      return <ProgramScreen navigation={navigation} />;

    default:
      return <WelcomeScreen navigation={navigation} />;
  }
}
