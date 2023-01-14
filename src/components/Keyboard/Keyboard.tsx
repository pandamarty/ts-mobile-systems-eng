import React from 'react';
import { View, Text, Pressable } from "react-native";
import { keys, ENTER, CLEAR, colors } from "../../constants";
import styles, { keyWidth } from "./Keyboard.styles";
import Animated, { SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const Keyboard = (config: {
  onKeyPressed: Function,
  greenCaps: string[],
  yellowCaps: string[],
  greyCaps: string[]
}) => {
  let {onKeyPressed, greenCaps, yellowCaps, greyCaps} = config;
  onKeyPressed = onKeyPressed || ((key: string) => {});
  greenCaps = greenCaps || [];
  yellowCaps = yellowCaps || [];
  greyCaps = greyCaps || [];
  
  const isLongButton = (key: string) => {
    return key === ENTER || key === CLEAR;
  };

  const getKeyBGColor = (key: string) => {
    if (greenCaps.includes(key)) {
      return colors.primary;
    }
    if (yellowCaps.includes(key)) {
      return colors.secondary;
    }
    if (greyCaps.includes(key)) {
      return colors.darkgrey;
    }
    return colors.grey;
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().mass(0.5)}
      style={styles.keyboard}
    >
      {keys.map((keyRow, i) => (
        <View style={styles.row} key={`row-${i}`}>
          {keyRow.map((key) => (
            <Pressable
              onPress={() => onKeyPressed(key)}
              key={key}
              style={[
                styles.key,
                isLongButton(key) ? { width: keyWidth * 1.4 } : {},
                { backgroundColor: getKeyBGColor(key) },
              ]}
            >
              <Text style={styles.keyText}>{key.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </Animated.View>
  );
};

export default Keyboard;
