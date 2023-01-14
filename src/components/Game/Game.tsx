import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, CLEAR, ENTER } from '../../constants';
import Keyboard from '../Keyboard';
import styles from './Game.styles';
import { copyArray, getGameKey } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Endscreen from '../EndScreen/EndScreen';
import Animated, {
  SlideInLeft,
  ZoomIn,
  FlipInEasyY,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const NUMBER_OF_TRIES: number = 6;

const gameKey = getGameKey();

const Game = ({
  navigation,
  chosenWord,
  isHard
}: any) => {
  const wordLength = 5;
  const api_key = 'd9gxdj3y5lflq8mxyo7mpow8rw29oilgvt9dz4sy0g9a3b9vz';

  //AsyncStorage.removeItem("@game");
  //const word = testWord;

  const [rows, setRows] = useState<string[][]>([]);
  const [word, setWord] = useState<string>('');
  const [letters, setLetters] = useState<string[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
  const [currentColIndex, setCurrentColIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<string>('playing'); // won, lost, playing
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadedGame, setLoadedGame] = useState<boolean>(false);
  const [loadedWord, setLoadedWord] = useState<boolean>(false);
  const [despClue, setDespClue] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [wordType, setWordType] = useState<string>('');
  const [showEmergencyBtn, setShowEmergencyBtn] = useState<boolean>(false);

  useEffect(() => {
    if (currentRowIndex > 0) {
      checkGameState();
    }
  }, [currentRowIndex]);

  useEffect(() => {
    if (loaded) {
      persistState();
    }
  }, [rows, currentRowIndex, currentColIndex, gameState]);

  useEffect(() => {
    if (loadedGame && loadedWord) {
      setLoaded(true);
    }
  }, [loadedGame, loadedWord]);

  useEffect(function() {
    console.log(chosenWord);
    if (chosenWord !== "random") {
      setWord(chosenWord);
      setLetters(chosenWord.split(''));
      setLoadedWord(true);
      setRows(new Array(NUMBER_OF_TRIES).fill(new Array(chosenWord.split('').length).fill('')));
    } else {
      requestRandomWord();
    }
    readState();    
  }, []);

  useEffect(() => {
    getWordDef();
  }, [word]);

  
  const requestRandomWord = () => {
    const url =
      'https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&minLength=' +
      wordLength +
      '&maxLength=' +
      wordLength +
      '&api_key=' + api_key;

    const makeCall = function () {      
      const Http = new XMLHttpRequest();
      Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          const resJson = JSON.parse(Http.response);
          const wordRegex = new RegExp("^[a-z]+$");
          if(wordRegex.test(resJson.word)) {
            console.log(resJson.word);
            setWord(resJson.word);
            setLetters(resJson.word.split(''));
            setLoadedWord(true);
            setRows(new Array(NUMBER_OF_TRIES).fill(new Array(resJson.word.split('').length).fill('')));
          }
          else {
            makeCall();
          }
        } else {
          console.log(this.status);
        }
      };
      Http.open('GET', url);
      Http.setRequestHeader('Access-Control-Allow-Origin', '*');
      Http.setRequestHeader('Referrer-Policy', 'no-referrer');
      Http.setRequestHeader(
        'X-Mashape-Key',
        'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
      );
      Http.send();      
    }

    makeCall();

  };

  const persistState = async () => {
    // write all the state variables in AsyncStorage
    const currentData = {
      rows,
      currentRowIndex,
      currentColIndex,
      gameState,
    };

    try {
      const existingStateString = await AsyncStorage.getItem('@game');
      const existingState = existingStateString
        ? JSON.parse(existingStateString)
        : {};

      existingState[gameKey] = currentData;

      const dataString = JSON.stringify(existingState);
      console.log('Saving', dataString);
      await AsyncStorage.setItem('@game', dataString);
    } catch (e) {
      console.log('Failed to write data to Async Storage: ', e);
    }
  };

  const readState = async () => {
    const dataString = await AsyncStorage.getItem('@game');
    try {
      const data = JSON.parse(dataString || '{}');
    } catch (e) {
      console.log("Couldn't parse the state.");
    }

    setLoadedGame(true);
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState != 'won') {
      setGameState('won');
    } else if (checkIfLost() && gameState != 'lost') {
      setGameState('lost');
    }
  };

  const checkIfWon = () => {
    const row = rows[currentRowIndex - 1];
    if (row) {
      return row.every((letter: string, i: number) => letter === letters[i]);
    } else {
      return false;
    }
  };

  const checkIfLost = () => {
    return !checkIfWon() && currentRowIndex === rows.length;
  };

  const onKeyPressed = (key: string): void => {
    if (gameState != 'playing') {
      return;
    }
    const updateRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = currentColIndex - 1;

      if (prevCol >= 0) {
        updateRows[currentRowIndex][prevCol] = '';
        setRows(updateRows);
        setCurrentColIndex(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      const row = rows[currentRowIndex];
      if (row) {
        const input = row.join('');

        if (input.length < 5) {
          Alert.alert('Ouch', 'Insert a word of five letters');
          return;
        } else {
          wordExists(input);
        }
      }
    }

    if (rows[0]) {
      if (currentColIndex < rows[0].length) {
        updateRows[currentRowIndex][currentColIndex] = key;
        setRows(updateRows);
        setCurrentColIndex(currentColIndex + 1);
      }
    }
  };

  const wordExists = function (input: string) {
    const Http = new XMLHttpRequest();
    const url = 'https://api.wordnik.com/v4/word.json/' + input + '/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=' + api_key;

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        actionIfWordExists();
      } else if (this.readyState == 4 && this.status == 404) {
        Alert.alert('Ouch', "This is not a word... press 'Clear' to retry!");
        return;
      }
    };
    Http.open('GET', url);
    Http.setRequestHeader('Access-Control-Allow-Origin', '*');
    Http.setRequestHeader(
      'X-Mashape-Key',
      'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
    );
    Http.send();
  }

  function actionIfWordExists() {

    if (isHard && currentRowIndex !== 0) {
      const currRow = rows[currentRowIndex];
      const prevRow = rows[currentRowIndex - 1];
      
      if (currRow && prevRow) {
        if (!validateHardWord(letters, currRow, prevRow)) {
          Alert.alert(
            'Ouch',
            'In hard mode you should use all the correct letters from previous word!'
          );
          return;
        }
      }
    }

    if (rows[0]) {
      if (currentColIndex === rows[0].length) {
        setCurrentRowIndex(currentRowIndex + 1);
        setCurrentColIndex(0);
      }
    }

    if (currentRowIndex === NUMBER_OF_TRIES - 1) {
      console.log('Almost out of tries');
      setShowEmergencyBtn(true);
    }

    return;
  }

  const isCellActive = (row: number, col: number) => {
    return row === currentRowIndex && col === currentColIndex;
  };

  const getCellBGColor = (row: number, col: number) => {
    return getColor(letters, rows, row, col);
  };

  const validateHardWord = (testWord: string[], currInputWord: string[], prevInputWord: string[]) => {
    for (var i = 0; i < prevInputWord.length; i++) {
      // se è verde la lettera nella parola precedente verifico lo sia anche nella parola corrente
      if (
        testWord[i] === prevInputWord[i] &&
        testWord[i] !== currInputWord[i]
      ) {
        return false;
      }

      var letter = prevInputWord[i];
      if (letter) {
        var prevYellowCount = getYellowCount(testWord, prevInputWord, letter);
        var currYellowCount = getYellowCount(testWord, currInputWord, letter);
        var prevGreenCount = getGreenCount(testWord, prevInputWord, letter);
        var currGreenCount = getGreenCount(testWord, currInputWord, letter);

        if (prevYellowCount > currGreenCount + currYellowCount - prevGreenCount) {
          return false;
        }
      }

    }

    return true;
  };

  const getYellowCount = (testWord: string[], inputWord: string[], letter: string) => {
    // conto quante lettere verdi e altre occorenze ci sono per la lettera passata
    var greenLetterCount = 0;
    var testWordLetterCount = 0;
    var inputWordLetterCount = 0;

    for (var i = 0; i < inputWord.length; i++) {
      if (inputWord[i] === letter && testWord[i] === letter) {
        greenLetterCount++;
      }

      if (inputWord[i] === letter) {
        inputWordLetterCount++;
      }

      if (testWord[i] === letter) {
        testWordLetterCount++;
      }
    }

    var testWordNotGreenLetterCount = testWordLetterCount - greenLetterCount;
    var inputWordNotGreenLetterCount = inputWordLetterCount - greenLetterCount;

    return Math.min(testWordNotGreenLetterCount, inputWordNotGreenLetterCount);
  };

  const getGreenCount = (testword: string[], inputWord: string[], letter: string) => {
    // conto quante lettere verdi ci sono per la lettera passata
    var greenLetterCount = 0;

    for (var i = 0; i < inputWord.length; i++) {
      if (inputWord[i] === letter && testword[i] === letter) {
        greenLetterCount++;
      }
    }

    return greenLetterCount;
  };

  const getColor = (letters: string[], rows: string[][], rowIndex: number, colIndex: number) => {
    if (rowIndex >= currentRowIndex) {
      return colors.black;
    }
    
    let row = rows[rowIndex];

    if (!row) {
      return colors.darkgrey;
    }

    const letter = row[colIndex];

    if (letter === letters[colIndex]) {
      return colors.primary;
    }

    let recurrenceWrongPositionInLettersCount = 0;
    let prevUnmatchedLetterCount = 0;

    for (let i = 0; i < letters.length; i++) {
      if (letters[i] !== row[i]) {
        if (letters[i] === letter) {
          recurrenceWrongPositionInLettersCount++;
        }

        if (i < colIndex && letter === row[i]) {
          prevUnmatchedLetterCount++;
        }
      }
    }

    if (recurrenceWrongPositionInLettersCount === 0) {
      return colors.darkgrey;
    }

    if (recurrenceWrongPositionInLettersCount > prevUnmatchedLetterCount) {
      return colors.secondary;
    }
    
    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color: string) => {
    return rows.flatMap((row, i) =>
      row.filter((cell: any, j: any) => getCellBGColor(i, j) === color)
    );
  };
  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  const getCellStyle = (i: any, j: any) => [
    styles.cell,
    {
      borderColor: isCellActive(i, j) ? colors.grey : colors.darkgrey,
      backgroundColor: getCellBGColor(i, j),
    },
  ];

  const getWordDef = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const Http = new XMLHttpRequest();
    const url = 'https://api.wordnik.com/v4/word.json/' + word + '/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=' + api_key;

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const resJson = JSON.parse(Http.response);
        const def = resJson.meanings[0].definitions[0].definition;
        setDefinition(def);
      } else if (this.readyState == 4 && this.status == 404) {
        Alert.alert('Ouch', "This is not a word... press 'Clear' to retry!");
      }
    };

    Http.open('GET', url);
    Http.setRequestHeader('Access-Control-Allow-Origin', '*');
    Http.setRequestHeader(
      'X-Mashape-Key',
      'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
    );
    Http.send();

  };

  const getWordType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const Http = new XMLHttpRequest();
    const url = 'https://api.wordnik.com/v4/word.json/' + word + '/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=' + api_key;

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const resJson = JSON.parse(Http.response);
        const type = resJson[0].partOfSpeech;
        setWordType(type);
      } else if (this.readyState == 4 && this.status == 404) {
        setWordType('No type found for this word :\'(');
      }
    };

    Http.open('GET', url);
    Http.setRequestHeader('Access-Control-Allow-Origin', '*');
    Http.setRequestHeader(
      'X-Mashape-Key',
      'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
    );
    Http.send();
  };

  const getWordSyn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const Http = new XMLHttpRequest();
    const url = 'https://api.wordnik.com/v4/word.json/' + word + '/relatedWords?useCanonical=false&relationshipTypes=synonym&limitPerRelationshipType=1&api_key=' + api_key;

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const resJson = JSON.parse(Http.response);
        const clue = resJson[0].words[0];
        setDespClue(clue);
      } else if (this.readyState == 4 && this.status == 404) {
        setDespClue('No clue found for this word :\'(');
      }
    };

    Http.open('GET', url);
    Http.setRequestHeader('Access-Control-Allow-Origin', '*');
    Http.setRequestHeader(
      'X-Mashape-Key',
      'ef6672f706mshb271b1cd03264c9p14b189jsn050169b0933a'
    );
    Http.send();
  };

  if (!loaded) {
    return <ActivityIndicator />;
  }

  if (gameState !== 'playing') {
    return (
      <Endscreen
        won={gameState === 'won'}
        rows={rows}
        getCellBGColor={getCellBGColor}
        wordDef={definition}
      />
    );
  }

  return <>
    <ScrollView style={styles.map}>
      {rows.map((row, i) => (
        <Animated.View
          entering={SlideInLeft.delay(i * 30)}
          key={`row-${i}`}
          style={styles.row}>
          {row.map((letter: any, j: any) => (
            <>
              {i < currentRowIndex && (
                <Animated.View
                  entering={FlipInEasyY.delay(j * 100)}
                  key={`cell-color-${i}-${j}`}
                  style={getCellStyle(i, j)}>
                  <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                </Animated.View>
              )}

              {i === currentRowIndex && !!letter && (
                <Animated.View
                  entering={ZoomIn}
                  key={`cell-active-${i}-${j}`}
                  style={getCellStyle(i, j)}>
                  <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                </Animated.View>
              )}

              {!letter && (
                <View key={`cell-${i}-${j}`} style={getCellStyle(i, j)}>
                  <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                </View>
              )}
            </>
          ))}
        </Animated.View>
      ))}
    </ScrollView>

    <Animated.View
      entering={SlideInLeft.delay(200).springify().mass(0.5)}
      style={{ flexDirection: 'row', padding: 10 }}>
      <Text
        style={{
          color: colors.lightgrey,
          fontSize: 20,
          fontWeight: 'bold',
          flex: 1,
          justifyContent: 'center',
        }}>
        {despClue}
      </Text>
      <Text
        style={{
          color: colors.lightgrey,
          fontSize: 20,
          fontWeight: 'bold',
          flex: 1,
          justifyContent: 'center',
        }}>
        {wordType}
      </Text>
    </Animated.View>

    <Animated.View
      entering={SlideInLeft.delay(200).springify().mass(0.5)}
      style={{ flexDirection: 'row', padding: 10 }}>
      {showEmergencyBtn ? (
        <Pressable
          onPress={getWordSyn}
          style={{
            flex: 1,
            backgroundColor: colors.secondary,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            height: 45,
            width: 120,
          }}>
          <Text style={{ color: colors.lightgrey, fontWeight: 'bold' }}>
            Desperate Clue
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={getWordType}
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          height: 45,
          width: 120,
        }}>
        <Text style={{ color: colors.lightgrey, fontWeight: 'bold' }}>
          Clue
        </Text>
      </Pressable>
    </Animated.View>

    <Keyboard
      onKeyPressed={onKeyPressed}
      greenCaps={greenCaps}
      yellowCaps={yellowCaps}
      greyCaps={greyCaps}
    />
  </>;
};

export default Game;
