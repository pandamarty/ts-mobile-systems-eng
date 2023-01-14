import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Image,
  Pressable,
  DevSettings,
  Switch
} from "react-native";
import { colors } from "./src/constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Game from "./src/components/Game";
import ChooseWord from './src/components/ChooseWord';
import QRScanner from './src/components/QRScanner';
import * as Haptics from 'expo-haptics';

type RootStackParamList = {
  Home: undefined;
  Play: undefined;
  ChooseWord: undefined;
  QRScanner: undefined;
};

const HomeScreen = ({navigation}: {navigation: any}) => {
  const [isHard, setHardMode] = useState(false);
  const toggleSwitch = () => setHardMode(previousState => !previousState);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.darkgrey,
      }}
    >
      <Image
        source={require("./assets/logo.png")}
        style={{ width: 100, height: 100 }}
      />
      <Text
        style={{
          color: colors.lightgrey,
          fontWeight: "bold",
          fontSize: 25,
          textAlign: "center",
          marginTop: 25
        }}
      >
        Welcome to a new{"\n"} WORDLE game!
      </Text>
      <View style={{ width: '100%', height: 20 }} />
      <View style={styles.switchStyle}>
        <Text style={{color: colors.lightgrey, textAlign: 'right', width: '32%', paddingRight: '15px', fontWeight: isHard ? 'normal' : 'bold'}}>Easy mode</Text>
        <View style={{ width: '28%', alignItems: 'center' }}>
          <Switch
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={isHard ? "#000" : "#fff"}
            onValueChange={toggleSwitch}
            value={isHard}
          />
        </View>
        <Text style={{color: colors.lightgrey, width: '32%', paddingLeft: '15px', fontWeight: isHard ? 'bold' : 'normal'}}>Hard mode</Text>
      </View>
      <View style={{ width: '100%', height: 20 }} />
      <Pressable
          onPress={() => {
            navigation.navigate("Play", { chosenWord: "random", isHard: isHard });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={{
            height: 40,
            width: 180,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 0
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            New Game
          </Text>
        </Pressable>

        <Text
        style={{
          color: colors.lightgrey,
          fontWeight: "bold",
          fontSize: 25,
          textAlign: "center",
          marginTop:25
        }}
      >
        Playing with friends?
      </Text>

        <Pressable
          onPress={() => {
            navigation.navigate("ChooseWord");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={{
            height: 40,
            width: 180,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Choose word
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("QRScanner");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={{
            height: 40,
            width: 180,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Scan code
          </Text>
        </Pressable>
    </View>
  );
};

function PlayScreen({ route }: {route: any}) {
  const { chosenWord, isHard } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <Game chosenWord={chosenWord} isHard={isHard} />
    </SafeAreaView>
  );
}

function ChooseWordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <ChooseWord />
    </SafeAreaView>
  );
}

function QRScannerScreen({navigation}: {navigation: any}) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <QRScanner navigation={navigation}/>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerStyle: { backgroundColor: colors.darkgrey },
              headerTintColor: colors.lightgrey,
          }}
        />
        <Stack.Screen
          name="Play"
          component={PlayScreen}
          options={{
            headerStyle: { backgroundColor: colors.darkgrey },
            headerTintColor: colors.lightgrey,
          }}
        />
      <Stack.Screen
          name="ChooseWord"
          component={ChooseWordScreen}
          options={{
            headerStyle: { backgroundColor: colors.darkgrey },
            headerTintColor: colors.lightgrey,
          }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{
            headerStyle: { backgroundColor: colors.darkgrey },
            headerTintColor: colors.lightgrey,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
  },
  switchStyle: {
    marginHorizontal: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
});
