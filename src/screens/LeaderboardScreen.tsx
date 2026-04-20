import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSizes, Shadows } from '../theme';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

interface LeaderboardItem {
    id: number;
    userName: string;
    totalScored: number;
    rankName: string;
}

export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Bu Hafta');
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  
  const currentUserName = useAuthStore(s => s.username);

  const fetchLeaders = async (tabName: string) => {
      setLoading(true);
      try {
          let period = 'alltime';
          if (tabName === 'Bugün') period = 'today';
          if (tabName === 'Bu Hafta') period = 'weekly';

          const res = await apiClient.get(`/Users/leaderboard?period=${period}&Page=1&Size=20`);
          setLeaders(res.data.items || []);
      } catch (e) {
          console.error("Leaderboard error:", e);
      } finally {
          setLoading(false);
      }
  };

  const fetchUserStats = async () => {
      try {
          const res = await apiClient.get('/Users/current-user');
          setUserStats(res.data);
      } catch(e) {}
  };

  useEffect(() => {
      fetchLeaders(activeTab);
  }, [activeTab]);

  useEffect(() => {
      fetchUserStats();
  }, []);

  const getEmojiForRank = (index: number) => {
      if (index === 0) return '🏎️';
      if (index === 1) return '🚙';
      if (index === 2) return '🛻';
      return '🏁';
  };

  // Top 3 for Podium
  const top1 = leaders.length > 0 ? leaders[0] : null;
  const top2 = leaders.length > 1 ? leaders[1] : null;
  const top3 = leaders.length > 2 ? leaders[2] : null;
  const remaining = leaders.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
         {['Bugün', 'Bu Hafta', 'Tüm Zamanlar'].map((tab) => (
             <TouchableOpacity 
                key={tab} 
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
             >
                 <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
             </TouchableOpacity>
         ))}
      </View>

      {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Podium */}
            {leaders.length > 0 && (
              <View style={styles.podiumContainer}>
                {/* 2nd Place */}
                {top2 ? (
                  <View style={[styles.podiumCard, { marginTop: 30, borderColor: top2.userName === currentUserName ? Colors.primary : Colors.border }]}>
                      <Text style={{fontSize: 24, marginBottom: Spacing.sm}}>{getEmojiForRank(1)}</Text>
                      <View style={[styles.medalIcon, {backgroundColor: Colors.silver}]}><Text style={styles.medalText}>2</Text></View>
                      <Text style={styles.podiumName}>{top2.userName}</Text>
                      <Text style={styles.podiumScore}>{top2.totalScored}</Text>
                  </View>
                ) : <View style={[styles.podiumCard, { opacity: 0 }]} />}

                {/* 1st Place */}
                {top1 && (
                  <View style={[styles.podiumCard, { borderColor: top1.userName === currentUserName ? Colors.primary : Colors.borderFocus, borderWidth: 1 }]}>
                      <Text style={{fontSize: 24, marginBottom: Spacing.sm}}>{getEmojiForRank(0)}</Text>
                      <View style={[styles.medalIcon, {backgroundColor: Colors.gold}]}><Text style={styles.medalText}>1</Text></View>
                      <Text style={styles.podiumName}>{top1.userName}</Text>
                      <Text style={styles.podiumScore}>{top1.totalScored}</Text>
                  </View>
                )}

                {/* 3rd Place */}
                {top3 ? (
                  <View style={[styles.podiumCard, { marginTop: 30, borderColor: top3.userName === currentUserName ? Colors.primary : Colors.border }]}>
                      <Text style={{fontSize: 24, marginBottom: Spacing.sm}}>{getEmojiForRank(2)}</Text>
                      <View style={[styles.medalIcon, {backgroundColor: Colors.bronze}]}><Text style={styles.medalText}>3</Text></View>
                      <Text style={styles.podiumName}>{top3.userName}</Text>
                      <Text style={styles.podiumScore}>{top3.totalScored}</Text>
                  </View>
                ) : <View style={[styles.podiumCard, { opacity: 0 }]} />}
              </View>
            )}

            {/* List */}
            {remaining.length > 0 && (
              <View style={styles.listContainer}>
                {remaining.map((user, index) => {
                  const actualRank = index + 4;
                  const isMe = user.userName === currentUserName;
                  return (
                    <View key={user.id || index} style={[styles.listRow, isMe && { borderColor: Colors.primary }]}>
                        <Text style={styles.rowRank}>#{actualRank}</Text>
                        <Text style={styles.rowEmoji}>{getEmojiForRank(actualRank)}</Text>
                        <Text style={styles.rowName}>{user.userName}</Text>
                        <Text style={styles.rowScore}>{user.totalScored}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {!loading && leaders.length === 0 && (
                <Text style={{color: Colors.textMuted, textAlign: 'center', marginVertical: 40}}>Bu dönem için rekor yok.</Text>
            )}

            {/* Your Stats */}
            {userStats && (
              <View style={styles.yourStatsBox}>
                <Text style={styles.yourStatsTitle}>İstatistiklerin</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                        <Text style={[styles.statVal, {color: Colors.primary, fontSize: FontSizes.lg, fontWeight: '800'}]}>{userStats.rankName || 'Çaylak Şoför'}</Text>
                        <Text style={styles.statLab}>Güncel Rütben</Text>
                    </View>
                    <View style={styles.statCol}>
                        <Text style={[styles.statVal, {color: Colors.success}]}>{userStats.totalPoint}</Text>
                        <Text style={styles.statLab}>Toplam Puan</Text>
                    </View>
                    <View style={styles.statCol}>
                        <Text style={[styles.statVal, {color: Colors.error}]}>{userStats.gameCount}</Text>
                        <Text style={styles.statLab}>Maçlar</Text>
                    </View>
                </View>
              </View>
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, marginBottom: Spacing.xl },
  backButton: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bgCard },
  backButtonText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: '700' },
  
  // Tabs
  tabsContainer: { flexDirection: 'row', marginHorizontal: Spacing.xl, backgroundColor: Colors.bgInput, borderRadius: Radius.full, padding: 4, marginBottom: Spacing['2xl'] },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.full },
  tabBtnActive: { backgroundColor: Colors.primary, ...Shadows.glow(Colors.primary) },
  tabText: { color: Colors.textMuted, fontWeight: '600', fontSize: FontSizes.sm },
  tabTextActive: { color: Colors.white, fontWeight: '800' },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },

  // Podium
  podiumContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing['3xl'] },
  podiumCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', width: '30%', minHeight: 140, borderWidth: 1, borderColor: Colors.border },
  medalIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, marginTop: -10, borderWidth: 2, borderColor: Colors.bgCard },
  medalText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  podiumName: { color: Colors.white, fontSize: 13, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  podiumScore: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },

  // List
  listContainer: { gap: Spacing.md, marginBottom: Spacing['3xl'] },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  rowRank: { color: Colors.textMuted, fontSize: FontSizes.base, fontWeight: '700', width: 30 },
  rowEmoji: { fontSize: 20, width: 35, textAlign: 'center' },
  rowName: { flex: 1, color: Colors.white, fontSize: FontSizes.base, fontWeight: '700', marginLeft: Spacing.sm },
  rowScore: { color: Colors.primaryLight, fontSize: FontSizes.base, fontWeight: '600' },

  // Your Stats
  yourStatsBox: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing['2xl'], borderWidth: 1, borderColor: Colors.border },
  yourStatsTitle: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '800', marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: FontSizes['2xl'], fontWeight: '300', marginBottom: 4, textAlign: 'center' },
  statLab: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600', textAlign: 'center' }
});
