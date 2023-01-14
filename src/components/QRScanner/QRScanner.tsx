import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from "expo-status-bar";
import {colors} from '../../constants';
// @ts-expect-error TS(2614): Module '"../Game/Game"' has no exported member 'Ga... Remove this comment to see the full error message
import { Game } from '../Game/Game';


export default function QRScanner({
  navigation
}: any) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data
  }: any) => {
    setScanned(true);
    Alert.alert(`Let's play!`);
    console.log('Data: ', data);
    const parsedData = JSON.parse(data);
    const word = parsedData.word;
    const isHard = parsedData.isHard;
    navigation.navigate("Play", { chosenWord: word, isHard: isHard });

  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    color: colors.lightgrey,
    backgroundColor: colors.darkgrey
  }
});