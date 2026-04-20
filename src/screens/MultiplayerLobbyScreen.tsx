import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows, FontSizes } from '../theme';

export default function MultiplayerLobbyScreen() {
  const token = useAuthStore((state) => state.token);
  const { connect, disconnect, createLobby, joinLobby, findRandomMatch, lobbyCode, isMatchmaking, isGameStarted, error } = useMultiplayerStore();
  const navigation = useNavigation<any>();
  const [inputCode, setInputCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const startConnection = async () => {
      if (token) {
        await connect(token);
        setIsConnecting(false);
      }
    };
    startConnection();
  }, [token]);

  useEffect(() => {
    if (isGameStarted) {
      navigation.replace('MultiplayerGame');
    }
  }, [isGameStarted]);

  if (isConnecting) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If matched or waiting for code
  if (isMatchmaking || lobbyCode) {
      return (
          <SafeAreaView style={styles.container}>
             <View style={styles.header}>
               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                 <Text style={styles.backButtonText}>← Geri</Text>
               </TouchableOpacity>
             </View>
             <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl }]}>
                 {isMatchmaking ? (
                     <>
                       <ActivityIndicator size="large" color={Colors.warning} style={{ marginBottom: 30, transform: [{ scale: 1.5 }] }} />
                       <Text style={{fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 10}}>Eşleşme Aranıyor...</Text>
                       <Text style={{color: Colors.textMuted}}>Dünya genelinden oyuncular aranıyor...</Text>
                     </>
                 ) : (
                     <>
                        <View style={{backgroundColor: Colors.bgCard, padding: 30, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', width: '100%'}}>
                            <Text style={{color: Colors.textSecondary, marginBottom: 10, fontWeight: '600'}}>ODA KODU</Text>
                            <Text style={{color: Colors.primaryLight, fontSize: 40, fontWeight: '800', letterSpacing: 5}}>{lobbyCode}</Text>
                        </View>
                        <ActivityIndicator style={{marginTop: 40, marginBottom: 20}} />
                        <Text style={{color: Colors.white, fontSize: 18}}>Arkadaşının katılması bekleniyor...</Text>
                     </>
                 )}
             </View>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Oyun Modu</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && (
            <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )}

        <LinearGradient colors={['#23324C', '#1D283E']} style={styles.quickMatchCard}>
           <Ionicons name="flash" size={48} color={Colors.warning} style={{alignSelf: 'center', marginBottom: Spacing.sm}} />
           <Text style={styles.qmTitle}>Hızlı Eşleşme</Text>
           <Text style={styles.qmSub}>Rastgele oyuncularla rekabet et ve puan kazan</Text>

           <View style={styles.qmStats}>
               <View style={styles.qmStatItem}>
                   <Text style={styles.qmStatLabel}>Ort. Süre</Text>
                   <Text style={[styles.qmStatValue, {color: Colors.success}]}>~15s</Text>
               </View>
               <View style={styles.qmDivider} />
               <View style={styles.qmStatItem}>
                   <Text style={styles.qmStatLabel}>Oyuncu</Text>
                   <Text style={[styles.qmStatValue, {color: Colors.primaryLight}]}>234 çevrimiçi</Text>
               </View>
           </View>

           <TouchableOpacity activeOpacity={0.8} onPress={findRandomMatch} style={styles.findMatchBtn}>
               <Text style={styles.findMatchBtnText}>Eşleşme Bul</Text>
           </TouchableOpacity>
        </LinearGradient>

        <View style={styles.orSection}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>VEYA</Text>
            <View style={styles.orLine} />
        </View>

        <Text style={styles.privateTitle}>Özel Oda (Puan Verilmez)</Text>

        <View style={styles.privateCard}>
            <View style={styles.privateRow}>
               <Ionicons name="game-controller" size={24} color="#8B5CF6" />
               <View style={{flex: 1, marginLeft: Spacing.md}}>
                   <Text style={styles.privateItemTitle}>Özel Oda Kur</Text>
                   <Text style={styles.privateItemSub}>Arkadaşlarınla oyna</Text>
               </View>
               <TouchableOpacity style={styles.smallBtn} onPress={createLobby}>
                   <Text style={styles.smallBtnText}>Kur</Text>
               </TouchableOpacity>
            </View>
        </View>

        <View style={[styles.privateCard, {marginTop: Spacing.md}]}>
            <View style={styles.privateRow}>
               <Ionicons name="link" size={24} color="#C4B5FD" />
               <View style={{flex: 1, marginLeft: Spacing.md}}>
                   <Text style={styles.privateItemTitle}>Özel Odaya Katıl</Text>
                   <Text style={styles.privateItemSub}>Oda kodunu gir</Text>
               </View>
            </View>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="CAR-XXXX"
                    placeholderTextColor={Colors.textMuted}
                    value={inputCode}
                    onChangeText={(t) => setInputCode(t.toUpperCase())}
                    maxLength={6}
                    autoCapitalize="characters"
                />
                <TouchableOpacity 
                   style={[styles.joinBtn, (!inputCode || inputCode.length !== 6) && {opacity: 0.5}]} 
                   onPress={() => joinLobby(inputCode)}
                   disabled={!inputCode || inputCode.length !== 6}
                >
                    <Text style={styles.smallBtnText}>Katıl</Text>
                </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, marginBottom: Spacing.xl },
  backButton: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bgCard },
  backButtonText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: '700' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorMuted, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  errorText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '500' },
  
  // Quick Match
  quickMatchCard: { padding: Spacing['3xl'], borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.lg },
  qmTitle: { color: Colors.white, fontSize: FontSizes['2xl'], fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  qmSub: { color: Colors.textSecondary, textAlign: 'center', fontSize: FontSizes.sm },
  qmStats: { flexDirection: 'row', justifyContent: 'center', marginVertical: Spacing['2xl'] },
  qmStatItem: { alignItems: 'center', paddingHorizontal: 20 },
  qmDivider: { width: 1, backgroundColor: Colors.borderLight },
  qmStatLabel: { color: Colors.textMuted, fontSize: FontSizes.xs, marginBottom: 4 },
  qmStatValue: { fontWeight: '700', fontSize: FontSizes.md },
  findMatchBtn: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: Radius.lg, alignItems: 'center', ...Shadows.glow(Colors.primary) },
  findMatchBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '700' },

  // OR
  orSection: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing['2xl'] },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { color: Colors.textMuted, marginHorizontal: Spacing.md, fontSize: 10, fontWeight: '600' },

  // Private Match
  privateTitle: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.lg },
  privateCard: { backgroundColor: '#181F2B', borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  privateRow: { flexDirection: 'row', alignItems: 'center' },
  privateItemTitle: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base },
  privateItemSub: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: 2 },
  smallBtn: { backgroundColor: '#23324C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  smallBtnText: { color: Colors.textPrimary, fontWeight: '600', fontSize: FontSizes.sm },
  inputRow: { flexDirection: 'row', marginTop: Spacing.lg, gap: Spacing.sm },
  input: { flex: 1, backgroundColor: '#131924', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, color: Colors.white, fontSize: FontSizes.base },
  joinBtn: { backgroundColor: '#23324C', justifyContent: 'center', paddingHorizontal: 24, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight }
});
