import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Shadows, Spacing, FontSizes } from '../theme';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Hata', 'Email ve şifre gereklidir.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/Users/login', { email, password });

      // Backend TokenDto: { accessToken: "..." }
      const token = response.data?.accessToken;

      if (!token) {
        showAlert('Hata', 'Sunucudan token alınamadı.');
        return;
      }

      // Token'ı önce store'a yazıyoruz ki current-user çağrısı authenticated olsun
      await login(token, email.split('@')[0], email);

      // Gerçek kullanıcı adını current-user'dan çek
      try {
        const userRes = await apiClient.get('/Users/current-user');
        const realName = userRes.data?.userName || userRes.data?.username || email.split('@')[0];
        await login(token, realName, email);
      } catch (_) {
        // current-user başarısız olursa email prefix'iyle devam et
      }
    } catch (error: any) {
      showAlert('Giriş Başarısız', error.response?.data?.message || 'Email veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, friction: 5 }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Branding */}
          <Animated.View style={[styles.brandSection, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: logoScale }],
          }]}>
            <LinearGradient
              colors={Gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Ionicons name="car-sport" size={48} color={Colors.white} />
            </LinearGradient>

            <Text style={styles.brandTitle}>CarGuessr</Text>
            <View style={styles.accentBar} />
            <Text style={styles.brandSubtitle}>
              Araba tutkunlarının yarıştığı{'\n'}heyecan dolu dünyaya giriş yap!
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }]}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={[
                styles.inputRow,
                emailFocused && styles.inputRowFocused,
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? Colors.primaryLight : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email adresiniz..."
                  placeholderTextColor={Colors.textDim}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ŞİFRE</Text>
              <View style={[
                styles.inputRow,
                passwordFocused && styles.inputRowFocused,
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? Colors.primaryLight : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Şifreniz..."
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: Spacing.lg }}>
              <TouchableOpacity
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? [Colors.textDim, Colors.textDim] : Gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginButton, Shadows.glow(Colors.primary)]}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.loginButtonText}>Giriş Yap</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Register Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Hesabın yok mu? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.footerLink}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing['4xl'],
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  brandTitle: {
    fontSize: FontSizes['4xl'],
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  accentBar: {
    width: 48,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  brandSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form
  formSection: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },

  // Button
  loginButton: {
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  footerLink: {
    color: Colors.primaryLight,
    fontSize: FontSizes.md,
    fontWeight: '800',
  },
});
