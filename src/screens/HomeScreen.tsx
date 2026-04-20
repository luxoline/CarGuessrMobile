import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, FontSizes } from '../theme';

type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  MultiplayerLobby: undefined;
  MultiplayerGame: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const username = useAuthStore((state) => state.username);
  const navigation = useNavigation<NavigationProp>();
  const [userStats, setUserStats] = useState({ points: 0, rank: '#--', games: 0, winRate: '0%', streak: 0, rankName: '' });
  const [weeklyLeaders, setWeeklyLeaders] = useState<any[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await apiClient.get('/Users/current-user');
        const data = res.data;
        setUserStats({
          points: data?.totalPoint ?? 0,
          rank: data?.rankName || 'Çaylak Şoför', // Dynamic Rank
          games: data?.gameCount ?? 0,
          winRate: '87%', // Mock
          streak: 12, // Mock 
          rankName: data?.rankName || ''
        });
      } catch (e) {}
    };

    const fetchWeeklyLeaders = async () => {
      try {
        const res = await apiClient.get('/Users/leaderboard?period=weekly&Page=1&Size=3');
        setWeeklyLeaders(res.data.items || []);
      } catch (e) {}
    };

    fetchCurrentUser();
    fetchWeeklyLeaders();
  }, []);

  const getEmojiForRank = (index: number) => {
      if (index === 0) return '🏎️';
      if (index === 1) return '🚙';
      if (index === 2) return '🛻';
      return '🏁';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>CarGuessr</Text>
            <Text style={styles.welcomeText}>Tekrar Hoş Geldin!</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarCircle}>
             <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.avatarGradient}>
                <Ionicons name="flash" size={20} color={Colors.warning} />
             </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Your Points Card */}
        <LinearGradient colors={['#23324C', '#1D283E']} style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View>
               <Text style={styles.cardLabel}>Puanın</Text>
               <Text style={styles.pointsValue}>{userStats.points.toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.cardLabel}>Dünya Sıralaman</Text>
               <Text style={styles.rankValue}>{userStats.rank}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Your Stats */}
        <Text style={styles.sectionTitle}>İstatistiklerin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
           <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.primaryLight }]}>{userStats.games}</Text>
              <Text style={styles.statLabel}>Maç Sayısı</Text>
           </View>
           <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>{userStats.winRate}</Text>
              <Text style={styles.statLabel}>Kazanma Oranı</Text>
           </View>
           <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.error }]}>{userStats.streak} <Text style={{fontSize: 16}}>🔥</Text></Text>
              <Text style={styles.statLabel}>Kazanma Serisi</Text>
           </View>
        </ScrollView>

        {/* This Week's Leaders */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Bu Haftanın Liderleri</Text>
           <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
             <Text style={styles.viewAllText}>Tümünü Gör ➔</Text>
           </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
           {weeklyLeaders.map((leader, idx) => {
               const isMe = leader.userName === username;
               let medalBg = Colors.gold;
               if (idx === 1) medalBg = Colors.silver;
               else if (idx === 2) medalBg = Colors.bronze;

               return (
                   <View key={leader.id || idx} style={[styles.leaderCard, isMe && { borderColor: Colors.primary, borderWidth: 1 }]}>
                      <View style={styles.leaderIconRow}>
                         {isMe ? <Ionicons name="flash" size={20} color={Colors.warning} /> : <Text style={{fontSize: 20}}>{getEmojiForRank(idx)}</Text>}
                         <View style={[styles.medalIcon, {backgroundColor: medalBg}]}><Text style={styles.medalText}>{idx + 1}</Text></View>
                      </View>
                      <Text style={styles.leaderName}>{leader.userName}</Text>
                      <Text style={styles.leaderScore}>{leader.totalScored}</Text>
                   </View>
               );
           })}
           {weeklyLeaders.length === 0 && (
               <Text style={{color: Colors.textMuted, margin: 20}}>Liderler yükleniyor...</Text>
           )}
        </ScrollView>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Start Game Button */}
      <View style={styles.floatingButtonContainer}>
         <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Game')} style={styles.startGameButton}>
            <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.startGameGradient}>
               <FontAwesome5 name="gamepad" size={20} color={Colors.white} />
               <Text style={styles.startGameText}>Oyuna Başla</Text>
            </LinearGradient>
         </TouchableOpacity>
      </View>

      {/* Mock Bottom Navigation */}
      <View style={styles.bottomNav}>
         <TouchableOpacity style={styles.navItem}>
             <Ionicons name="home" size={24} color={Colors.primary} />
             <Text style={[styles.navText, { color: Colors.primary }]}>Ana Sayfa</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
             <Ionicons name="target" size={24} color={Colors.error} />
             <Text style={styles.navText}>Günlük</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => navigation.navigate('MultiplayerLobby')} style={styles.navItem}>
             <Ionicons name="people" size={24} color={Colors.primaryDark} />
             <Text style={styles.navText}>Online</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.navItem}>
             <Ionicons name="trophy" size={24} color={Colors.warning} />
             <Text style={styles.navText}>Sıralama</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing['2xl'] },
  logoText: { color: Colors.primary, fontSize: FontSizes['2xl'], fontWeight: '800', letterSpacing: 0.5 },
  welcomeText: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: 4 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pointsCard: { marginHorizontal: Spacing.xl, borderRadius: Radius.xl, padding: Spacing['2xl'], marginBottom: Spacing['2xl'], ...Shadows.md },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.xs },
  pointsValue: { color: Colors.primaryLight, fontSize: 36, fontWeight: '300' },
  rankValue: { color: Colors.primary, fontSize: 36, fontWeight: '400' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  sectionTitle: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '700', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  viewAllText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700' },
  horizontalScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.sm },
  statCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, minWidth: 110, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  statNumber: { fontSize: 28, fontWeight: '300', marginBottom: Spacing.xs },
  statLabel: { color: Colors.textMuted, fontSize: FontSizes.xs, fontWeight: '600' },
  leaderCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, minWidth: 140, borderWidth: 1, borderColor: '#1F2937' },
  leaderIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  medalIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },
  medalText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  leaderName: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700', marginBottom: 4 },
  leaderScore: { color: Colors.primaryLight, fontSize: FontSizes.lg, fontWeight: '300' },
  floatingButtonContainer: { position: 'absolute', bottom: 85, left: 0, right: 0, paddingHorizontal: Spacing.xl },
  startGameButton: { borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.glow(Colors.primary) },
  startGameGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.md },
  startGameText: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: Colors.bgCard, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 4 }
});
