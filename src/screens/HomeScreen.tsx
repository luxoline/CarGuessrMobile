import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Shadows, Spacing, FontSizes } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  Leaderboard: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  const username = useAuthStore((state) => state.username);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Staggered animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;
  const menuSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, slide: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      ]);

    Animated.stagger(100, [
      animate(headerAnim, headerSlide, 0),
      animate(heroAnim, heroSlide, 0),
      animate(statsAnim, statsSlide, 0),
      animate(menuAnim, menuSlide, 0),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: headerAnim,
          transform: [{ translateY: headerSlide }],
        }]}>
          <View>
            <Text style={styles.welcomeLabel}>Hoş geldin,</Text>
            <Text style={styles.welcomeName}>{username || 'Oyuncu'} 🏎️</Text>
          </View>
          <TouchableOpacity
            onPress={() => logout()}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View style={{
          opacity: heroAnim,
          transform: [{ translateY: heroSlide }],
        }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Game')}
          >
            <LinearGradient
              colors={Gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, Shadows.glow(Colors.primary)]}
            >
              {/* Decorative circle */}
              <View style={styles.heroCircle} />
              <View style={styles.heroCircleSmall} />

              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>GÜNÜN MÜCADELESİ</Text>
                <Text style={styles.heroTitle}>
                  Araba Parçalarını{'\n'}Tanıyabilecek misin?
                </Text>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Hemen Başla</Text>
                  <View style={styles.heroPlayIcon}>
                    <Ionicons name="play" size={16} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, {
          opacity: statsAnim,
          transform: [{ translateY: statsSlide }],
        }]}>
          <View style={[styles.statCard, Shadows.sm]}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.successMuted }]}>
              <Ionicons name="trophy" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statLabel}>EN YÜKSEK SKOR</Text>
            <Text style={styles.statValue}>2,450</Text>
          </View>
          <View style={[styles.statCard, Shadows.sm]}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.warningMuted }]}>
              <Ionicons name="flame" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statLabel}>OYUN SAYISI</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
        </Animated.View>

        {/* Menu */}
        <Animated.View style={{
          opacity: menuAnim,
          transform: [{ translateY: menuSlide }],
        }}>
          <Text style={styles.menuLabel}>MENÜ</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            style={[styles.menuItem, Shadows.sm]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(99,102,241,0.15)', 'rgba(99,102,241,0.05)']}
              style={styles.menuIconBg}
            >
              <Ionicons name="stats-chart" size={26} color={Colors.primaryLight} />
            </LinearGradient>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Liderlik Tablosu</Text>
              <Text style={styles.menuSubtitle}>Dünyanın en iyileri arasına gir.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, Shadows.sm]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(148,163,184,0.15)', 'rgba(148,163,184,0.05)']}
              style={styles.menuIconBg}
            >
              <Ionicons name="settings-sharp" size={26} color={Colors.textSecondary} />
            </LinearGradient>
            <View style={styles.menuTextGroup}>
              <Text style={styles.menuTitle}>Profil & Ayarlar</Text>
              <Text style={styles.menuSubtitle}>Hesabını yönet ve kişiselleştir.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['4xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  welcomeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: FontSizes['3xl'],
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.errorMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },

  // Hero Card
  heroCard: {
    borderRadius: Radius['3xl'],
    padding: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
    overflow: 'hidden',
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  heroCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 32,
    marginBottom: Spacing.xl,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  heroButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  heroPlayIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
  },

  // Menu
  menuLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIconBg: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
