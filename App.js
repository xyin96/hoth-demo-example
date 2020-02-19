import * as React from 'react';
import { Platform, StatusBar, StyleSheet, SafeAreaView } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';

import * as firebase from 'firebase';

// Initialize firebase
var firebaseConfig = {
  apiKey: "AIzaSyBXcm7HK8F5Qo6IaZOctJu-w8upLuvdlEg",
  authDomain: "hack-on-the-hill-dryrun.firebaseapp.com",
  databaseURL: "https://hack-on-the-hill-dryrun.firebaseio.com",
  projectId: "hack-on-the-hill-dryrun",
  storageBucket: "hack-on-the-hill-dryrun.appspot.com",
  messagingSenderId: "250549009390",
  appId: "1:250549009390:web:061b6bb8e623479166acff",
  measurementId: "G-Y6Q4GBLXQY"
};

firebase.initializeApp(firebaseConfig);

const Stack = createStackNavigator();

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());
        await firebase.auth().signInAnonymously();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <SafeAreaView style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
          <Stack.Navigator>
            <Stack.Screen name="Root" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
