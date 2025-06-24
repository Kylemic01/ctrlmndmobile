import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';
import { ensureProfileRowExists } from '../components/userStorage';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<AppNavigationProp>();

  const passwordRef = useRef<TextInput>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID',   // Replace with your Web client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID',     // Replace with your iOS client ID
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android client ID
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      handleGoogleLogin(userInfo);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch user info from Google.');
    }
  };

  const handleGoogleLogin = async (userInfo: { given_name: string; family_name: string; email: string; }) => {
    try {
        const { given_name: firstName, family_name: lastName, email } = userInfo;
        const existingUsers = await AsyncStorage.getItem('users');
        const users = existingUsers ? JSON.parse(existingUsers) : [];
  
        const userExists = users.some((user: { email: string; }) => user.email === email);

        if (userExists) {
            Alert.alert('Welcome back!', 'You have been logged in successfully.');
            navigation.navigate('Dashboard');
        } else {
            // If user does not exist, create a new account
            const password = Math.random().toString(36).slice(-8); // Generate a random password
            const newUser = { firstName, lastName, email, password };
            users.push(newUser);
            await AsyncStorage.setItem('users', JSON.stringify(users));
    
            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('Quiz');
        }
    } catch (error) {
        console.error('Google login error:', error);
        Alert.alert('Error', 'An error occurred during Google sign-in.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Login with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        Alert.alert('Error', error?.message || 'Invalid email or password.');
        return;
      }
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('Dashboard');
    } catch (error: any) {
      Alert.alert('Error', 'Something went wrong during login.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/logo.png')} style={styles.logo} />
            </View>

            <Text style={styles.title}>Login to your account</Text>
            <Text style={styles.subtitle}>Welcome back! Please enter your details.</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Email"
                  placeholderTextColor="gray"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  enterKeyHint="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Enter Your Password"
                  placeholderTextColor="gray"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  enterKeyHint="done"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or Continue With</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialLoginContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()}>
                <Ionicons name="logo-google" size={24} color="white" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="white" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 35,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#8A8A8E',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  form: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    height: 55,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#FF6F00',
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#8A8A8E',
    marginHorizontal: 10,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  socialButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signupText: {
    color: '#8A8A8E',
    fontSize: 15,
  },
  signupLink: {
    color: '#FF6F00',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LoginScreen; 