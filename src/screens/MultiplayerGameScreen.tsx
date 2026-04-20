import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing, Shadows, FontSizes } from '../theme';

export default function MultiplayerGameScreen() {
    const { 
        hostName, guestName, hostScore, guestScore, 
        currentQuestion, roundResult, gameResult, gameFinished, 
        submitAnswer, disconnect 
    } = useMultiplayerStore();
    const username = useAuthStore(s => s.username);
    const navigation = useNavigation<any>();

    const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        setSelectedAnswerId(null);
        setTimeLeft(15);
    }, [currentQuestion?.id]);

    useEffect(() => {
        if (!currentQuestion || roundResult || selectedAnswerId) return;

        if (timeLeft <= 0) {
            handleAnswerSubmit(-1);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, currentQuestion, roundResult, selectedAnswerId]);

    const handleAnswerSubmit = (optionId: number) => {
        if (selectedAnswerId || roundResult) return;
        setSelectedAnswerId(optionId);
        submitAnswer(optionId);
    };

    const handleExit = () => {
        disconnect();
        navigation.replace('Home');
    };

    const isHost = hostName === username;
    const myName = isHost ? hostName : guestName;
    const myScore = isHost ? hostScore : guestScore;
    const oppName = isHost ? guestName : hostName;
    const oppScore = isHost ? guestScore : hostScore;
    const amIWaitingForOpponent = selectedAnswerId !== null && !roundResult;

    if (gameFinished && gameResult) {
        return (
            <Modal visible={true} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.resultTitle}>Oyun Bitti!</Text>
                        <View style={styles.resultScores}>
                             <Text style={styles.resultScoreText}>{myName}: {myScore}</Text>
                             <Text style={styles.resultScoreText}>{oppName}: {oppScore}</Text>
                        </View>
                        <Text style={styles.winnerText}>
                            {gameResult.winnerId ? (myScore > oppScore ? "Kazandın! 🎉" : "Kaybettin...") : "Berabere!"}
                        </Text>
                        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                            <Text style={styles.exitButtonText}>Ana Sayfaya Dön</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    if (!currentQuestion) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{color: Colors.white, marginTop: 20}}>Sonraki tur yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    // Dynamic Top Bar Progress
    const totalQ = currentQuestion.totalCount || 5;
    const curQ = currentQuestion.index || 1;
    const widthPercentage = (curQ / totalQ) * 100;

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
                   <Text style={styles.exitBtnText}>← Çıkış</Text>
                </TouchableOpacity>
                <Text style={styles.scoreText}>Skor: <Text style={{color: Colors.primary}}>{myScore}</Text></Text>
                <View style={styles.timerPill}>
                   <Text style={[styles.timerText, timeLeft <= 5 && {color: Colors.error}]}>{timeLeft}s</Text>
                </View>
            </View>

            {/* Progress Bar under header */}
            <View style={styles.progressContainer}>
               <View style={styles.progressTrack}>
                   <View style={[styles.progressFill, { width: `${widthPercentage}%` }]} />
               </View>
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: currentQuestion.photo }} style={styles.image} resizeMode="cover" />
            </View>

            <Text style={styles.questionTitle}>Bu hangi araba?</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
               {currentQuestion.options.map((opt: any) => {
                    let isSelected = selectedAnswerId === opt.id;
                    let optionStyle = [styles.optionButton];
                    let textStyle = [styles.optionText];
                    
                    if (roundResult) {
                        if (opt.id === roundResult.correctAnswerId) {
                            optionStyle.push(styles.optionCorrect);
                            textStyle.push(styles.textCorrect);
                        } else if (isSelected) {
                            optionStyle.push(styles.optionWrong);
                            textStyle.push(styles.textWrong);
                        }
                    } else if (isSelected) {
                        optionStyle.push(styles.optionSelected);
                    }

                    return (
                        <TouchableOpacity
                            key={opt.id}
                            style={optionStyle}
                            disabled={!!roundResult || selectedAnswerId !== null}
                            onPress={() => handleAnswerSubmit(opt.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={textStyle}>{opt.content}</Text>
                        </TouchableOpacity>
                    );
               })}
               
               {/* Skip Button */}
               <TouchableOpacity 
                   style={styles.skipButton} 
                   onPress={() => handleAnswerSubmit(-1)} 
                   disabled={!!roundResult || selectedAnswerId !== null}
               >
                   <Text style={styles.skipText}>Pas / Geç</Text>
               </TouchableOpacity>
            </View>
            
            {amIWaitingForOpponent && (
                <View style={styles.waitingOverlay}>
                    <ActivityIndicator size="small" color={Colors.primary} style={{marginRight: 10}}/>
                    <Text style={{color: Colors.white, fontWeight: '600'}}>Rakip bekleniyor...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
    exitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.bgCard },
    exitBtnText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
    scoreText: { color: Colors.textSecondary, fontSize: FontSizes.base, fontWeight: '700' },
    timerPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: '#1F2937' },
    timerText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '800' },
    progressContainer: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg, marginBottom: Spacing['2xl'] },
    progressTrack: { height: 4, backgroundColor: '#1E293B', borderRadius: 2 },
    progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
    imageContainer: { marginHorizontal: Spacing.xl, height: 240, borderRadius: Radius['2xl'], overflow: 'hidden', ...Shadows.lg, marginBottom: Spacing['3xl'] },
    image: { width: '100%', height: '100%' },
    questionTitle: { color: Colors.white, fontSize: FontSizes['2xl'], fontWeight: '800', textAlign: 'center', marginBottom: Spacing['3xl'] },
    optionsContainer: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
    optionButton: { backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
    optionText: { color: Colors.textSecondary, fontWeight: '700', fontSize: FontSizes.base },
    optionSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(14, 165, 233, 0.1)' },
    optionCorrect: { borderColor: Colors.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    textCorrect: { color: Colors.success },
    optionWrong: { borderColor: Colors.error, backgroundColor: 'rgba(244, 63, 94, 0.1)' },
    textWrong: { color: Colors.error },
    skipButton: { backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', marginTop: Spacing.xl },
    skipText: { color: Colors.textMuted, fontWeight: '600', fontSize: FontSizes.base },
    waitingOverlay: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', backgroundColor: '#181F2B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: Colors.primaryDark },
    
    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    modalContent: { backgroundColor: Colors.bgCard, width: '100%', padding: Spacing['3xl'], borderRadius: Radius['2xl'], alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
    resultTitle: { color: Colors.white, fontSize: FontSizes['3xl'], fontWeight: '900', marginVertical: Spacing.md },
    resultScores: { marginVertical: Spacing.lg, alignItems: 'center' },
    resultScoreText: { color: Colors.primaryLight, fontSize: FontSizes.lg, fontWeight: '700', marginBottom: 4 },
    winnerText: { color: Colors.warning, fontSize: FontSizes.xl, fontWeight: '800', marginBottom: Spacing['2xl'] },
    exitButton: { backgroundColor: Colors.primary, width: '100%', padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
    exitButtonText: { color: Colors.white, fontWeight: '800', fontSize: FontSizes.base }
});
