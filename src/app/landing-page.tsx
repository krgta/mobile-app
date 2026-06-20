import { router } from 'expo-router';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';

export default function LandingPageScreen() {
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/Img/EvenUp-black.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            Split bills.
            {'\n'}
            Not friendships.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.registerText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6f977a',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  hero: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },

  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 35,
    fontFamily: 'DancingScript_700Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1d460a',
    lineHeight: 36,
    maxWidth: 300,
  },

  actions: {
    width: '100%',
  },

  loginButton: {
    backgroundColor: '#2c7747',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  registerButton: {
    backgroundColor: '#d0d4d0',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  registerText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
});
