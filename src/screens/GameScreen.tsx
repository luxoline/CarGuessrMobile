import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, ActivityIndicator,
  SafeAreaView, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, FontSizes } from '../theme';

export default function GameScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctOption] = useState<string>('BMW');
  const [score, setScore] = useState(0);
  const [currentIdx] = useState(0);
  const [totalQuestions] = useState(1);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateScore = () => {
    Animated.sequence([
      Animated.spring(scoreAnim, { toValue: 1.3, useNativeDriver: true, friction: 3 }),
      Animated.spring(scoreAnim, { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start();
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === correctOption) { setScore(prev => prev + 100); animateScore(); }
    setTimeout(() => { setSelectedOption(null); }, 1500);
  };

  const optStyle = (o: string) => {
    if (!selectedOption) return s.optDef;
    if (o === correctOption) return s.optOk;
    if (o === selectedOption) return s.optBad;
    return s.optDis;
  };

  const optText = (o: string) => {
    if (!selectedOption) return s.optTxtDef;
    if (o === correctOption || o === selectedOption) return s.optTxtAct;
    return s.optTxtDis;
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.topBar, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>CarGuessr</Text>
          <View style={s.back} />
        </Animated.View>

        <Animated.View style={[s.board, Shadows.sm, { opacity: fadeAnim }]}>
          <View style={s.bStat}><Text style={s.bLbl}>SORU</Text><View style={{flexDirection:'row',alignItems:'baseline'}}><Text style={s.bVal}>{currentIdx+1}</Text><Text style={s.bSub}>/ {totalQuestions}</Text></View></View>
          <View style={s.bDiv} />
          <View style={s.bStatC}><Text style={s.bLbl}>MOD</Text><Text style={s.bMode}>Klasik</Text></View>
          <View style={s.bDiv} />
          <View style={s.bStatE}><Text style={s.bLbl}>SKOR</Text><Animated.Text style={[s.bScore,{transform:[{scale:scoreAnim}]}]}>{score}</Animated.Text></View>
        </Animated.View>

        <Animated.View style={[s.qSec, { opacity: fadeAnim }]}>
          <Text style={s.qTxt}>Bu parça hangi araca ait?</Text>
          <View style={s.qBar} />
        </Animated.View>

        <Animated.View style={[Shadows.md, { opacity: fadeAnim, transform: [{ translateY: cardSlide }] }]}>
          <View style={s.card}>
            <View style={s.imgWrap}>
              {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
                <Image source={{ uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop' }} style={s.img} resizeMode="cover" />
              )}
              <View style={s.imgBadge}><Ionicons name="image-outline" size={12} color="rgba(255,255,255,0.8)" /><Text style={s.imgBadgeTxt}>Detay</Text></View>
            </View>
            <View style={s.opts}>
              {['Audi','BMW','Mercedes','Toyota'].map((o,i) => (
                <TouchableOpacity key={o} onPress={() => handleOptionSelect(o)} disabled={!!selectedOption} activeOpacity={0.8} style={[s.optBase, optStyle(o)]}>
                  <View style={s.optL}>
                    <View style={[s.optLtr, selectedOption && o===correctOption && s.optLtrOk, selectedOption && o===selectedOption && o!==correctOption && s.optLtrBad]}>
                      <Text style={s.optLtrTxt}>{String.fromCharCode(65+i)}</Text>
                    </View>
                    <Text style={optText(o)}>{o}</Text>
                  </View>
                  {selectedOption && o===correctOption && <Ionicons name="checkmark-circle" size={24} color={Colors.success} />}
                  {selectedOption && o===selectedOption && o!==correctOption && <Ionicons name="close-circle" size={24} color={Colors.error} />}
                  {!selectedOption && <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[s.tip, { opacity: fadeAnim }]}>
          <View style={s.tipIco}><Ionicons name="bulb-outline" size={14} color={Colors.warningLight} /></View>
          <Text style={s.tipTxt}>İpucu: Aracın far yapısına dikkat et!</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing['4xl'] },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  back: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  topTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  board: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing['2xl'], borderWidth: 1, borderColor: Colors.border },
  bStat: { flex: 1 }, bStatC: { flex: 1, alignItems: 'center' }, bStatE: { flex: 1, alignItems: 'flex-end' },
  bLbl: { fontSize: 9, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, marginBottom: 4 },
  bVal: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.textPrimary },
  bSub: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textDim, marginLeft: 3 },
  bMode: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  bDiv: { width: 1, height: 30, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  bScore: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.success },
  qSec: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xs },
  qTxt: { fontSize: FontSizes['2xl'], fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  qBar: { width: 48, height: 4, backgroundColor: Colors.primary, borderRadius: Radius.full },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius['2xl'], borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.xl },
  imgWrap: { aspectRatio: 4/3, backgroundColor: Colors.bgSurface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgBadge: { position: 'absolute', bottom: Spacing.md, right: Spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, gap: 4 },
  imgBadgeTxt: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  opts: { padding: Spacing.lg, gap: 10 },
  optBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1.5 },
  optDef: { backgroundColor: Colors.bgSurface, borderColor: Colors.border },
  optOk: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: Colors.success },
  optBad: { backgroundColor: 'rgba(244,63,94,0.12)', borderColor: Colors.error },
  optDis: { backgroundColor: Colors.bgSurface, borderColor: Colors.border, opacity: 0.35 },
  optL: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  optLtr: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  optLtrOk: { backgroundColor: Colors.successMuted, borderColor: Colors.success },
  optLtrBad: { backgroundColor: Colors.errorMuted, borderColor: Colors.error },
  optLtrTxt: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textSecondary },
  optTxtDef: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.textPrimary },
  optTxtAct: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.textPrimary },
  optTxtDis: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.textDim },
  tip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, opacity: 0.6 },
  tipIco: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.warningMuted, alignItems: 'center', justifyContent: 'center' },
  tipTxt: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
});
