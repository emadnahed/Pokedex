import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    measure,
    runOnUI,
    useAnimatedRef,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAbilityDetail } from '@/features/pokedex/pokemonSlice';
import { formatPokemonName } from '@/utils/pokemonHelpers';
import { useTheme } from '@/hooks/useTheme';

interface Props {
    abilityName: string;
    isHidden: boolean;
}

export function AbilityAccordion({ abilityName, isHidden }: Props) {
    const dispatch = useAppDispatch();
    const colors = useTheme();
    const [expanded, setExpanded] = useState(false);

    const desc = useAppSelector((state) => state.pokemon.abilityCache[abilityName]);
    const loading = useAppSelector((state) => state.pokemon.abilityLoading[abilityName]);

    const animation = useSharedValue(0);
    const contentHeight = useSharedValue(0);
    const aRef = useAnimatedRef<View>();

    useEffect(() => {
        if (expanded && !desc && !loading) {
            dispatch(fetchAbilityDetail(abilityName));
        }

        // Animate open/close
        animation.value = withSpring(expanded ? 1 : 0, {
            damping: 18,
            stiffness: 150,
            mass: 0.8,
        });
    }, [expanded, desc, loading, abilityName, dispatch, animation]);

    const toggle = () => {
        if (!expanded) {
            runOnUI(() => {
                const measurement = measure(aRef);
                if (measurement) {
                    contentHeight.value = measurement.height;
                }
            })();
        }
        setExpanded(!expanded);
    };

    const chevronStyle = useAnimatedStyle(() => {
        const rotate = interpolate(animation.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        return {
            height: animation.value * contentHeight.value || (expanded ? 'auto' : 0),
            opacity: withTiming(expanded ? 1 : 0, { duration: 250 }),
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: expanded ? 'rgba(255,255,255,0.15)' : colors.border }]}>
            <TouchableOpacity
                style={styles.header}
                onPress={toggle}
                activeOpacity={0.7}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.name}>{formatPokemonName(abilityName)}</Text>
                    {isHidden && <Text style={styles.tag}>HIDDEN</Text>}
                </View>
                <Animated.View style={chevronStyle}>
                    <Ionicons name="chevron-down" size={16} color="rgba(240,235,227,0.5)" />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.contentWrap, contentStyle]}>
                <View ref={aRef} collapsable={false} style={styles.contentInner}>
                    {loading ? (
                        <View style={styles.loaderWrap}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : (
                        <Text style={styles.descText}>{desc}</Text>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontFamily: 'BricolageGrotesque_600SemiBold',
        fontSize: 15,
        color: '#F0EBE3',
        textTransform: 'capitalize',
        letterSpacing: -0.3,
    },
    tag: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 9.5,
        letterSpacing: 1.2,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: 'rgba(240,235,227,0.28)',
    },
    contentWrap: {
        overflow: 'hidden',
    },
    contentInner: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    descText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13.5,
        lineHeight: 20,
        color: 'rgba(240,235,227,0.7)',
        paddingTop: 4,
    },
    loaderWrap: {
        alignItems: 'flex-start',
        paddingTop: 4,
    }
});
