import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, colorsToEmoji } from "../../constants";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { SlideInLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const Number = ({
  number,
  label
}: any) => (
  <View style={{ alignItems: "center", margin: 10 }}>
    <Text style={{ color: colors.lightgrey, fontSize: 30, fontWeight: "bold" }}>
      {number}
    </Text>
    <Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
  </View>
);

const GuessDistributionLine = ({
  position,
  amount,
  percentage
}: any) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
      <Text style={{ color: colors.lightgrey }}>{position}</Text>
      <View
        style={{
          alignSelf: "stretch",
          backgroundColor: colors.grey,
          margin: 5,
          padding: 5,
          width: `${percentage}%`,
          minWidth: 20,
        }}
      >
        <Text style={{ color: colors.lightgrey }}>{amount}</Text>
      </View>
    </View>
  );
};

const GuessDistribution = ({
  distribution
}: any) => {
  if (!distribution) {
    console.log('distribution not available');
    return null;
  }
  const sum = distribution.reduce((total: any, dist: any) => dist + total, 0);
  console.log('sum ' + sum);
  return <>
    <Text style={styles.subtitle}>GUESS DISTRIBUTION</Text>
    <View style={{ width: "100%", padding: 20 }}>
      {distribution.map((dist: any, index: any) => {
        return <GuessDistributionLine
          position={index + 1}
          amount={dist}
          percentage={(100 * dist) / sum}
        />;
      })}
    </View>
  </>;
};

const Endscreen = ({
  won = false,
  rows,
  getCellBGColor,
  wordDef,
  navigation
}: any) => {
  const [played, setPlayed] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [curStreak, setCurStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    readState();
  }, []);

  const share = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const textMap = rows
      .map((row: any, i: any) =>
        row.map((cell: any, j: any) => colorsToEmoji[getCellBGColor(i, j)]).join("")
      )
      .filter((row: any) => row)
      .join("\n");

    const textToShare = `My Wordle solution \n ${textMap}`;
    Clipboard.setString(textToShare);
    Alert.alert("Copied successfully!", "Share your score on social media!");
  };

  const readState = async () => {
    const dataString = await AsyncStorage.getItem("@game");
    console.log(dataString);
    let data: any;
    try {
      data = JSON.parse(dataString || '{}');
      console.log(data);
    } catch (e) {
      console.log("Couldn't parse the state.");
    }

    interface gameData {
      rows: string[][];
      currentRowIndex: number;
      currentColIndex: number;
      gameState: string;
    };

    const keys = Object.keys(data);
    const values: gameData[] = Object.values(data);

    setPlayed(keys.length);

    const numberOfWins = values.filter(
      (game: gameData) => game.gameState === "won"
    ).length;
    setWinRate(Math.floor((100 * numberOfWins) / keys.length));

    let _curStreak = 0;
    let maxStreak = 0;
    let prevDay = 0;

    keys.forEach((key: string) => {

      if (!key) {
        return;
      }

      const splitKey: string[] = key.split("-");
      
      if (!splitKey || !splitKey[0]) {
        return;
      }

      const day = parseInt(splitKey[0]);
      if (data[key].gameState === "won" && _curStreak === 0) {
        _curStreak += 1;
      } else if (data[key].gameState === "won" && prevDay + 1 === day) {
        _curStreak += 1;
      } else {
        if (_curStreak > maxStreak) {
          maxStreak = _curStreak;
        }
        _curStreak = data[key].gameState === "won" ? 1 : 0;
      }
      prevDay = day;
    });
    setCurStreak(_curStreak);
    setMaxStreak(maxStreak);

    // guess distribution
    const dist: number[] = [0, 0, 0, 0, 0, 0];

    values.map((game: gameData) => {
      if (game.gameState === "won") {
        const tries = game.rows.filter((row: string[]) => row[0]).length;

        let tempTries = dist[tries - 1];
        if (!tempTries) {
          return;
        }
        dist[tries - 1] = tempTries + 1;
      }
    });

    console.log(dist);
    
    if (!dist) {
      return;
    }
    setDistribution(dist);
    console.log('Distribution: ' + distribution);
  };

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Animated.Text
        entering={SlideInLeft.springify().mass(0.5)}
        style={styles.title}
      >
        {won ? "Congrats!" : "Meh, try again tomorrow"}
      </Animated.Text>

      <Text style={styles.subtitle}>STATISTICS</Text>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <Number number={played} label={"Played"} />
        <Number number={winRate} label={"Win %"} />
        <Number number={curStreak} label={"Cur streak"} />
        <Number number={maxStreak} label={"Max streak"} />
      </View>

      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{ flexDirection: "row", padding: 10 }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <GuessDistribution
            style={{ justifyContent: "center" }}
            distribution={distribution}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{ flexDirection: "row", padding: 10 }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ color: colors.lightgrey, fontWeight: 'bold' }}>Word definition</Text>
          <Text
            style={{
              color: colors.lightgrey,
              fontSize: 20,
            }}
          >
            {wordDef}
          </Text>
        </View>

        <Pressable
          onPress={share}
          style={{
            flex: 1,
            height: 50,
            backgroundColor: colors.secondary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Share
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
  },
});

export default Endscreen;
