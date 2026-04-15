import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, ActivityIndicator,
  SafeAreaView, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, FontSizes } from '../theme';

export default function GameScreen() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [gameGuid, setGameGuid] = useState<string | null>(null);

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.8)).current;
  const scoreRef = useRef(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    startGame();
  }, []);

  const startGame = async () => {
    try {
      setLoading(true);
      scoreRef.current = 0;
      setScore(0);
      setCurrentIdx(0);
      setGameOver(false);
      setSelectedOptionId(null);
      resultFade.setValue(0);
      resultScale.setValue(0.8);

      const sessionRes = await apiClient.post('/Questions/start-game-session', {
        questionLimit: 5, timeForEveryQuestion: 15, difficultyLevel: 0,
      });

      const sessionGuid = sessionRes.data?.sessionGuid;
      setGameGuid(sessionGuid ?? null);

      const qs = sessionRes.data?.questions;
      if (Array.isArray(qs) && qs.length > 0) {
        setQuestions(qs);
        setTotalQuestions(qs.length);
      } else {
        const qsRes = await apiClient.get('/Questions?examSize=5&difficultyLevel=0');
        const fallback = Array.isArray(qsRes.data) ? qsRes.data : [];
        setQuestions(fallback);
        setTotalQuestions(fallback.length);
      }
    } catch (err) {
      console.log('Failed to start game', err);
    } finally {
      setLoading(false);
    }
  };

  const animateScore = () => {
    Animated.sequence([
      Animated.spring(scoreAnim, { toValue: 1.3, useNativeDriver: true, friction: 3 }),
      Animated.spring(scoreAnim, { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start();
  };

  const handleOptionSelect = async (optionId: number) => {
    if (selectedOptionId !== null || gameOver || questions.length === 0) return;
    setSelectedOptionId(optionId);

    const currentQ = questions[currentIdx];
    // trueAnswerId ile karşılaştır
    const isCorrect = optionId === currentQ.trueAnswerId;

    if (isCorrect) {
      scoreRef.current += 100;
      setScore(scoreRef.current);
      animateScore();
    }

    setTimeout(async () => {
      setSelectedOptionId(null);
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Oyun bitti — skoru kaydet, sonuç ekranını göster
        const finalScoreValue = scoreRef.current;
        setFinalScore(finalScoreValue);
        setGameOver(true);

        // Sonuç ekranı animasyonu
        Animated.parallel([
          Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(resultScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        ]).start();

        // Skoru backend'e gönder (arka planda)
        try {
          await apiClient.post('/Questions/end-game-session', {
            guid: gameGuid,
            totalScore: finalScoreValue,
          });
        } catch (e) {
          console.log('Error ending game', e);
        }
      }
    }, 1500);
  };

  // Mevcut soru verisi
  const currentQuestion = questions[currentIdx] || {};
  // options: [{id, content}, ...]
  const opts: { id: number; content: string }[] = currentQuestion.options || [];
  const trueAnswerId: number = currentQuestion.trueAnswerId;

  // Stil fonksiyonları — optionId üzerinden çalışır
  const optStyle = (optId: number) => {
    if (selectedOptionId === null) return s.optDef;
    if (optId === trueAnswerId) return s.optOk;
    if (optId === selectedOptionId) return s.optBad;
    return s.optDis;
  };

  const optTextStyle = (optId: number) => {
    if (selectedOptionId === null) return s.optTxtDef;
    if (optId === trueAnswerId || optId === selectedOptionId) return s.optTxtAct;
    return s.optTxtDis;
  };

  if (gameOver) {
    const maxScore = totalQuestions * 100;
    const pct = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
    const medal = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🥉';
    const label = pct >= 80 ? 'Harika!' : pct >= 50 ? 'İyi iş!' : 'Daha iyi olabilirsin';
    const labelColor = pct >= 80 ? Colors.gold : pct >= 50 ? Colors.silver : Colors.textMuted;

    return (
      <SafeAreaView style={s.root}>
        <Animated.View style={[s.resultWrap, { opacity: resultFade, transform: [{ scale: resultScale }] }]}>
          {/* Medal */}
          <Text style={s.medal}>{medal}</Text>
          <Text style={[s.resultLabel, { color: labelColor }]}>{label}</Text>

          {/* Score card */}
          <LinearGradient
            colors={['rgba(99,102,241,0.15)', 'rgba(99,102,241,0.05)']}
            style={s.scoreCard}
          >
            <Text style={s.scoreCardLbl}>TOPLAM SKOR</Text>
            <Text style={s.scoreCardVal}>{finalScore}</Text>
            <Text style={s.scoreCardSub}>{totalQuestions} sorudan {Math.round(pct)}% doğru</Text>
          </LinearGradient>

          {/* Buttons */}
          <TouchableOpacity
            onPress={startGame}
            activeOpacity={0.85}
            style={s.btnPrimary}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.btnGrad}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={s.btnPrimaryTxt}>Yeni Oyun</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
            style={s.btnSecondary}
          >
            <Ionicons name="home-outline" size={20} color={Colors.textSecondary} />
            <Text style={s.btnSecondaryTxt}>Ana Menü</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.7}
          >
            <Text style={s.leaderboardLink}>Liderlik Tablosuna Göz At →</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

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
          <View style={s.bStat}><Text style={s.bLbl}>SORU</Text><View style={{flexDirection:'row',alignItems:'baseline'}}><Text style={s.bVal}>{questions.length > 0 ? currentIdx + 1 : 0}</Text><Text style={s.bSub}>/ {questions.length > 0 ? questions.length : '-'}</Text></View></View>
          <View style={s.bDiv} />
          <View style={s.bStatC}><Text style={s.bLbl}>MOD</Text><Text style={s.bMode}>Klasik</Text></View>
          <View style={s.bDiv} />
          <View style={s.bStatE}><Text style={s.bLbl}>SKOR</Text><Animated.Text style={[s.bScore,{transform:[{scale:scoreAnim}]}]}>{score}</Animated.Text></View>
        </Animated.View>

        <Animated.View style={[s.qSec, { opacity: fadeAnim }]}>
          {/* Soruyu backend'den gelen title ile göster */}
          <Text style={s.qTxt}>{currentQuestion.title || 'Bu parça hangi araca ait?'}</Text>
          <View style={s.qBar} />
        </Animated.View>

        <Animated.View style={[Shadows.md, { opacity: fadeAnim, transform: [{ translateY: cardSlide }] }]}>
          <View style={s.card}>
            <View style={s.imgWrap}>
              {loading
                ? <ActivityIndicator size="large" color={Colors.primary} />
                : <Image
                    source={{
                      // photo alanı URL değilse placeholder kullan
                      uri: (currentQuestion.photo && currentQuestion.photo.startsWith('http'))
                        ? currentQuestion.photo
                        : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop'
                    }}
                    style={s.img}
                    resizeMode="cover"
                  />
              }
              <View style={s.imgBadge}>
                <Ionicons name="image-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={s.imgBadgeTxt}>Detay</Text>
              </View>
            </View>

            <View style={s.opts}>
              {opts.map((opt, i) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleOptionSelect(opt.id)}
                  disabled={selectedOptionId !== null || loading}
                  activeOpacity={0.8}
                  style={[s.optBase, optStyle(opt.id)]}
                >
                  <View style={s.optL}>
                    <View style={[
                      s.optLtr,
                      selectedOptionId !== null && opt.id === trueAnswerId && s.optLtrOk,
                      selectedOptionId !== null && opt.id === selectedOptionId && opt.id !== trueAnswerId && s.optLtrBad,
                    ]}>
                      <Text style={s.optLtrTxt}>{String.fromCharCode(65 + i)}</Text>
                    </View>
                    {/* content string olduğu için güvenle render edilebilir */}
                    <Text style={optTextStyle(opt.id)}>{opt.content}</Text>
                  </View>
                  {selectedOptionId !== null && opt.id === trueAnswerId &&
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />}
                  {selectedOptionId !== null && opt.id === selectedOptionId && opt.id !== trueAnswerId &&
                    <Ionicons name="close-circle" size={24} color={Colors.error} />}
                  {selectedOptionId === null &&
                    <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />}
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

  // Sonuç ekranı
  resultWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.xl,
  },
  medal: { fontSize: 72, textAlign: 'center' },
  resultLabel: { fontSize: FontSizes['2xl'], fontWeight: '900', letterSpacing: -0.5 },
  scoreCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  scoreCardLbl: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.sm },
  scoreCardVal: { fontSize: 64, fontWeight: '900', color: Colors.textPrimary, lineHeight: 72 },
  scoreCardSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500', marginTop: Spacing.sm },
  btnPrimary: { width: '100%', borderRadius: Radius.lg, overflow: 'hidden' },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, height: 56, borderRadius: Radius.lg },
  btnPrimaryTxt: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  btnSecondary: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnSecondaryTxt: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textSecondary },
  leaderboardLink: { fontSize: FontSizes.sm, color: Colors.primaryLight, fontWeight: '600', textDecorationLine: 'underline' },
});
