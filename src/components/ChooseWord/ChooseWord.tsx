import React, { useEffect } from 'react';
import { useState } from 'react';
import {Text, View, Pressable, StyleSheet, Button, TextInput, Alert, Switch} from 'react-native';
import {colors} from '../../constants';
import * as Haptics from "expo-haptics";
import QRCode from 'react-native-qrcode-svg';
import * as Linking from 'expo-linking';


const ChooseWord = ({
  navigation
}: any) => {
  const [word, setWord] = useState("");
  const [isHard, setHardMode] = useState(false);
  const toggleSwitch = () => setHardMode(previousState => !previousState);
  const [showQR, setShowQR] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const api_key = 'd9gxdj3y5lflq8mxyo7mpow8rw29oilgvt9dz4sy0g9a3b9vz';

  const GenerateQR = () => {
    const lowerCaseWord = word.toLowerCase();
    var gameObject = {
      "word": lowerCaseWord,
      "isHard": isHard
    }
    var qrcodeValue = JSON.stringify(gameObject);

    return(
      <QRCode
        value={qrcodeValue}
      />
    )
  }

  const validateWord = function () {
    const lowerCaseWord = word.toLowerCase();
    const Http = new XMLHttpRequest();
    const url = 'https://api.wordnik.com/v4/word.json/' + lowerCaseWord + '/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=' + api_key;

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        setShowInput(false);
        setShowQR(true);
      } else if (this.readyState == 4 && this.status == 404) {
        Alert.alert('Ouch', "This is not a word... press 'Clear' to retry!");
      }
    };
    Http.open('GET', url);
    Http.setRequestHeader(
      'X-Mashape-Key',
      'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
    );
    Http.send();
  }

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.darkgrey,
      }}
    >
    {showQR && <GenerateQR />}
    <Text style={styles.subtitle}>Choose a word to challenge your friends!</Text>
      {showInput && <TextInput
        style={styles.input}
        onChangeText={setWord}
        value={word}
        placeholder={"Type word here..."}
      />}
      {showInput && <View style={styles.switchStyle}>
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
      </View>}
      {showInput && <Pressable
          onPress={validateWord}
          style={{
            width: 230,
            height: 50,
            backgroundColor: colors.secondary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
      ><Text style={styles.subtitle}>Choose this word</Text></Pressable>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    color: colors.lightgrey,
    backgroundColor: colors.darkgrey,
    borderRadius: 15
  },
  subtitle: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
  },
  switchStyle: {
    marginHorizontal: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
});


export default ChooseWord;