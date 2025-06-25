import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';
import { ensureProfileRowExists } from '../components/userStorage';
import { useAuth } from '../hooks/useAuth';

WebBrowser.maybeCompleteAuthSession();

const SignupScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<AppNavigationProp>();

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID',   // Replace with your Web client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID',     // Replace with your iOS client ID
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android client ID
  });

  const { signUp } = useAuth();

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
      handleGoogleSignup(userInfo);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch user info from Google.');
    }
  };

  const handleGoogleSignup = async (userInfo: { given_name: string; family_name: string; email: string; }) => {
    try {
        const { given_name: firstName, family_name: lastName, email } = userInfo;
        const existingUsers = await AsyncStorage.getItem('users');
        const users = existingUsers ? JSON.parse(existingUsers) : [];
  
        const emailExists = users.some((user: { email: string; }) => user.email === email);
        if (emailExists) {
            // If user exists, log them in instead of creating a new account
            Alert.alert('Welcome back!', 'You have been logged in successfully.');
            navigation.navigate('Dashboard');
            return;
        }

        // For Google sign-up, we generate a random password or handle it differently
        const password = Math.random().toString(36).slice(-8);
        const newUser = { firstName, lastName, email, password };
        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
  
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('QuizIntro');
    } catch (error) {
        console.error('Google signup error:', error);
        Alert.alert('Error', 'An error occurred during Google sign-up.');
    }
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (!agree) {
      Alert.alert('Error', 'You must agree to the terms and conditions.');
      return;
    }
    try {
      const { data, error } = await signUp({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      console.log('Signup result:', data, error);
      if (error || !data || !data.user) throw error || new Error('No user returned');
      // Update the profile row with names
      await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName
      }).eq('id', data.user.id);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('QuizIntro');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Sign up failed.');
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/logo.png')} style={styles.logo} />
            </View>

            <Text style={styles.title}>Sign up to your account</Text>
            <Text style={styles.subtitle}>Create an account to get started.</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="gray"
                  value={firstName}
                  onChangeText={setFirstName}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  blurOnSubmit={false}
                  enterKeyHint="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="gray"
                  value={lastName}
                  onChangeText={setLastName}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  enterKeyHint="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="gray" style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
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
                  onSubmitEditing={handleSignup}
                  enterKeyHint="done"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <Switch
                  trackColor={{ false: "#3e3e3e", true: "#FF8C42" }}
                  thumbColor={agree ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setAgree}
                  value={agree}
                  style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : {}}
              />
              <Text style={styles.termsText}>
                I agree with the <Text style={styles.link}>Terms and Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text> of CTRL/MND
              </Text>
            </View>

            <TouchableOpacity style={styles.createAccountButton} onPress={handleSignup}>
              <Text style={styles.createAccountButtonText}>Create Account</Text>
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

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log in</Text>
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
  header: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 8,
    marginLeft: 12,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: -5,
  },
  termsText: {
    color: '#8A8A8E',
    marginLeft: 5,
    flexShrink: 1,
    fontSize: 13,
  },
  link: {
    color: '#FF6F00',
    fontWeight: '500',
  },
  createAccountButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  createAccountButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  loginText: {
    color: '#8A8A8E',
    fontSize: 15,
  },
  loginLink: {
    color: '#FF6F00',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SignupScreen; 