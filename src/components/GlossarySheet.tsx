import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const GLOSSARY_TERMS = [
    { key: 'HP', desc: 'Hit Points. The amount of damage a Pokémon can take before fainting.' },
    { key: 'ATK', desc: 'Attack. Determines how much damage a Pokémon deals with physical moves.' },
    { key: 'DEF', desc: 'Defense. Determines how much damage a Pokémon takes from physical moves.' },
    { key: 'SP.A', desc: 'Special Attack. Determines damage dealt by special moves (like Surf or Flamethrower).' },
    { key: 'SP.D', desc: 'Special Defense. Determines damage taken from special moves.' },
    { key: 'SPD', desc: 'Speed. Determines which Pokémon strikes first in battle.' },
    { key: 'KG', desc: 'Kilograms. The metric unit used to measure Pokémon weight.' },
    { key: 'M', desc: 'Meters. The metric unit used to measure Pokémon height.' },
    { key: 'HIDDEN', desc: 'Hidden Ability. A rare ability that a Pokémon typically cannot obtain through normal gameplay.' },
];

export function GlossarySheet({ visible, onClose }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View testID="glossary-sheet" style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>Glossary</Text>
                                    <Text style={styles.subtitle}>Terms & Abbreviations Guide</Text>
                                </View>
                                <TouchableOpacity testID="glossary-close" onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#F0EBE3" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {GLOSSARY_TERMS.map((item, idx) => (
                                    <View
                                        key={item.key}
                                        style={[
                                            styles.termRow,
                                            idx === GLOSSARY_TERMS.length - 1 && styles.lastTermRow,
                                        ]}
                                    >
                                        <View style={styles.termKeyBadge}>
                                            <Text style={styles.termKey}>{item.key}</Text>
                                        </View>
                                        <Text style={styles.termDesc}>{item.desc}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1E1713', // Deep warm charcoal matching theme
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontFamily: 'BricolageGrotesque_800ExtraBold',
        fontSize: 24,
        color: '#F0EBE3',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 13,
        color: 'rgba(240,235,227,0.4)',
        letterSpacing: 0.2,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
    },
    termRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    lastTermRow: {
        borderBottomWidth: 0,
    },
    termKeyBadge: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 54,
        alignItems: 'center',
    },
    termKey: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 11,
        color: '#FFFFFF',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    termDesc: {
        flex: 1,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#D0C9C0',
        lineHeight: 20,
        paddingTop: 2,
    },
});
