import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, typography} from '../theme';

interface FeaturedCardProps {
  title: string;
  description: string;
  onPress: () => void;
  backgroundImage: ImageSourcePropType;
  active?: boolean;
  subtitle?: string;
}

export function FeaturedCard({ 
  title, 
  description, 
  onPress, 
  backgroundImage,
  active,
  subtitle 
}: FeaturedCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, active && styles.containerActive]} 
      onPress={onPress}
    >
      <ImageBackground 
        source={backgroundImage} 
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={[styles.overlay, active && styles.overlayActive]}>
          {active && (
            <View style={styles.activeIndicator}>
              <Ionicons name="alarm" size={14} color="#FFFFFF" />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
          
          <View style={styles.content}>
            <View style={styles.topContent}>
              <Text style={styles.title}>{title}</Text>
              <View style={[
                styles.descriptionContainer,
                active && styles.descriptionContainerActive
              ]}>
                <Text style={styles.description}>{description}</Text>
              </View>
            </View>

            <View style={styles.bottomContent}>
              {subtitle && (
                <View style={styles.subtitleContainer}>
                  <Ionicons name="sunny" size={16} color="#FFFFFF" />
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
              )}
              <View style={styles.button}>
                <Text style={styles.buttonText}>
                  {active ? 'Edit' : 'Set Now'}
                </Text>
                <Ionicons 
                  name={active ? 'create-outline' : 'chevron-forward'} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  containerActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  background: {
    width: '100%',
    height: 150,
  },
  backgroundImage: {
    borderRadius: 24,
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backgroundImage: Platform.select({
      ios: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
      android: undefined,
    }),
  },
  overlayActive: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title3,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    maxWidth: '75%',
  },
  descriptionContainerActive: {
    backgroundColor: 'rgba(0,122,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  description: {
    ...typography.footnote,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.9)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  subtitle: {
    ...typography.caption,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    ...typography.subhead,
    color: '#FFFFFF',
    marginRight: 4,
    fontWeight: '600',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.9)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  activeText: {
    ...typography.caption,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
}); 