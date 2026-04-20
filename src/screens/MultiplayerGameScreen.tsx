import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    // Reset answer selection whenever a brand-new question arrives
    useEffect(() => {
        setSelectedAnswerId(null);
    }, [currentQuestion?.id]);

    const handleAnswerSubmit = (optionId: number) => {
        if (selectedAnswerId || roundResult) return; // Prevent multiple submits
        setSelectedAnswerId(optionId);
        submitAnswer(optionId);
    };

    const handleExit = () => {
        disconnect();
        navigation.replace('Home');
    };

    // Determine roles for UI
    const isHost = hostName === username;
    const myName = isHost ? hostName : guestName;
    const myScore = isHost ? hostScore : guestScore;
    const oppName = isHost ? guestName : hostName;
    const oppScore = isHost ? guestScore : hostScore;

    if (gameFinished && gameResult) {
        return (
            <Modal visible={true} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Ionicons name="trophy" size={64} color={Colors.warning} />
                        <Text style={styles.resultTitle}>Oyun Bitti!</Text>
                        
                        <View style={styles.resultScores}>
                             <Text style={styles.resultScoreText}>{myName}: {myScore}</Text>
                             <Text style={styles.resultScoreText}>{oppName}: {oppScore}</Text>
                        </View>
                        
                        <Text style={styles.winnerText}>
                            {gameResult.winnerId ? (myScore > oppScore ? "Kazandın!" : "Kaybettin...") : "Berabere!"}
                        </Text>
                        
                        {gameResult.winnerId && myScore > oppScore && (
                            <Text style={styles.rewardText}>+{gameResult.earnedGameMoney} Para Kazandın!</Text>
                        )}
                        
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
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Soru Bekleniyor...</Text>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.scorePill}>
                    <Text style={styles.scoreName}>{myName}</Text>
                    <Text style={styles.scoreValue}>{myScore}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={[styles.scorePill, styles.oppScorePill]}>
                    <Text style={[styles.scoreName, { color: Colors.error }]}>{oppName}</Text>
                    <Text style={styles.scoreValue}>{oppScore}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Soru {currentQuestion.index} / {currentQuestion.totalCount}</Text>
            </View>

            <View style={styles.imageContainer}>
                <Image source={{ uri: currentQuestion.photo }} style={styles.image} resizeMode="cover" />
            </View>

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
                        } else {
                            optionStyle.push(styles.optionDisabled);
                        }
                    } else if (isSelected) {
                        optionStyle.push(styles.optionSelected);
                    }

                    return (
                        <TouchableOpacity
                            key={opt.id}
                            style={optionStyle}
                            disabled={!!roundResult || !!selectedAnswerId}
                            onPress={() => handleAnswerSubmit(opt.id)}
                        >
                            <Text style={textStyle}>{opt.content}</Text>
                        </TouchableOpacity>
                    );
               })}
            </View>

            {selectedAnswerId && !roundResult && (
                <View style={styles.waitingOpponent}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.waitingOppText}>Rakibin cevabı bekleniyor...</Text>
                </View>
            )}
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: Spacing.md, color: Colors.textPrimary, fontWeight: '700' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl },
    scorePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryMuted, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, gap: Spacing.sm },
    oppScorePill: { backgroundColor: Colors.errorMuted },
    scoreName: { color: Colors.primary, fontWeight: '700', fontSize: FontSizes.sm },
    scoreValue: { color: Colors.textPrimary, fontWeight: '900', fontSize: FontSizes.lg },
    vsText: { color: Colors.textMuted, fontWeight: '900', fontSize: FontSizes.xl, fontStyle: 'italic' },
    progressContainer: { alignItems: 'center', marginBottom: Spacing.sm },
    progressText: { color: Colors.textMuted, fontWeight: '700', fontSize: FontSizes.sm },
    imageContainer: { marginHorizontal: Spacing.xl, height: 220, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.md, marginBottom: Spacing['2xl'] },
    image: { width: '100%', height: '100%' },
    optionsContainer: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
    optionButton: { backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.border, alignItems: 'center' },
    optionText: { color: Colors.textPrimary, fontWeight: '600', fontSize: FontSizes.base },
    optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
    optionCorrect: { borderColor: Colors.success, backgroundColor: Colors.successMuted },
    textCorrect: { color: Colors.success },
    optionWrong: { borderColor: Colors.error, backgroundColor: Colors.errorMuted },
    textWrong: { color: Colors.error },
    optionDisabled: { opacity: 0.5 },
    waitingOpponent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, gap: Spacing.sm },
    waitingOppText: { color: Colors.textMuted, fontWeight: '600' },
    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    modalContent: { backgroundColor: Colors.bgCard, width: '100%', padding: Spacing['3xl'], borderRadius: Radius['2xl'], alignItems: 'center', ...Shadows.lg },
    resultTitle: { color: Colors.textPrimary, fontSize: FontSizes['2xl'], fontWeight: '900', marginVertical: Spacing.md },
    resultScores: { marginVertical: Spacing.lg, alignItems: 'center' },
    resultScoreText: { color: Colors.textSecondary, fontSize: FontSizes.lg, fontWeight: '700', marginBottom: 4 },
    winnerText: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight: '800', marginBottom: Spacing.sm },
    rewardText: { color: Colors.success, fontSize: FontSizes.base, fontWeight: '700', marginBottom: Spacing['2xl'] },
    exitButton: { backgroundColor: Colors.primary, width: '100%', padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center' },
    exitButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base }
});
