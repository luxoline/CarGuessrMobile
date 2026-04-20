import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
    // Don't disconnect on unmount — the connection must persist
    // when navigating to MultiplayerGameScreen
  }, [token]);

  useEffect(() => {
    if (isGameStarted) {
      navigation.replace('MultiplayerGame'); // Navigate to the game screen immediately when started
    }
  }, [isGameStarted]);

  if (isConnecting) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Sunucuya bağlanılıyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Online Kapışma</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {error && (
            <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )}

        {isMatchmaking ? (
            <View style={styles.waitingContainer}>
               <ActivityIndicator size="large" color={Colors.warning} style={{ marginVertical: 30, transform: [{ scale: 1.5 }] }} />
               <Text style={[styles.waitingText, { color: Colors.warning }]}>Rakip Aranıyor...</Text>
               <Text style={styles.waitingSub}>Dünya genelinde eşleşebileceğin bir oyuncu aranıyor. Lütfen bekle.</Text>
            </View>
        ) : !lobbyCode ? (
            <View style={styles.actionsContainer}>
               {/* Quick Match Card */}
               <TouchableOpacity style={[styles.actionCard, { marginBottom: Spacing.xl }]} onPress={findRandomMatch}>
                 <LinearGradient colors={[Colors.warning, Colors.gold]} style={[styles.actionCardGradient, { paddingVertical: Spacing.lg }]}>
                    <Ionicons name="flash" size={32} color={Colors.white} />
                    <Text style={[styles.actionCardTitle, { fontSize: FontSizes.xl }]}>Hemen Oyuna Başla</Text>
                    <Text style={styles.actionCardSub}>Rastgele bir rakiple eşleş</Text>
                 </LinearGradient>
               </TouchableOpacity>

               <TouchableOpacity style={styles.actionCard} onPress={createLobby}>
                 <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.actionCardGradient, { paddingVertical: Spacing.lg }]}>
                    <Ionicons name="add-circle" size={40} color={Colors.white} />
                    <Text style={styles.actionCardTitle}>Oda Kur</Text>
                    <Text style={styles.actionCardSub}>Arkadaşını davet et</Text>
                 </LinearGradient>
               </TouchableOpacity>

               <View style={styles.divider}>
                   <View style={styles.dividerLine} />
                   <Text style={styles.dividerText}>VEYA</Text>
                   <View style={styles.dividerLine} />
               </View>

               <View style={styles.joinContainer}>
                   <Text style={styles.joinLabel}>Oda Kodu</Text>
                   <TextInput
                       style={styles.input}
                       placeholder="6 Haneli Kod"
                       placeholderTextColor={Colors.textMuted}
                       value={inputCode}
                       onChangeText={(text) => setInputCode(text.toUpperCase())}
                       maxLength={6}
                       autoCapitalize="characters"
                   />
                   <TouchableOpacity
                       style={[styles.button, (!inputCode || inputCode.length !== 6) && styles.buttonDisabled]}
                       onPress={() => joinLobby(inputCode)}
                       disabled={!inputCode || inputCode.length !== 6}
                   >
                       <Text style={styles.buttonText}>Odaya Katıl</Text>
                   </TouchableOpacity>
               </View>
            </View>
        ) : (
            <View style={styles.waitingContainer}>
               <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>Lobi Kodu</Text>
                  <Text style={styles.codeText}>{lobbyCode}</Text>
               </View>
               <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
               <Text style={styles.waitingText}>Rakip bekleniyor...</Text>
               <Text style={styles.waitingSub}>Bu kodu arkadaşınla paylaş, odaya katılsın.</Text>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, color: Colors.textMuted, fontSize: FontSizes.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, height: 60 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, padding: Spacing.xl },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorMuted, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  errorText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '500' },
  actionsContainer: { flex: 1, justifyContent: 'center' },
  actionCard: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.md },
  actionCardGradient: { padding: Spacing['2xl'], alignItems: 'center' },
  actionCardTitle: { color: Colors.white, fontSize: FontSizes['2xl'], fontWeight: '800', marginTop: Spacing.md },
  actionCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSizes.sm, marginTop: Spacing.xs },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing['2xl'] },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.md, color: Colors.textMuted, fontWeight: '700', fontSize: FontSizes.xs },
  joinContainer: { backgroundColor: Colors.bgCard, padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  joinLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 5, marginBottom: Spacing.lg },
  button: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '700' },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  codeBox: { backgroundColor: Colors.primaryMuted, padding: Spacing['2xl'], borderRadius: Radius['2xl'], alignItems: 'center', width: '100%', borderWidth: 1, borderColor: Colors.primary },
  codeLabel: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: Spacing.sm },
  codeText: { color: Colors.primaryDark, fontSize: 48, fontWeight: '900', letterSpacing: 10 },
  waitingText: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  waitingSub: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
