import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ActivityIndicator,
  SafeAreaView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Shadows, Spacing, FontSizes } from '../theme';

export default function LeaderboardScreen() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient.get('/Users/leaderboard?Page=1&Size=20');
        // Response: { totalCount: number, items: LeaderboardDto[] }
        // LeaderboardDto: { id, userName, totalScored }
        const items = response.data?.items ?? response.data ?? [];
        setLeaderboard(Array.isArray(items) ? items : []);
      } catch (error) {
        console.log('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return { color: Colors.gold, bg: 'rgba(251,191,36,0.12)' };
    if (index === 1) return { color: Colors.silver, bg: 'rgba(148,163,184,0.12)' };
    if (index === 2) return { color: Colors.bronze, bg: 'rgba(205,127,50,0.12)' };
    return null;
  };

  const getAvatarColors = (index: number): readonly [string, string] => {
    const palettes: readonly [string, string][] = [
      ['#F59E0B', '#FBBF24'],
      ['#6366F1', '#818CF8'],
      ['#CD7F32', '#D4976A'],
      ['#10B981', '#34D399'],
      ['#EC4899', '#F472B6'],
      ['#8B5CF6', '#A78BFA'],
    ];
    return palettes[index % palettes.length];
  };

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={s.title}>Liderlik Tablosu</Text>
          <View style={s.back} />
        </View>

        {/* Info Banner */}
        <LinearGradient
          colors={['rgba(99,102,241,0.12)', 'rgba(99,102,241,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.infoBanner}
        >
          <View style={s.infoIconBg}>
            <Ionicons name="information-circle" size={20} color={Colors.primaryLight} />
          </View>
          <Text style={s.infoText}>
            Sıralama haftalık güncellenir. İlk 3'e giren her hafta özel ödüller kazanır!
          </Text>
        </LinearGradient>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={leaderboard}
            showsVerticalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={s.listContent}
            renderItem={({ item, index }) => {
              const rankInfo = getRankIcon(index);
              return (
                <View style={[s.row, Shadows.sm, index < 3 && s.rowTop3]}>
                  {/* Rank */}
                  <View style={s.rankWrap}>
                    {rankInfo ? (
                      <View style={[s.rankBadge, { backgroundColor: rankInfo.bg }]}>
                        <Ionicons name="trophy" size={18} color={rankInfo.color} />
                      </View>
                    ) : (
                      <View style={s.rankNumWrap}>
                        <Text style={s.rankNum}>{index + 1}</Text>
                      </View>
                    )}
                  </View>

                  {/* Avatar */}
                  <LinearGradient colors={getAvatarColors(index)} style={s.avatar}>
                    <Text style={s.avatarText}>
                      {(item.userName || item.username || '?').charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>

                  {/* Info */}
                  <View style={s.userInfo}>
                    <Text style={s.userName}>{item.userName || item.username || 'Bilinmeyen'}</Text>
                    <Text style={s.userTitle}>Usta Tahminci</Text>
                  </View>

                  {/* Score */}
                  <View style={s.scoreWrap}>
                    <Text style={[s.scoreVal, index < 3 && s.scoreTop3]}>
                      {(item.totalScored ?? item.totalScore ?? item.score ?? 0).toLocaleString()}
                    </Text>
                    <Text style={s.scoreLbl}>PUAN</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['2xl'] },
  back: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)' },
  infoIconBg: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  infoText: { flex: 1, fontSize: FontSizes.sm, color: Colors.primaryLight, fontWeight: '500', lineHeight: 18 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: Spacing['4xl'] },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  rowTop3: { borderColor: 'rgba(99,102,241,0.2)' },

  rankWrap: { width: 40, alignItems: 'center', marginRight: Spacing.md },
  rankBadge: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rankNumWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textDim },

  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.white },

  userInfo: { flex: 1 },
  userName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  userTitle: { fontSize: FontSizes.xs, color: Colors.textDim, fontWeight: '500' },

  scoreWrap: { alignItems: 'flex-end' },
  scoreVal: { fontSize: FontSizes.lg, fontWeight: '900', color: Colors.success },
  scoreTop3: { color: Colors.warningLight },
  scoreLbl: { fontSize: 9, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, marginTop: 2 },
});
