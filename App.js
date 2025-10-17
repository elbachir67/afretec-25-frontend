import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WelcomeScreen from "./src/screens/auth/WelcomeScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import DashboardScreen from "./src/screens/main/DashboardScreen";
import MicroEvalScreen from "./src/screens/main/MicroEvalScreen";
import "./src/i18n";

import BadgesScreen from "./src/screens/main/BadgesScreen";

import LeaderboardScreen from "./src/screens/main/LeaderboardScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Welcome");
  const [screenParams, setScreenParams] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const code = await AsyncStorage.getItem("participantCode");
    if (code) {
      setCurrentScreen("Dashboard");
    }
    setLoading(false);
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

  if (loading) {
    return null;
  }

  if (currentScreen === "MicroEval") {
    return (
      <MicroEvalScreen
        route={{ params: screenParams }}
        navigation={navigation}
      />
    );
  }

  if (currentScreen === "Dashboard") {
    return <DashboardScreen navigation={navigation} />;
  }

  if (currentScreen === "Register") {
    return <RegisterScreen navigation={navigation} />;
  }

  if (currentScreen === "Login") {
    return <LoginScreen navigation={navigation} />;
  }
  if (currentScreen === "Badges") {
    return <BadgesScreen navigation={navigation} />;
  }
  if (currentScreen === "Leaderboard") {
    return <LeaderboardScreen navigation={navigation} />;
  }

  return <WelcomeScreen navigation={navigation} />;
}
