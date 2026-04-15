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
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Shadows, Spacing, FontSizes } from '../theme';

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'Tamam', onPress: onOk }] : undefined);
  }
};

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

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

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showAlert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/Users', {
        userName: username,
        email,
        password,
        profilePhoto: null
      });

      showAlert('Başarılı', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', () => {
        navigation.navigate('Login');
      });
    } catch (error: any) {
      showAlert('Hata', error.response?.data?.message || 'Kayıt olurken bir hata oluştu');
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

  const renderInput = (
    field: string,
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    secure: boolean = false,
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputRow,
        focusedField === field && styles.inputRowFocused,
      ]}>
        <Ionicons
          name={icon}
          size={20}
          color={focusedField === field ? Colors.primaryLight : Colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textDim}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    </View>
  );

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
          {/* Brand */}
          <Animated.View style={[styles.brandSection, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: logoScale }],
          }]}>
            <LinearGradient
              colors={['#7C3AED', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Ionicons name="person-add" size={40} color={Colors.white} />
            </LinearGradient>

            <Text style={styles.brandTitle}>Aramıza Katıl</Text>
            <View style={styles.accentBar} />
            <Text style={styles.brandSubtitle}>
              Kendi uzmanlığını kanıtlamak için{'\n'}hemen bir hesap oluştur.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formSection, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }]}>
            {renderInput('username', 'person-outline', 'KULLANICI ADI', 'Kullanıcı adınız...', username, setUsername)}
            {renderInput('email', 'mail-outline', 'EMAIL', 'Email adresiniz...', email, setEmail)}
            {renderInput('password', 'lock-closed-outline', 'ŞİFRE', 'Şifreniz...', password, setPassword, true)}
            {renderInput('confirm', 'shield-checkmark-outline', 'ŞİFRE TEKRAR', 'Şifrenizi doğrulayın...', confirmPassword, setConfirmPassword, true)}

            {/* Register Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: Spacing.lg }}>
              <TouchableOpacity
                onPress={handleRegister}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? [Colors.textDim, Colors.textDim] : ['#7C3AED', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.submitButton, Shadows.glow(Colors.primary)]}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.submitButtonText}>Hesap Oluştur</Text>
                      <Ionicons name="sparkles" size={18} color={Colors.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Zaten üye misin? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.footerLink}>Giriş Yap</Text>
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
    paddingVertical: Spacing['3xl'],
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  brandTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  accentBar: {
    width: 40,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: '#7C3AED',
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
    marginBottom: Spacing.lg,
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
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
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
  submitButton: {
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
  submitButtonText: {
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
