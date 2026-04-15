import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView,
  StyleSheet, Animated, Alert, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Colors, Radius, Shadows, Spacing, FontSizes, Gradients } from '../theme';

const showAlert = (title: string, msg: string, onOk?: () => void) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n${msg}`); onOk?.(); }
  else Alert.alert(title, msg, onOk ? [{ text: 'İptal', style: 'cancel' }, { text: 'Çıkış Yap', style: 'destructive', onPress: onOk }] : undefined);
};

interface UserStats {
  userName: string;
  totalPoint: number;
  gameCount: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, username, email } = useAuthStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await apiClient.get('/Users/current-user');
      // CurrentUserDto: { userName, totalPoint, gameCount }
      setStats({
        userName: res.data?.userName ?? username ?? '—',
        totalPoint: res.data?.totalPoint ?? 0,
        gameCount: res.data?.gameCount ?? 0,
      });
    } catch {
      setStats({ userName: username ?? '—', totalPoint: 0, gameCount: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      async () => { await logout(); },
    );
  };

  const displayName = stats?.userName || username || '?';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const accuracy = stats && stats.gameCount > 0
    ? Math.min(100, Math.round((stats.totalPoint / (stats.gameCount * 500)) * 100))
    : 0;

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Profil & Ayarlar</Text>
            <View style={s.backBtn} />
          </View>

          {/* Avatar + Name */}
          <View style={s.profileSection}>
            <LinearGradient colors={Gradients.hero} style={s.avatar}>
              <Text style={s.avatarLetter}>{avatarLetter}</Text>
            </LinearGradient>
            <Text style={s.displayName}>{displayName}</Text>
            <Text style={s.emailText}>{email ?? stats?.userName ?? ''}</Text>
          </View>

          {/* Stats Cards */}
          <View style={s.statsRow}>
            <View style={[s.statCard, Shadows.sm]}>
              <Ionicons name="trophy" size={22} color={Colors.gold} style={s.statIcon} />
              <Text style={s.statVal}>
                {loadingStats ? '—' : (stats?.totalPoint ?? 0).toLocaleString()}
              </Text>
              <Text style={s.statLbl}>TOPLAM PUAN</Text>
            </View>
            <View style={[s.statCard, Shadows.sm]}>
              <Ionicons name="game-controller" size={22} color={Colors.primaryLight} style={s.statIcon} />
              <Text style={s.statVal}>
                {loadingStats ? '—' : stats?.gameCount ?? 0}
              </Text>
              <Text style={s.statLbl}>OYUN SAYISI</Text>
            </View>
            <View style={[s.statCard, Shadows.sm]}>
              <Ionicons name="stats-chart" size={22} color={Colors.success} style={s.statIcon} />
              <Text style={s.statVal}>{loadingStats ? '—' : `%${accuracy}`}</Text>
              <Text style={s.statLbl}>BAŞARI</Text>
            </View>
          </View>

          {/* Navigasyon */}
          <Text style={s.sectionLabel}>HIZLI ERİŞİM</Text>
          <View style={[s.card, Shadows.sm]}>
            <TouchableOpacity
              style={s.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <View style={[s.menuIcon, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                <Ionicons name="podium" size={20} color={Colors.primaryLight} />
              </View>
              <Text style={s.menuLabel}>Liderlik Tablosu</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity
              style={s.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Game')}
            >
              <View style={[s.menuIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <Ionicons name="play-circle" size={20} color={Colors.success} />
              </View>
              <Text style={s.menuLabel}>Yeni Oyun Başlat</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Uygulama Ayarları */}
          <Text style={s.sectionLabel}>UYGULAMA</Text>
          <View style={[s.card, Shadows.sm]}>
            <View style={s.menuRow}>
              <View style={[s.menuIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Ionicons name="notifications" size={20} color={Colors.warning} />
              </View>
              <Text style={s.menuLabel}>Bildirimler</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={s.divider} />

            <View style={s.menuRow}>
              <View style={[s.menuIcon, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                <Ionicons name="volume-high" size={20} color="#A78BFA" />
              </View>
              <Text style={s.menuLabel}>Ses Efektleri</Text>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* Hakkında */}
          <Text style={s.sectionLabel}>HAKKINDA</Text>
          <View style={[s.card, Shadows.sm]}>
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Uygulama Sürümü</Text>
              <Text style={s.infoVal}>1.0.0</Text>
            </View>
            <View style={s.divider} />
            <View style={s.infoRow}>
              <Text style={s.infoKey}>Geliştirici</Text>
              <Text style={s.infoVal}>CarGuessr Team</Text>
            </View>
          </View>

          {/* Çıkış */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={s.logoutTxt}>Çıkış Yap</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], paddingBottom: Spacing['4xl'] },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['2xl'] },
  backBtn: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.textPrimary },

  // Avatar
  profileSection: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  avatar: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, ...Shadows.lg },
  avatarLetter: { fontSize: 38, fontWeight: '900', color: Colors.white },
  displayName: { fontSize: FontSizes['2xl'], fontWeight: '900', color: Colors.textPrimary, marginBottom: Spacing.xs },
  emailText: { fontSize: FontSizes.sm, color: Colors.textMuted, fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing['3xl'] },
  statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { marginBottom: Spacing.sm },
  statVal: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.textPrimary, marginBottom: 2 },
  statLbl: { fontSize: 8, fontWeight: '700', color: Colors.textDim, letterSpacing: 1, textAlign: 'center' },

  // Sections
  sectionLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.md, marginLeft: Spacing.xs },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing['2xl'], overflow: 'hidden' },

  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  menuIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSizes.base, fontWeight: '600', color: Colors.textPrimary },

  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg },
  infoKey: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.textSecondary },
  infoVal: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textPrimary },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.errorMuted, borderRadius: Radius.lg, height: 56, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)', marginTop: Spacing.sm },
  logoutTxt: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.error },
});
